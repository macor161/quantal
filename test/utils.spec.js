const { Logger } = require('../src/utils/logger')
const { decompressSourcemap } = require('../src/utils/sourcemap')

describe('logger', () => {
  global.console = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  test('calls the right console function', async () => {
    const logger = new Logger()

    logger.log('test')
    expect(console.log).toBeCalled()

    logger.info('test info')
    expect(console.info).toBeCalled()

    logger.warn('test warn')
    expect(console.warn).toBeCalled()

    logger.error('test error')
    expect(console.error).toBeCalled()
  })
})

describe('sourcemap', () => {
  test('decompressSourcemap output should be valid', async () => {
    expect(decompressSourcemap('1:2:1;:9;2:1:2;;;4:3:2:-'))
      .toEqual('1:2:1;1:9:1;2:1:2;2:1:2;2:1:2;4:3:2:-')
  })
})
