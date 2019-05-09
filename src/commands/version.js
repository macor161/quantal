module.exports = function({ argv, logger }) {

    return () => {
        const package = require('../../package.json')

        logger(`${package.name} v${package.version}`)
    }
}