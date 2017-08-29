'use strict'
const YahooFinanceAPI = require('yahoo-finance-data')
const api = new YahooFinanceAPI({
  key: process.env.yahooClientId,
  secret: process.env.yahooClientSecret
})

function getTicker (ticker, callback) {
  api
  .getHistoricalData(ticker, '1d', '1mo')
  .then(function (apiResult) {
    try {
      let data = []
      let timestamps = apiResult.chart.result[0].timestamp
      let quotes = apiResult.chart.result[0].indicators.quote[0].close
      let tickerName = apiResult.chart.result[0].meta.symbol
      for (let i = 0; i < timestamps.length; i++) {
       // convert yahoo timestamp to millisecond epoch
        data.push([timestamps[i] * 1000, quotes[i]])
      }

      let tickerResult = {
        name: tickerName,
        data: data,
        tooltip: { valueDecimals: 2 }
      }
      return callback(null, tickerResult)
    } catch (error) {
      return callback(new Error('Could Not Process this symbol'))
    }
  }, function (error) {
    return callback(error)
  })
}

function getTickerArray (tickers, callback) {
  let chartResult = []
  let tickerResult = []
  let callbackCounter = 0
  for (let i = 0; i < tickers.length; i++) {
    getTicker(tickers[i], function (error, data) {
      // on error provide an empty chart
      if (error) data = []
      callbackCounter++
      chartResult.push(data)
      tickerResult.push({name: tickers[i], error: error})
      if (callbackCounter === tickers.length) {
        console.log(chartResult)
        return callback(null, chartResult, tickerResult)
      }
    })
  }
}

module.exports = {
  getTicker: getTicker,
  getTickerArray: getTickerArray
}
