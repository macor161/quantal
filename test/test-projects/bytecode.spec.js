const { build } = require('../../src/build/build')
const { getOptions } = require('../../src/options')

describe('info', () => {
  test('', async () => {
    // const config = TruffleConfig.detect({ working_directory: './test/test-projects/synthetix' })
    // const options = getOptions({ cwd: './test/test-projects/synthesia' })
    // console.log('options: ', config.build_directory)

    const options = getOptions({ cwd: './test/test-projects/synthetix' })
    // console.log('cwd: ', process.cwd())
    console.log('options: ', options)

    const result = await build(options)
    console.log(result)
  }, 30000)
})
