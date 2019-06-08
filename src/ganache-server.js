const outdent = require('outdent')
const {map} = require('./template-literals')
const _ = require('lodash')
const pad = require('pad-right')

const DISPLAY_ACCOUNTS = 4
const PORT = 8545
const ACCOUNT_PADDING = 3

exports.ganacheServer = async function ganacheServer(options) {
  return new Promise((res, rej) => {
    /* Disabled for now
    const ganache = require('ganache-cli')
    const server = ganache.server(options)

    server.listen(PORT, (err, ganacheInfo) => {
      if (err) {
        return rej(err)
      }

      res(getServerInfo(ganacheInfo, PORT))
    })*/
  })
}

function getServerInfo(ganacheInfo, port) {
  const info = {
    accounts: _(ganacheInfo.unlocked_accounts)
        .map((account) => ({
          address: account.address,
          secretKey: account.secretKey,
        }))
        .slice(0, DISPLAY_ACCOUNTS)
        .value(),

    port,
    ganacheInfo: ganacheInfo,
  }

  return {
    ...info,
    formattedInfo: getFormattedInfo(info),
  }
}

function getFormattedInfo({accounts, port}) {
  return outdent`
        Ganache server listening on localhost:${port}
        Accounts: 
        ${map(accounts, (account, i) => outdent`
            ${padAccount(i)} Address: ${account.address}
            ${padAccount()} Private key: 0x${account.secretKey.toString('hex')}

        `)}

    `
}

function padAccount(index) {
  const lineStart = index !== undefined
        ? `${index + 1})`
        : ''

  return pad(lineStart, ACCOUNT_PADDING, ' ')
}
