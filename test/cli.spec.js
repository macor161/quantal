const path = require('path')
const { green } = require('chalk')
const packageJson = require('../package')


describe('CLI', () => {
  test('build successfully', async () => {
    process.argv[0] = 'node'
    process.argv[1] = 'quantal'
    process.argv[2] = ''
    process.argv[3] = ''

    process.cwd = () => path.join(__dirname, 'test-project')
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
    }

    require('../src/index')

    await wait(30000)

    expect(console.log).toHaveBeenCalledWith(green.bold('Build successful'))
    expect(console.error).not.toHaveBeenCalled()
  }, 60000)
})


function wait(ms) {
  return new Promise(res => setTimeout(res, ms))
}
