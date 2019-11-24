const config = require('../config')

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const transactionSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
})


const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction