const express = require('express')
const User = require('./models/user.model')
const userRouter = require('./routes/users')

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(userRouter)

app.listen(port, async () => {
    console.log("App started on port " + port)
})