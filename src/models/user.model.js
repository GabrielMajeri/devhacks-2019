const config = require('../config')

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.connect(config.dbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (!err)
        console.log("Succesfully connected to MongoDB")
    else
        console.log("Could not connect to MongoDB: " + err)
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new error("Invalid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    authTokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    accounts: [{
        IBAN: {
            type: String,
            required: true,
            unique: true
        },
        currency: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        bank: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user.id.toString()
    }, config.secret, {
        expiresIn: config.tokenDuration
    })

    user.authTokens = user.authTokens.concat({
        token
    })

    await user.save()

    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.authTokens;

    return userObject;
}

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User