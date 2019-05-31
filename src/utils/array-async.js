Object.defineProperty(array.prototype, 'mapAsync', {
  enumerable: false,
  value: function(fn) {
    return Promise.all(this.map(fn))
  },
})

Object.defineProperty(array.prototype, 'forEachAsync', {
  enumerable: false,
  value: function(fn) {
    return Promise.all(this.map(fn)).then(() => undefined)
  },
})
