const express = require('express')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const Transaction = require('../models/transaction.model')
const Account = require('../models/accounts')
const Card = require("../models/cards")
const config = require("../config.json")
const Reward = require("../models/rewards")
const client = require('twilio')(config.twilioID, config.twilioAuth)
const path = require('path')

const root = path.join(__dirname, '../')

const router = new express.Router()

router.get("/", async (req, res) => {
    res.send("Hello")
})

router.post("/call", async (req, res) => {
    try {
        console.log(config.twilioAuth, config.twilioID)
        client.calls.create({
            url: 'https://handler.twilio.com/twiml/EH625accdd1357096a9c8bebe57f15927b',
            to: '+40741144484',
            from: '+12513330666'
        }).then(call => console.log(call.sid))
        res.send("Call successful")
    } catch (error) {

    }
})

router.get("/rewards", async (req, res) => {
    try {
        const rewards = await Reward.find({})
        res.status(200).send(rewards)
    } catch (error) {

    }
})

router.patch("/rewards/:id", async (req, res) => {
    try {
        const rewards = await Reward.findById(req.params.id)
        rewards.achieved = true
        await rewards.save()
        res.status(203).send(rewards)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.post("/rewards", async (req, res) => {
    try {
        const rewards = new Reward({
            name: req.body.name,
            points: req.body.points
        })

        await rewards.save()

        res.status(201).send(rewards)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/vadim.mp3", async (req, res) => {
    res.setHeader('Content-Type', 'audio/mpeg')
    res.sendFile("vadim.mp3", {
        root
    })
})

router.get("/callxml", async (req, res) => {
    res.sendFile("call.xml", {
        root
    })
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

        if (req.body.cardName && req.body.cardNumber && req.body.CVV && req.body.expires) {
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
        }



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
        const accounts = await Account.findOne({
            IBAN: req.params.IBAN
        })

        const toAccounts = await Account.findOne({
            IBAN: req.body.to_IBAN
        })

        if (!accounts) {
            return res.status(404).send()
        }

        const date = new Date()

        const value = Number(req.body.value)
        let closestValue = Math.floor(value)

        // round
        while (closestValue % 5 !== 0) {
            closestValue = closestValue + 1
        }

        const diff = closestValue - value

        accounts.transactions = accounts.transactions.concat({
            vendor: req.body.vendor,
            value: req.body.value,
            date
        })

        if (diff > 0) {
            accounts.transactions = accounts.transactions.concat({
                vendor: "Round up " + diff,
                value: diff,
                date
            })

            const savings = await Account.findOne({
                IBAN: "00000000000001"
            })

            savings.transactions = savings.transactions.concat({
                vendor: "SAVINGS | Round up " + diff,
                value: diff,
                date
            })

            savings.sold = savings.sold + diff

            await savings.save()
        }



        if (toAccounts) {
            toAccounts.transactions = toAccounts.transactions.concat({
                vendor: "Money from: " + accounts.IBAN + " " + accounts.name,
                value: value,
                date
            })

            const finalSum = Number(Number(toAccounts.sold) + Number(value))

            toAccounts.sold = finalSum
            await toAccounts.save()
        }

        accounts.sold = accounts.sold - req.body.value

        await accounts.save()

        res.status(201).send(accounts)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/transactions/:IBAN/", async (req, res) => {
    try {
        let accounts = await Account.findOne({
            IBAN: req.params.IBAN
        }, 'transactions')

        if (!accounts) {
            return res.status(404).send()
        }



        res.status(200).send(accounts)
    } catch (error) {
        res.status(500).send({
            err: error.message
        })
    }
})

router.get("/transactions/:IBAN/:date", async (req, res) => {
    try {
        let accounts = await Account.findOne({
            IBAN: req.params.IBAN
        }, 'transactions')

        if (!accounts) {
            return res.status(404).send()
        }

        const lowerBound = new Date(req.params.date)
        let upperBound = new Date(req.params.date)
        upperBound.setDate(upperBound.getDate() + 1)
        accounts.transactions = accounts.transactions.filter(transaction => {
            if (lowerBound <= transaction.date && upperBound >= transaction.date) {
                if (transaction.vendor.includes('Round'))
                    return true;
            }
            return false;
        })

        res.status(200).send(accounts)
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