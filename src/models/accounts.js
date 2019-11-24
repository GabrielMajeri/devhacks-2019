const config = require('../config')

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    IBAN: {
        type: String,
        required: true,
        unique: true
    },
    bank: {
        type: String,
        required: true
    },
    transactions: [{
        vendor: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }],
    sold: {
        type: Number,
        required: true,
        default: 0
    },
    cards: [{
        id: mongoose.Schema.Types.ObjectId
    }],
    economy: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
})


const Account = mongoose.model('Account', accountSchema)

module.exports = Account