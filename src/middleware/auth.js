const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const config = require('../config')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '')
        const decoded = jwt.verify(token, config.secret)

        const user = await User.findOne({
            _id: decoded._id,
            'authTokens.token': token
        })

        if (!user) {
            throw new Error('This should not be happening')
        }

        req.token = token;
        req.user = user;
    } catch (error) {
        res.status(404).send({
            err: error.message
        })
    }
}

module.exports = auth