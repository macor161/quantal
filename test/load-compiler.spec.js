const { loadCompiler } = require('../src/compiler/load-compiler')

describe('loadCompiler', () => {
  test('throws if OS is not Linux or Mac', async () => {
    jest.mock('os')
    const os = require('os')
    os.platform.mockImplementation(() => 'win64')

    await expect(loadCompiler()).rejects.toThrow()
  })
})
