const config = require('../config')

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const cardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    CVV: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    attachedIBAN: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    sold: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})


const Card = mongoose.model('Card', cardSchema)

module.exports = Card