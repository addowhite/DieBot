'use strict'

// Imports
let discord = require('discord.io')
let auth    = require('./auth.json')
var express = require('express')
var app     = express()



// Utils
function formatNumber(num) {
  num = String(num)
  let dotIndex = num.lastIndexOf('.')
  let i, newStr = ''
  if (dotIndex != -1) {
    newStr = num.substr(dotIndex)
    num = num.substring(0, dotIndex)
  }
  for (i = num.length - 3; i > 0; i -= 3)
    newStr = ',' + num.substr(i, 3) + newStr
  return num.substring(0, i + 3) + newStr
}



// Commands
let maxMessageLength = 100
let rollDie = size => (Math.random() * Number(size) + 1) >>> 0
let commands = [
  {
    regex: new RegExp('^roll\\s*(\\d+)\\s*x\\s*(\\d+)\\s*([a-zA-Z]+)?$', 'gi'),
    execute: (userID, channelID, matches) => {
      let values = new Array(Number(matches[1])).fill(0).map(() => rollDie(matches[2]))
      let msg = `<@${userID}>\n` + values.join(', ')
      let groupResult = ''
      switch (matches[3]) {
        case 'min':
        case 'minimum':
          groupResult = '\nMax = ' + formatNumber(values.reduce((min, val) => Math.min(min, val)))
          break
        case 'max':
        case 'maximum':
          groupResult = '\nMax = ' + formatNumber(values.reduce((max, val) => Math.max(max, val)))
          break
        case 'total':
          groupResult = '\nTotal = ' + formatNumber(values.reduce((total, val) => total + val))
          break;
        case 'avg':
        case 'average':
          groupResult = '\nAverage = ' + formatNumber(values.reduce((runningTotal, currentValue) => runningTotal + currentValue) / values.length)
          break
      }
      if (msg.length > maxMessageLength - groupResult.length - 3)
        msg = msg.substr(0, maxMessageLength - groupResult.length - 3) + '...'
      bot.sendMessage({ to: channelID, message: msg + groupResult })
    }
  },
  {
    regex: new RegExp('^roll\\s*(\\d+)$', 'gi'),
    execute: (userID, channelID, matches) => bot.sendMessage({ to: channelID, message: `<@${userID}>\n` + rollDie(matches[1]) })
  },
  {
    regex: new RegExp('^roll$', 'gi'),
    execute: (userID, channelID, matches) => bot.sendMessage({ to: channelID, message: `<@${userID}>\n` + rollDie(20) })
  },
  {
    regex: new RegExp('^die-?bot$', 'gi'),
    execute: (userID, channelID, matches) => bot.sendMessage({
      to: channelID,
      message:  `<@${userID}>\n`
              + 'Type \"roll\" to quickly roll a D20\n'
              + 'Type \"roll 6\" to roll a D6\n'
              + 'Type \"roll 3 x 20\" to roll three D20s\n'
              + 'Type \"roll 3 x 20 max\" to roll three D20s and get the highest value\n'
              + 'Type \"roll 3 x 20 avg\" to roll three D20s and get the average value\n'
              + 'All group commands are: min, minimum, max, maximum, avg, average, total\n'
              + 'Disclaimer: I do not care about capitalisation or spaces. Aint nobody got time for that!\n'
              + 'So this would work as well \"ROLL3X20TOTAL\".'
    })
  }
]



// Bot
let bot = new discord.Client({ token: auth.token, autorun: true })
bot.on('message', (user, userID, channelID, message, evt) => {
  for (let i = 0; i < commands.length; ++i) {
    let matches = commands[i].regex.exec(message)
    if (!matches) continue
    commands[i].execute(userID, channelID, matches)
    break
  }
})



app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('DieBot is running happily.')
})

app.listen(app.get('port'), function() {
  console.log("App is running at localhost:" + app.get('port'))
})
