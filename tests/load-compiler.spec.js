const { downloadFile, loadCompiler } = require('../src/compiler/load-compiler')

describe('downloadFile', () => {

    test('', async () => {
         const path = await loadCompiler()
         console.log(path)
    })
})