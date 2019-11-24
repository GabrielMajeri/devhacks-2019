const config = require('../config')

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const rewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    achieved: {
        type: Boolean,
        required: true,
        default: false
    }
})


const Reward = mongoose.model('Reward', rewardSchema)

module.exports = Reward