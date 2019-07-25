const _ = require('lodash')

const map = (items, fn) => _.map(items, fn).join('')

module.exports = { map }
