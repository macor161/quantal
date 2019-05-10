module.exports = function({ argv, logger }) {

    return () => {
        logger(`Command not found.`)
        argv.help()
    }
}