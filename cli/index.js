const getOptions = require('./get-options')
const build = require('./build')
const { ganacheServer } = require('./ganache-server')


async function main() {
    const options = getOptions()
    //watch()
    console.log('Starting Ganache server')
    const ganacheInfo = await ganacheServer(options.ganache)
    console.log(ganacheInfo.formattedInfo)
    console.log('Building smart contracts')
    await build({ watch: true })
}






function wait(ms) {
    return new Promise(res => setTimeout(res, ms))
}

process.on('uncaughtException', function (err) {
    console.log('Error: ', err.message)
})

process.on('unhandledRejection', error => {
    // truffle-compile throws an unhandled promise rejection.   
})

main()
//ganacheServer()