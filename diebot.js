// Imports
let discord = require('discord.io')
let logger  = require('winston')
let auth    = require('./auth.json')



// Logger
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, { colorize: true })
logger.level = 'debug'



// Commands
let rollDie = size => (Math.random() * Number(size) + 1) >>> 0
let commands = [
  {
    regex: new RegExp('^roll\\s*(\\d+)\\s*x\\s*(\\d+)\\s*(\\w+)$', 'gi'),
    execute: (userID, channelID, matches) => {
      let values = new Array(Number(matches[1])).fill(0).map(() => rollDie(matches[2]))
      let msg = `<@${userID}>\n` + values.join(', ')
      switch (matches[3]) {
        case 'min':
        case 'minimum':
          msg += '\nMax = ' + Math.min.apply(null, values)
          break;
        case 'max':
        case 'maximum':
          msg += '\nMax = ' + Math.max.apply(null, values)
          break;
        case 'total':
          msg += '\nTotal = ' + values.reduce((runningTotal, currentValue) => runningTotal + currentValue)
          break;
        case 'avg':
        case 'average':
          msg += '\nAverage = ' + (values.reduce((runningTotal, currentValue) => runningTotal + currentValue) / values.length)
          break;
      }
      bot.sendMessage({ to: channelID, message: msg })
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
              + 'So this would work as well \"roll3x20total\".'
    })
  }
]



// Bot
let bot = new discord.Client({ token: auth.token, autorun: true })
bot.on('ready', (ev) => {
  logger.info('Connected')
  logger.info('Logged in as: ')
  logger.info(bot.username + ' - (' + bot.id + ')')
})
bot.on('message', (user, userID, channelID, message, evt) => {
  for (let i = 0; i < commands.length; ++i) {
    let matches = commands[i].regex.exec(message)
    if (!matches) continue
    commands[i].execute(userID, channelID, matches)
    break
  }
})