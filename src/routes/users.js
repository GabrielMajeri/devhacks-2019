const express = require('express')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const Transaction = require('../models/transaction.model')
const Account = require('../models/accounts')
const Card = require("../models/cards")

const router = new express.Router()

router.get("/", async (req, res) => {
    res.send("Hello")
})

// router.post("/register", async (req, res) => {
//     try {
//         const user = new User(req.body)
//         await user.save()
//         const token = await user.generateAuthToken()

//         res.status(201).send({
//             user,
//             token
//         })
//     } catch (error) {
//         res.status(500).send({
//             err: error.message
//         })
//     }
// })

// router.post("/login", async (req, res) => {
//     try {
//         const user = await User.findOne({
//             email: req.body.email,
//         })

//         const valid = await bcrypt.compare(req.body.password, user.password)

//         if (!valid) {
//             throw new Error("Invalid password or email")
//         }

//         const token = await user.generateAuthToken()

//         res.status(200).send({
//             user,
//             token
//         })

//     } catch (error) {
//         res.status(500).send({
//             err: error.message
//         })
//     }
// })

router.post("/accounts", async (req, res) => {
    try {
        // const user = await User.findById(req.body._id)
        const account = new Account({
            name: req.body.accountName,
            IBAN: req.body.IBAN,
            bank: req.body.bank
        })

        const card = new Card({
            name: req.body.cardName,
            number: req.body.cardNumber,
            CVV: req.body.CVV,
            bank: req.body.bank,
            attachedIBAN: req.body.IBAN,
            expiryDate: req.body.expires,
            sold: account.sold
        })

        await card.save()

        account.cards = account.cards.concat({
            id: card._id
        })

        // user.accounts = user.accounts.concat({
        //     name: req.body.accountName,
        //     IBAN: req.body.IBAN,
        //     bank: req.body.bank
        // })

        await account.save()

        res.status(201).send({
            account,
            card
        })
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/accounts", async (req, res) => {
    try {
        const accounts = await Account.find()

        res.status(200).send(accounts)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/cards", async (req, res) => {
    try {
        const cards = await Card.find()

        res.status(200).send(cards)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/cards/:IBAN", async (req, res) => {
    try {
        const cards = await Card.find({
            attachedIBAN: req.params.IBAN
        })

        res.status(200).send(cards)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.post("/transactions/:IBAN", async (req, res) => {
    try {
        const accounts = await Account.find({
            IBAN: req.params.IBAN
        })

        if (!accounts) {
            return res.status(404).send()
        }

        accounts.transactions = accounts.transactions.concat({
            vendor: req.body.vendor,
            value: req.body.value
        })

        accounts.sold = accounts.sold - req.body.value

        await accounts.save()

        res.status(201).send(accounts)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

// router.post("/transactions", async (req, res) => {
//     try {
//         const from = "00000000000000"
//         const to = "00000000000000"
//         const value = 10

//         const transaction = new Transaction({
//             from,
//             to,
//             value
//         })

//         await transaction.save()
//     } catch (error) {

//     }
// })

module.exports = router