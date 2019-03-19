const getOptions = require('./get-options')
const { build, watch } = require('./build')
const { ganacheServer } = require('./ganache-server')


async function main() {
    //watch()
    const ganacheInfo = await ganacheServer()
    console.log(ganacheInfo.formattedInfo)
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