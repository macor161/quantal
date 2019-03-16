Array.prototype.mapAsync = function(fn) {
    return Promise.all(this.map(fn))
}

Array.prototype.forEachAsync = function(fn) {
    return Promise.all(this.map(fn)).then(() => undefined)
}