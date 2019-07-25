/**
 * Always print time in ms. Will override all debug instances
 */
const debug = require('debug')

debug.humanize = t => `${t}ms`
