import express from 'express';
import ejs from "ejs";
import { initializeApp } from "firebase/app";
import http from 'http';
import { Server } from "socket.io";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { async } from '@firebase/util';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import multer from 'multer';
import cors from 'cors';
import { ObjectId as ObjectID } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config()
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 8080;
import { v4 as uuidv4 } from 'uuid';
import { ExpressPeerServer } from 'peer'
const peer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peer);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/ara', (req, res) => {
    res.send(uuidv4());
})

server.listen(process.env.PORT || 8080, () => {
    console.log('server çalışıyor');
});

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

const app2 = initializeApp(firebaseConfig);

console.log(process.env.MONGODB_URL);
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("mongodb'ye bağlanıldı");
    }).catch((err) => {
        console.log(err);
    });

const userSchema = new mongoose.Schema({
    mail: {
        type: String,
        required: true,
        unique: true,
    },
    sifre: {
        type: String,
        required: true,
    },
    ad: {
        type: String,
        required: true,
        unique: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    ed: {
        type: Boolean,
        required: true,
    }
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt()
    this.sifre = await bcrypt.hash(this.sifre, 10)
    next()
})

const Users = new mongoose.model('user', userSchema)

const rehberSchema = new mongoose.Schema({
    rehberId: {
        type: String,
        required: true,
        unique: false,
    },
    rehberMail: {
        type: String,
        required: true,
        unique: false,
    },
    rehberAd: {
        type: String,
        unique: false,
        required: true,
    },
    rehberImgUrl: {
        type: String,
        required: true,
        unique: false,
    },
    eklenenId: {
        type: String,
        required: true,
        unique: false,
    },
    eklenenMail: {
        type: String,
        required: true,
        unique: false,
    },
    eklenenAd: {
        type: String,
        required: true,
        unique: false,
    },
    eklenenImgUrl: {
        type: String,
        required: true,
        unique: false,
    },
})

const Rehber = new mongoose.model('rehber', rehberSchema)

const mesajSchema = new mongoose.Schema({
    gonderenId: {
        type: String,
        required: true,
    },
    gidenId: {
        type: String,
        required: true,
    },
    icerik: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const Mesaj = new mongoose.model('mesaj', mesajSchema)

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json());
app.use(cors());

Mesaj.watch().on('change', (data) => {
    console.log(data);
    if (data.operationType == 'insert') {
        io.emit('message', data.fullDocument);
    }
});

app.get('/ara-sesli/:userAranan', (req, res) => {
    res.send('bu özellik gelmedi!')
})

app.get('/ara-camera/:userAranan', (req, res) => {
    if (req.cookies.userOturum != undefined) {        
        Users.findOne({ _id: req.params.userAranan })
            .then((result) => {
                io.emit('ara-bildirim', { kim: req.cookies.userOturum, kime: result, camera: true })
                res.render('camliAra', { title: 'Arama', RoomId: req.path, userk: result, user: req.cookies.userOturum });
            }).catch((err) => {
                console.log(err);
                res.send('Bir hata oluştu lütfen tekrar denyin!')
            });
    } else {
        res.render('/giris-yap')
    }
})

app.get('/', (req, res) => {
    if (req.cookies.userOturum == undefined) {
        res.render('index', { title: 'Anasayfa' })
    } else {
        res.redirect('/hesap')
    }
})

// app.get('/ara/:room', (req, res) => {
//     if (req.cookies.userOturum == undefined) {
//         res.redirect('/giris-yap')
//     } else {
//         res.render('index2', { title: 'Arama', RoomId: req.params.room });
//     }
// });

io.on("connection", (socket) => {
    socket.on('geri-cevir', (id) => {
        io.emit('geri cevir', id._id)
    })
})

io.on("connection", (socket) => {
    socket.on('newUser', (id, room) => {
        socket.join(room);
        socket.to(room).emit('userJoined', id);
        socket.on('disconnect', () => {
            socket.to(room).emit('userDisconnect', id);
        })
    })
})

app.get('/kayit-ol', (req, res) => {
    if (req.cookies.userOturum == undefined) {
        res.render('kayit-ol', { title: 'Kayıt ol', hata: undefined })
    } else {
        res.redirect('/hesap')
    }
})

let userOturum = undefined;

app.post('/kayit-ol', (req, res) => {
    if (req.cookies.userOturum == undefined) {
        console.log(req.body)
        const user = new Users({
            mail: req.body.email,
            sifre: req.body.sifre,
            ad: req.body.ad,
            imgUrl: "https://cdn.jsdelivr.net/gh/Nurislam-Lord/images@main/user.png",
            ed: false,
        })
        user.save()
            .then((result) => {
                console.log('Kayıt olundu!');
                res.cookie('userOturum', result);
                res.redirect('/hesap')
            }).catch((err) => {
                console.log(err);
            });
    } else {
        res.redirect('/hesap')
    }
})

app.get('/giris-yap', (req, res) => {
    if (req.cookies.userOturum == undefined) {
        res.render('giris-yap', { title: 'Giriş yap', hata: undefined })
    } else {
        res.redirect('/')
    }
})

let hash = undefined

app.post('/giris-yap', async (req, res) => {
    if (req.cookies.userOturum == undefined) {
        console.log(req.body.email);
        await Users.findOne({ mail: req.body.email })
            .then(async (result) => {
                if (result) {
                    const vailedPass = await bcrypt.compare(req.body.sifre, result.sifre);
                    if (vailedPass) {
                        console.log('Giriş yapıldı!');
                        res.cookie('userOturum', result);
                        console.log(result);
                        res.redirect('/hesap')
                    } else {
                        res.render('giris-yap', { title: 'Giriş Yap', hata: 'Girdiğiniz e-posta veya şifre yanlış' })
                    }
                } else {
                    res.render('giris-yap', { title: 'Giriş Yap', hata: 'Girdiğiniz e-posta veya şifre yanlış' })
                }
            }).catch((err) => {
                console.log(err);
            });
    } else {
        res.redirect('/hesap')
    }

})

app.get('/hesap', (req, res) => {
    if (req.cookies.userOturum != undefined) {
        if (req.cookies.userOturum.ed == false) {
            res.redirect('/mail-dogurla')
        } else {
            Rehber.find({ $or: [{ eklenenMail: req.cookies.userOturum.mail }, { rehberMail: req.cookies.userOturum.mail }] })
                .then((result) => {
                    res.render('hesap', { title: 'Sohbet', user: req.cookies.userOturum, users: result })
                }).catch((err) => {
                    console.log(err);
                });
        }
    } else {
        res.redirect('/giris-yap')
    }
})

app.post('/hesap', (req, res) => {
    if (req.cookies.userOturum != undefined) {
        console.log(req.body);
        Rehber.findOne({ eklenenMail: req.cookies.userOturum.mail, rehberMail: req.body.mail })
            .then((result1) => {
                Rehber.findOne({ rehberMail: req.cookies.userOturum.mail, eklenenMail: req.body.mail })
                    .then((result2) => {
                        console.log(result2);
                        if (result2 == null) {
                            if (result1 == null) {
                                Users.findOne({ mail: req.body.mail })
                                    .then((result) => {
                                        if (result != undefined) {
                                            let rehber = new Rehber({
                                                rehberId: `${req.cookies.userOturum._id}`,
                                                rehberMail: `${req.cookies.userOturum.mail}`,
                                                rehberAd: `${req.cookies.userOturum.ad}`,
                                                rehberImgUrl: `${req.cookies.userOturum.imgUrl}`,
                                                eklenenId: `${result._id}`,
                                                eklenenMail: `${result.mail}`,
                                                eklenenAd: `${result.ad}`,
                                                eklenenImgUrl: `${result.imgUrl}`
                                            })

                                            rehber.save()
                                                .then((result) => {
                                                    res.redirect('/hesap')
                                                }).catch((err) => {
                                                    console.log(err)
                                                });
                                        } else {
                                            res.send('kullanıcı bulunamadı!')
                                        }
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                            } else {
                                res.send('Bu kullanıcı sizde kayıtlı!')
                            }
                        } else {
                            res.send('Bu kullanıcı sizde kayıtlı!')
                        }

                    }).catch((err) => {

                    });

            }).catch((err) => {
                console.log(err);
            });

    } else {
        res.redirect('/giris-yap')
    }
})

app.get('/mail-dogurla', (req, res) => {
    if (req.cookies.userOturum != undefined) {
        if (req.cookies.userOturum.ed == true) {
            res.redirect('/hesap')
        } else {
            res.render('mail-dogurla', { title: 'Epostanı doğurla', hata: undefined, user: req.cookies.userOturum })
        }
    } else {
        res.redirect('/giris-yap')
    }

})

app.post('/mail-dogurla', (req, res) => {
    if (req.cookies.kod == req.body.kod) {
        Users.findOneAndUpdate({ _id: req.cookies.userOturum._id }, { ed: true }, { new: true })
            .then((result) => {
                res.clearCookie('userOturum')
                res.cookie('userOturum', result)
                res.redirect('/hesap')
            }).catch((err) => {
                console.log(err);
            });
    } else {
        console.log(`post: ${req.body.kod}, asıl kod: ${req.cookies.kod}`);
        res.send('eposta doğurlanamadı')
    }
})

app.get('/ayarlar', (req, res) => {
    if (req.cookies.userOturum != undefined) {
        res.render('ayarlar', { user: req.cookies.userOturum, title: 'Profil' })
    } else {
        res.redirect('/giris-yap')
    }
})

app.post('/ayarlar', async (req, res) => {
    if (req.cookies.userOturum != undefined) {
        if (req.body.ad != undefined) {
            await Users.findOneAndUpdate({ _id: req.cookies.userOturum._id }, { ad: req.body.ad }, { new: true })
                .then(async (result) => {
                    console.log(result);
                    console.log(req.body.ad);
                    res.clearCookie('userOturum');
                    res.cookie('userOturum', result)
                    console.log(req.cookies.userOturum.ad)
                    Rehber.update({ rehberId: req.cookies.userOturum._id }, { rehberAd: req.body.ad }, { multi: true })
                        .then((result) => {
                            if (result != undefined) {
                                Rehber.update({ eklenenId: req.cookies.userOturum._id }, { eklenenAd: req.body.ad }, { multi: true, upsert: true })
                                    .then((result) => {
                                        res.redirect('/hesap')
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                }).catch((err) => {
                    console.log(err);
                });
        } else if (req.body.imgUrl != undefined) {
            await Users.findOneAndUpdate({ _id: req.cookies.userOturum._id }, { imgUrl: req.body.imgUrl }, { new: true })
                .then(async (result) => {
                    console.log(result);
                    console.log(req.body.ad);
                    res.clearCookie('userOturum');
                    res.cookie('userOturum', result)
                    console.log(req.cookies.userOturum.ad)
                    Rehber.updateMany({ rehberId: req.cookies.userOturum._id }, { rehberImgUrl: req.body.imgUrl }, { multi: true })
                        .then((result) => {
                            if (result != undefined) {
                                Rehber.updateMany({ eklenenId: req.cookies.userOturum._id }, { eklenenImgUrl: req.body.imgUrl }, { multi: true, upsert: true })
                                    .then((result) => {
                                        res.redirect('/hesap')
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                })
        }
    } else {
        res.redirect('/giris-yap')
    }
})

io.on('connection', (socket) => {
    console.log('dinleniliyor');
    socket.on('chat message', (msg) => {
        console.log('mesaj: ' + msg.icerik);
        let mesaj = new Mesaj({
            gonderenId: msg.gonderenId,
            gidenId: msg.gidenId,
            icerik: msg.icerik
        });

        mesaj.save()
            .then((result) => {
                console.log('mesaj gönderildi');
            }).catch((err) => {
                console.log(err);
            });
    });
})

app.get('/mesaj/:uid', (req, res) => {
    if (req.cookies.userOturum != undefined) {
        if (req.cookies.userOturum.ed == false) {
            res.redirect('/mail-dogurla')
        } else {
            let id = (req.params.uid).trim()
            console.log(`'${id}'`);
            Users.findById(id, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Result : ", docs);
                    Rehber.find({ $or: [{ eklenenMail: req.cookies.userOturum.mail }, { rehberMail: req.cookies.userOturum.mail }] })
                        .then(async (result) => {
                            Mesaj.find({ $or: [{ gonderenId: req.cookies.userOturum._id, gidenId: docs._id }, { gonderenId: docs._id, gidenId: req.cookies.userOturum._id }] })
                                .then((result2) => {
                                    res.cookie('ksy', 1);
                                    res.render('mesaj', { title: 'Mesajlaş', user: req.cookies.userOturum, users: result, userk: docs, mesajlar: result2 })
                                }).catch((err) => {
                                    console.log(err);
                                });
                        }).catch((err) => {
                            console.log(err);
                        });
                }
            });
        }
    } else {
        res.redirect('/giris-yap')
    }
})

app.get('/profil/:mail', (req, res) => {
    Users.findOne({ mail: req.params.mail })
        .then((result) => {
            if (result.ed == true) {
                res.render('Profil', { title: `${result.ad} | Profil`, profil: result })
            } else {
                res.render('404', { title: 'Sayfa bulunamadı (404)' })
            }
        }).catch((err) => {
            console.log(err);
        })
})

app.get('/deneme', (req, res) => {
    res.render('kabul-red', { title: "deneme" })
})

app.all('*', (req, res) => {
    res.render('404', { title: 'Sayfa bulunamadı (404)' })
});