/**
 * Same as `os.platform()` but returns "mac" instead of "darwin"
 */
module.exports = function getOs() {
    return require('os')
        .platform()
        .replace('darwin', 'mac')
}