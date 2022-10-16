import { mongoose } from "mongoose";
const Scheme = mongoose.Scheme;

const userSchema = new Scheme({
    uid: {
        type: Number,
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
    ed: {
        type: Boolean,
        require: true
    },
    ban: {
        type: Boolean,
        require: true
    },
    rol: {
        type: String,
        require: true
    }
}, { timestamps: true })

const User = mongoose.model('Users', userSchema)
module.exports = User