const express = require('express')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')

const router = new express.Router()

router.get("/", async (req, res) => {
    res.send("Hello")
})

router.post("/register", async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({
            user,
            token
        })
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email,
        })

        const valid = await bcrypt.compare(req.body.password, user.password)

        if (!valid) {
            throw new Error("Invalid password or email")
        }

        const token = await user.generateAuthToken()

        res.status(200).send({
            user,
            token
        })

    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.post("/account", async (req, res) => {
    try {
        const user = await User.findById(req.body._id)
        const iban = await user.generateIBAN()

        user.accounts = user.accounts.concat({
            name: req.params.accountName,
            IBAN: iban,
            balance: 0,
            currency: req.params.currency

        })

        res.status(201).send(user)
    } catch (error) {

    }
})

module.exports = router