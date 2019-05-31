const {Bundled} = require('./loadingStrategies')

class CompilerSupplier {
  constructor(_config) {
    _config = _config || {};
    const defaultConfig = {version: null};
    this.config = Object.assign({}, defaultConfig, _config);
    this.strategyOptions = {version: null};
  }

  badInputError(userSpecification) {
    const message =
      `Could not find a compiler version matching ${userSpecification}. ` +
      `compilers.solc.version option must be a string specifying:\n` +
      `   - a path to a locally installed solcjs\n` +
      `   - a solc version or range (ex: '0.4.22' or '^0.5.0')\n` +
      `   - a docker image name (ex: 'stable')\n` +
      `   - 'native' to use natively installed solc\n`;
    return new Error(message);
  }

  load() {
    const userSpecification = this.config.version;

    return new Promise(async (resolve, reject) => {
      const strategy = new Bundled(this.strategyOptions);

      try {
        const solc = await strategy.load(userSpecification);
        resolve(solc);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = CompilerSupplier;
