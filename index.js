import { initializeApp } from "@firebase/app";
import { getDatabase, onValue, push, set, ref, get, update, remove, query, orderByChild, limitToLast } from "@firebase/database";
import express from 'express';
import bodyParser from "body-parser";
import mongoose from "mongoose"
import nodemailer from "nodemailer"
import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, updateProfile, sendEmailVerification, onAuthStateChanged, sendPasswordResetEmail } from "@firebase/auth"
const app2 = express()
import http from 'http';
const server = http.createServer(app2);
import { Server, Socket } from 'socket.io'; const io = new Server(server);

const Schema = mongoose.Schema
const userSchema = new Schema({
    uid: {
        type: String,
        require: true
    },
    adi: {
        type: String,
        require: true
    },
    purl: {
        type: String,
        require: true
    },
    ban: {
        type: Boolean,
        require: true
    },
    ed: {
        type: Boolean,
        require: true
    },
    rol: {
        type: String,
        require: false
    }
}, { timestamps: true })

const mesajSchema = new Schema({
    icerik: {
        type: String,
        require: true
    },
    gid: {
        type: String,
        require: true
    },
    goid: {
        type: String,
        require: true
    },
}, { timestamps: true })

const User = mongoose.model('Users', userSchema)

const MesajG = mongoose.model('MesajG', mesajSchema)

server.listen(8080, (Socket) => {
    const starCountRef = ref(db, 'mesajlar/');
    console.log('server çalışıyor');
});
const dbURL = 'mongodb+srv://nr:qwe123@mesajga.pumjten.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(dbURL)
    .then((result) => {
        // app2.listen(process.env.PORT || 8080, console.log('server çalışıyor'))
    }).catch((err) => {
        console.log(err + ' mongodb hatası!');
    });

app2.use(bodyParser.json());
app2.use(bodyParser.urlencoded({ extended: true }))

const firebaseConfig = {
    apiKey: "AIzaSyAjSQqvjP6p-Is0bnVq0A1NrLfWqvSoS-0",
    authDomain: "mesaj-ga.firebaseapp.com",
    projectId: "mesaj-ga",
    databaseURL: "https://mesaj-ga-default-rtdb.europe-west1.firebasedatabase.app/",
    storageBucket: "mesaj-ga.appspot.com",
    messagingSenderId: "440943108984",
    appId: "1:440943108984:web:91ab734527020312199e8d",
    measurementId: "G-XLM7S70XLV"
}


const app = initializeApp(firebaseConfig);
const db = getDatabase(app)


app2.set('view engine', 'ejs');
app2.use(express.static('public'))

var user = null;
var rol = null;
var kkb = 0;

app2.get('/d', (req, res) => {
    User.findOneAndUpdate({ adi: 'admin' }, { adi: 'başrılı' })
        .then((result) => {
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
})

var kkbb = 0;
var uidg = null

io.on('connection', (socket) => {
    console.log('kullanıcı bağlandı');
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        const mesajk = new MesajG({
            icerik: msg,
            gid: uidg,
            goid: user.uid
        })
        mesajk.save()
            .then((result) => {
                console.log(result);
            }).catch((err) => {
                console.log(err);
            });
    });
});

app2.get('/mesaj/:uidg', (req, res) => {
    if (user) {
        uidg = req.params.uidg
        User.find()
            .then((result) => {
                MesajG.find({ $or: [{ gid: uidg, goid: user.uid }, { gid: user.uid, goid: uidg }] })
                    .then((result2) => {
                        console.log(result2);
                        res.render('mesaj', { mesajlar: result2, user: user, users: result })
                    }).catch((err) => {
                        console.log(err);
                    })
                if (kkbb == 0) {
                    const userW = MesajG.watch()
                    userW.on('change', change => {
                        io.send(change.fullDocument);
                        console.log(change.fullDocument);
                    })
                    console.log('dinleniyor');
                }
                kkbb = kkbb + 1;
            }).catch((err) => {
                console.log(err);
            });
    } else {
        res.redirect('/giris-yap')
    }
})

app2.post('/profil', (req, res) => {
    var kbg = 0
    var kadi2 = req.body.ad;
    var rlink = req.body.rlink;
    if (kadi2) {
        User.findOneAndUpdate({ uid: user.uid }, { adi: kadi2 })
            .then((result) => {
                if (result == null) {
                    res.send('hata oluştu!')
                } else {
                    const auth = getAuth();
                    updateProfile(auth.currentUser, {
                        displayName: kadi2
                    }).then(() => {
                        if (!rlink) {
                            res.redirect('/hesap')
                        } else {
                            kbg = + 1
                        }
                    }).catch((err) => {
                        console.log(err);
                    })
                }
            }).catch((err) => {
                res.send('hata oluştu!err')
                console.log(err);
            });
    }
    if (rlink) {
        User.findOneAndUpdate({ uid: user.uid }, { purl: rlink })
            .then((result) => {
                if (result == null) {
                    res.send('hata oluştu!')
                } else {
                    const auth = getAuth();
                    updateProfile(auth.currentUser, {
                        photoURL: rlink
                    }).then(() => {
                        if (kadi2) {
                            kbg = + 1
                        } else {
                            res.redirect('/hesap')
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.redirect('/hesap')
                    })
                }
            }).catch((err) => {
                res.send('hata oluştu!err')
                console.log(err);
            });
    }

    if (kbg == 2) {
        res.redirect('/profil')
        kbg = 0
    }
})

app2.get('/profil', (req, res) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            User.findOne({ uid: user.uid })
                .then((result) => {
                    rol = result.rol;
                    if (result.ed == true) {
                        res.render('profil', { user: user, rol: rol })
                    } else {
                        res.redirect('/mail-dogurla')
                    }
                }).catch((err) => {
                    console.log(err);
                });
        } else {
            res.redirect('giris-yap');
        }
    })
})

app2.get('/cikis-yap', (req, res) => {
    const auth = getAuth();
    if (user) {
        signOut(auth).then(() => {
            res.redirect('/giris-yap');
        }).catch((error) => {
            console.log(error);
            res.send('hata oluştu lütfen daha sonra tekrar deneyin')
        });
    } else {
        res.redirect('/giris-yap');
    }

})

var kmg = 0;
// var rsi = undefined;

var rsi = null;

app2.get('/mail-dogurla', (req, res) => {
    if (user) {
        User.findOne({ uid: user.uid })
            .then((result) => {
                var ed = result.ed;
                if (ed == true) {
                    res.redirect('/hesap')
                } else {
                    if (kmg == 0) {
                        const transporter = nodemailer.createTransport({
                            service: 'hotmail',
                            auth: {
                                user: 'mesaj.ga-2@outlook.com',
                                pass: 'nurislam201031nr'
                            }
                        })
                        rsi = Math.floor(Math.random() * 999999) + 100000;
                        var mailOptions = {
                            from: '"Mesaj GA e-posta doğurlama" <mesaj.ga-2@outlook.com>', // sender address (who sends)
                            to: user.email,
                            subject: 'Mesaj GA ',
                            html: `<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type"><style type="text/css">@import url('https://themes.googleusercontent.com/fonts/css?kit=zG1kcrEyZe-emuvM05Bn4VW9cx0SXZIPZmvVkAldGl1LbhmlahuXTxY1PZSTtGE9S27OZw69yV-Nj9u5UPFguQ');ol{margin:0;padding:0}table td,table th{padding:0}.c13{border-right-style:solid;padding:7.8pt 7.8pt 7.8pt 7.8pt;border-bottom-color:#000000;border-top-width:3pt;border-right-width:3pt;border-left-color:#000000;vertical-align:top;border-right-color:#000000;border-left-width:3pt;border-top-style:solid;background-color:#ffffff;border-left-style:solid;border-bottom-width:3pt;width:141.7pt;border-top-color:#000000;border-bottom-style:solid}.c6{border-right-style:solid;padding:5pt 5pt 5pt 5pt;border-bottom-color:#000000;border-top-width:0pt;border-right-width:0pt;border-left-color:#000000;vertical-align:top;border-right-color:#000000;border-left-width:0pt;border-top-style:solid;background-color:#4a86e8;border-left-style:solid;border-bottom-width:0pt;width:585.4pt;border-top-color:#000000;border-bottom-style:solid}.c5{border-right-style:solid;padding:5pt 5pt 5pt 5pt;border-bottom-color:#00ffff;border-top-width:0pt;border-right-width:0pt;border-left-color:#00ffff;vertical-align:middle;border-right-color:#00ffff;border-left-width:0pt;border-top-style:solid;background-color:#444444;border-left-style:solid;border-bottom-width:0pt;width:595.4pt;border-top-color:#00ffff;border-bottom-style:solid}.c14{border-right-style:solid;padding:5pt 5pt 5pt 5pt;border-bottom-color:#000000;border-top-width:0pt;border-right-width:0pt;border-left-color:#000000;vertical-align:top;border-right-color:#000000;border-left-width:0pt;border-top-style:solid;border-left-style:solid;border-bottom-width:0pt;width:595.4pt;border-top-color:#000000;border-bottom-style:solid}.c12{color:#000000;font-weight:700;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Arial";font-style:normal}.c8{color:#000000;font-weight:500;text-decoration:none;vertical-align:baseline;font-size:17pt;font-family:"Comfortaa";font-style:normal}.c10{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;height:11pt}.c9{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Arial";font-style:normal}.c1{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:center;height:11pt}.c17{-webkit-text-decoration-skip:none;font-weight:700;text-decoration:underline;text-decoration-skip-ink:none;font-size:17pt;font-family:"Comfortaa"}.c2{padding-top:0pt;padding-bottom:0pt;line-height:1.0;text-align:center;height:11pt}.c24{padding-top:0pt;padding-bottom:3pt;line-height:1.0;page-break-after:avoid;text-align:center}.c3{padding-top:0pt;padding-bottom:0pt;line-height:1.0;text-align:center}.c20{color:#7effff;font-weight:400;font-size:31pt;font-family:"Lobster"}.c4{margin-left:auto;border-spacing:0;border-collapse:collapse;margin-right:auto}.c0{font-size:23pt;font-family:"Caveat";color:#d9d9d9;font-weight:600}.c21{color:#000000;font-weight:700;font-size:17pt;font-family:"Comfortaa"}.c26{-webkit-text-decoration-skip:none;text-decoration:underline;text-decoration-skip-ink:none}.c22{text-decoration:none;vertical-align:baseline;font-style:italic}.c7{background-color:#00a88f00;max-width:595.4pt;padding:0pt 0pt 0pt 0pt}.c15{text-decoration:none;vertical-align:baseline;font-style:normal}.c25{font-size:17pt;font-family:"Comfortaa";font-weight:500}.c11{font-size:29pt;font-family:"Comfortaa";font-weight:700}.c16{color:black;text-decoration:inherit}.c23{height:50.9pt}.c18{height:0pt}.c19{text-indent:-70.9pt}.title{padding-top:0pt;color:#000000;font-size:26pt;padding-bottom:3pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}.subtitle{padding-top:0pt;color:#666666;font-size:15pt;padding-bottom:16pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}li{color:#000000;font-size:11pt;font-family:"Arial"}p{margin:0;color:#000000;font-size:11pt;font-family:"Arial"}h1{padding-top:20pt;color:#000000;font-size:20pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h2{padding-top:18pt;color:#000000;font-size:16pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h3{padding-top:16pt;color:#434343;font-size:14pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h4{padding-top:14pt;color:#666666;font-size:12pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h5{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h6{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;font-style:italic;orphans:2;widows:2;text-align:left}</style></head><body class="c7 doc-content"><p class="c10 c19"><span class="c9"></span></p><p class="c10"><span class="c9"></span></p><a id="t.6f98e2c1f1d4c5fbb4821c5446b2e1fa06221884"></a><a id="t.0"></a><table class="c4"><tr class="c23"><td class="c5" colspan="1" rowspan="1"><p class="c24 title" id="h.yv06plkxod4v"><span class="c15 c20">Mesaj GA</span></p></td></tr></table><p class="c1"><span class="c9"></span></p><a id="t.2684efd9acce6bb8d11b71425064e3131c73b207"></a><a id="t.1"></a><table class="c4"><tr class="c18"><td class="c14" colspan="1" rowspan="1"><p class="c3"><span class="c21 c22">Merhaba say&#305;n kullan&#305;c&#305;m&#305;z,</span></p><p class="c2"><span class="c15 c21"></span></p><p class="c3"><span class="c17"><a class="c16" href="https://mesaj.ga">Mesaj GA</a></span><span class="c25">&nbsp;kulland&#305;&#287;&#305;n&#305;z e posta adresini (${user.email}) do&#287;rulamak i&ccedil;in a&#351;a&#287;&#305;daki kodu girin.</span></p></td></tr></table><p class="c1"><span class="c9"></span></p><a id="t.f8453a92aba7ea9757d11151d1da801040de3653"></a><a id="t.2"></a><table class="c4"><tr class="c18"><td class="c13" colspan="1" rowspan="1"><p class="c3"><span class="c11">${rsi}</span></p></td></tr></table><p class="c1"><span class="c9"></span></p><p class="c1"><span class="c9"></span></p><a id="t.ecfa84f8f1b35a78519d87797ffb287ffc87f78f"></a><a id="t.3"></a><table class="c4"><tr class="c18"><td class="c14" colspan="1" rowspan="1"><p class="c3"><span class="c8">Bu kodu siz talep etmediyseniz bu postay&#305; dikkate almay&#305;n.</span></p><p class="c2"><span class="c8"></span></p><p class="c2"><span class="c8"></span></p><a id="t.1f21faa79b18276cd8cfa66ac41948c7885d4b8f"></a><a id="t.4"></a><table class="c4"><tr class="c18"><td class="c6" colspan="1" rowspan="1"><p class="c3"><span class="c0">Mesaj GA&rsquo;y&#305; ziyaret etmek i&ccedil;in </span><span class="c0 c26"><a class="c16" href="https://mesaj.ga">buraya</a></span><span class="c0">&nbsp;t&#305;klay&#305;n.</span></p></td></tr></table><p class="c2"><span class="c8"></span></p></td></tr></table><p class="c1"><span class="c9"></span></p></body></html>`
                        }
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                return console.log(error);
                            } else {
                                console.log('Mail gönderildi!');
                                kmg = kmg + 1;
                                res.render('ed', { user: user })
                            }
                        })
                    }
                }
            }).catch((err) => {
                console.log(err);
            })
    } else {
        res.redirect('/giris-yap')
    }
})

app2.post('/mail-dogurla', (req, res) => {
    var edkod = req.body.kod;
    console.log(rsi);
    if (Number(edkod) == Number(rsi)) {
        try {
            User.updateOne({ uid: user.uid }, { ed: true })
                .then((result) => {
                    res.redirect('/hesap')
                }).catch((err) => {
                    res.send(err)
                });
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log('hatalı kod');
    }
})

app2.post('/kayit-ol', (req, res) => {
    const auth = getAuth();
    const kadi = req.body.kadi;
    const email = req.body.email;
    const pass1 = req.body.pass;
    const pass2 = req.body.pass2;
    if (pass1 == pass2) {
        const auth = getAuth();
        const password = String(pass1)
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                user = userCredential.user;
                const users2 = new User({
                    uid: user.uid,
                    adi: kadi,
                    purl: 'https://cdn-icons-png.flaticon.com/512/3001/3001758.png',
                    ed: false,
                    ban: false,
                    rol: 'üye'
                })
                users2.save()
                    .then((result) => {
                        console.log(result);
                    }).catch((err) => {
                        console.log(err);
                    });
                const auth = getAuth();
                updateProfile(auth.currentUser, {
                    displayName: kadi, photoURL: 'https://cdn-icons-png.flaticon.com/512/3001/3001758.png'
                }).then(() => {
                    console.log('başarılı');
                    console.log('adı: ', kadi);
                    res.redirect('/hesap')
                    return res.status(200)
                }).catch((error) => {
                    res.redirect('/hesap')
                    console.log(error);
                });
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                console.log(errorCode);
                const errorMessage = error.message;
                console.log(errorMessage);
                if (errorCode == "auth/email-already-in-use") {
                    res.render('kayit-ol', { hata: 'Bu e posta adresi daha önce alınmıştır.' });
                }
            });
    } else {
        res.render('kayit-ol', { hata: 'Girdiğiniz şifreler birbiri ile aynı değil!' })
    }
})

app2.get('/kayit-ol', (req, res) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            res.redirect('/hesap');
        } else {
            res.render('kayit-ol', { hata: '' })
        }
    })
})

app2.get('/giris-yap', (req, res) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            res.redirect('/hesap');
        } else {
            res.render('giris-yap');
        }
    })
})

app2.get('/list', (req, res) => {
    const listAllUsers = (nextPageToken) => {
        // List batch of users, 1000 at a time.
        getAuth()
            .listUsers(1000, nextPageToken)
            .then((listUsersResult) => {
                listUsersResult.users.forEach((userRecord) => {
                    console.log('user', userRecord.toJSON());
                });
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    listAllUsers(listUsersResult.pageToken);
                }
            })
            .catch((error) => {
                console.log('Error listing users:', error);
            });
    };
    // Start listing users from the beginning, 1000 at a time.
    listAllUsers();
})

app2.get('/giris-yap/sifremi-unuttum', (req, res) => {
    res.render('su')
})

app2.post('/giris-yap/sifremi-unuttum', (req, res) => {
    const email = req.body.email;

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            res.render('sub')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.render('suh')
        });
})

app2.post('/giris-yap', (req, res) => {

    const email = req.body.email;
    const password = req.body.pass;
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            user = userCredential.user;
            console.log(user);
            res.redirect('/hesap')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            res.render('giris-yap-esh')
        });
})

app2.get('/d', (req, res) => {
    console.log(Date.now())
})

app2.get('/hesap', (req, res) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            User.findOne({ uid: user.uid })
                .then((result) => {
                    User.find({ ed: true }).sort({ createdAt: -1 })
                        .then((result2) => {
                            var ed = result.ed;
                            if (ed == true) {
                                res.render('hesap', { user: result, users: result2, msg: null })
                            } else {
                                res.redirect('/mail-dogurla')
                            }
                        }).catch((err) => {

                        });

                }).catch((err) => {
                    console.log(err);
                });
        } else {
            res.redirect('giris-yap');
        }
    })
})

app2.post('/hesap', (req, res) => {
    const auth = getAuth();
    signOut(auth).then(() => {
        console.log('çıkış yapıldı');
        res.redirect('/')
    }).catch((error) => {
        console.log(error);
    });
})

app2.get('/', (req, res) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            res.redirect('/hesap');
        } else {
            res.render('index')
        }
    })
})


app2.post('/create', (req, res) => {
    var veri = req.body.veri;
    try {
        console.log('veri: ', veri);
        set(ref(db, 'mesajlar/' + '9lZ2zIF1GBSGMZmeEQJnX3b9LZ73' + '/' + 'IneYelzS0hTGyWQcTxB780mUale2/' + veri), {
            veri: veri,
            tarih: Date.now()
        })
        return res.status(200)
    } catch (err) {
        console.log(err);
    }
})

app2.get('/get', (req, res) => {
    get(ref(db, 'users/'))
        .then((ss) => {
            if (ss.exists()) {
                const expectedFormatRes = Object.values(ss.val());
                console.log(expectedFormatRes);
                return res.status(200).json({
                    Result: expectedFormatRes
                })
            } else {
                return res.status(404).json({
                    Result: 'veri bulunamadı'
                })
            }
        }).catch((err) => {
            console.log(err);
        });
})

app2.post('/bv', (req, res) => {
    var veria = req.body.veri;

    try {
        get(ref(db, 'mesajlar/' + veria))
            .then((ss) => {
                console.log(ss.val());
                if (ss.exists()) {
                    return res.status(200).json({
                        Result: ss.val()
                    })
                } else {
                    return res.status(404).json({
                        Result: 'veri bulunamadı'
                    })
                }
            }).catch((err) => {
                console.log(err);
            });
    } catch (err) {
        console.log(err);
    }

})

app2.put('/up', (req, res) => {
    var veri1 = req.body.veri;

    try {
        var up = {};
        up[`veriler/${veri1}/veri`] = veri1;
        up[`veriler/${veri1}/tarih`] = new Date().getFullYear();

        update(ref(db), up)
            .then(() => {
                return res.status(200).json({
                    msg: 'başarılı'
                })
            }).catch((err2) => {
                console.log(err2);
            });
    } catch (err) {
        console.log(err);
    }
})

app2.delete('/delete', (req, res) => {
    var vari = req.body.veri;

    try {
        remove(ref(db, "mesajlar/" + '9lZ2zIF1GBSGMZmeEQJnX3b9LZ73/IneYelzS0hTGyWQcTxB780mUale2/' + vari))
            .then(() => {
                return res.status(200).json({
                    msg: 'başarılı!'
                })
            }).catch((err) => {
                console.log(err)
                return res.status(500).json({
                    msg: 'Hata oluştu!'
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Hata oluştu!'
        })
    }
})

