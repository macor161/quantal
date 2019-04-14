Object.defineProperty(Array.prototype, "mapAsync", {
    enumerable: false,
    value: function(fn) {
        return Promise.all(this.map(fn))
    }
})

Object.defineProperty(Array.prototype, "forEachAsync", {
    enumerable: false,
    value: function(fn) {
        return Promise.all(this.map(fn)).then(() => undefined)
    }
})
