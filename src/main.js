const fs = require('fs')
const date = new Date().toISOString().slice(0,10)
const logger = fs.createWriteStream(`${date}.json`, {
    flags: 'a'
})

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001

let data = {}

app.use(express.static(__dirname))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/post', (req, res) => {
    //console.log('req body:', req.body)
    data = req.body
    logger.write(JSON.stringify(data) + '\n')
})

app.get('/get', (req, res) => {
    res.json(data)
})

app.get('/load', (req, res) => {
    res.sendFile('/home/pi/pi-location/' + `${date}.json`)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
