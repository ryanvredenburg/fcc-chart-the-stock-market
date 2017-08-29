// server.js
// where your node app starts

// init project
var express = require('express')
var app = express()

// socket.io
var http = require('http').Server(app)
var io = require('socket.io')(http)

// in memory storage saves setting up a DB for this demo project
// project is about sockets, not db access
var tickers = ['AAPL']
var TICKERS_LIMIT = 5

// dotenv
require('dotenv').config()

var yahooController = require('./app/controllers/yahooController.js')

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

var routes = require('./app/routes/index.js')

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html')
})

app.get('/:ticker', function (request, response) {
  yahooController.getTicker(request.params.ticker, function (error, data) {
    if (error) return response.send(error)
    return response.send(data)
  })
})

app.get('/dreams', function (request, response) {
  response.send(dreams)
})

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post('/dreams', function (request, response) {
  dreams.push(request.query.dream)
  response.sendStatus(200)
})

// Simple in-memory store for now
var dreams = [
  'Find and count some sheep',
  'Climb a really tall mountain',
  'Wash the dishes'
]

// listen for requests :)
/*
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
*/

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

function updateClients () {
  yahooController.getTickerArray(tickers, function (error, chartData, tickerData) {
    io.emit('chart update', { chartData: chartData, tickers: tickerData})
  })
}

io.on('connection', function (socket) {
  // when clients connect give them the latest data
  updateClients()

  socket.on('add ticker', function (msg) {
    if (tickers.length < TICKERS_LIMIT){
      msg = msg.toUpperCase()
      //make sure the ticker hasn't been aldded already
      let hasMatch = false
      for (let i = 0; i < tickers.length; i++){
        if (tickers[i] === msg) hasMatch = true
      }
      if(!hasMatch){
        tickers.push(msg)
        updateClients()
      } 
    } 
  })

  socket.on('remove ticker', function (msg) {
    console.log('remove ticker ' + msg)
    if (tickers.length > 1) {
      for (let i = 0; i < TICKERS_LIMIT; i++) {
        if (tickers[i] === msg) {
          tickers.splice(i, 1)
        }
      }
      updateClients()
    }
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
