const qconfig = require('../src/qconfig')
const fs = require('fs-extra')

xdescribe('init()', () => {
    test('creates config folders', async () => {
        await qconfig.init()
        
        //expect(1).toEqual(1)
        
    })
})