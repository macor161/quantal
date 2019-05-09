const solcCompile = require("./quantal-compile");
const mkdirp = require("mkdirp");
const { callbackify, promisify } = require("util");
const Config = require("truffle-config");
const expect = require("truffle-expect");
const Resolver = require("truffle-resolver");
const Artifactor = require("truffle-artifactor");
const OS = require("os");
const DEFAULT_COMPILER = 'solc'


module.exports = function compileContracts(options) {
    return new Promise((res, rej) => {
        // Currently recompiles all contracts everytime to make sure
        // we receive all warning messages
        const config = Config.detect({ all: true })  
        
        Contracts.compile(config, (err, result) => {
            if (err) 
                return rej(err)            

            res(result)           
        })
    })
}

// Oroginal source: https://github.com/trufflesuite/truffle/blob/develop/packages/truffle-workflow-compile/index.js

const SUPPORTED_COMPILERS = {
    solc: solcCompile
  };
  
  function prepareConfig(options) {
    expect.options(options, ["contracts_build_directory"]);
  
    expect.one(options, ["contracts_directory", "files"]);
  
    // Use a config object to ensure we get the default sources.
    const config = Config.default().merge(options);
  
    config.compilersInfo = {};
  
    if (!config.resolver) config.resolver = new Resolver(config);
  
    if (!config.artifactor) {
      config.artifactor = new Artifactor(config.contracts_build_directory);
    }
  
    return config;
  }
  
  function multiPromisify(func) {
    return (...args) =>
      new Promise((accept, reject) => {
        const callback = (err, ...results) => {
          if (err) reject(err);
  
          accept(results);
        };
  
        func(...args, callback);
      });
  }
  
  const Contracts = {
    collectCompilations: async compilations => {
      let result = { outputs: {}, contracts: {}, warnings: [] };
  
      for (let compilation of await Promise.all(compilations)) {
        let { compiler, output, contracts, warnings = []} = compilation;
  
        result.outputs[compiler] = output

        result.warnings = result.warnings.concat(warnings)

  
        for (let [name, abstraction] of Object.entries(contracts)) {
          result.contracts[name] = abstraction;
        }
      }
  
      return result;
    },
  
    // contracts_directory: String. Directory where .sol files can be found.
    // contracts_build_directory: String. Directory where .sol.js files can be found and written to.
    // all: Boolean. Compile all sources found. Defaults to true. If false, will compare sources against built files
    //      in the build directory to see what needs to be compiled.
    // network_id: network id to link saved contract artifacts.
    // quiet: Boolean. Suppress output. Defaults to false.
    // strict: Boolean. Return compiler warnings as errors. Defaults to false.
    compile: callbackify(async function(options) {
      const config = prepareConfig(options);
  
      const compilers = [DEFAULT_COMPILER]
  
      this.reportCompilationStarted(options);
  
      const compilations = await this.compileSources(config, compilers);
  
      const numberOfCompiledContracts = compilations.reduce(
        (number, compilation) => {
          return number + Object.keys(compilation.contracts).length;
        },
        0
      );
  
      if (numberOfCompiledContracts === 0) this.reportNothingToCompile(options);
  
      this.reportCompilationFinished(options, config);
      return await this.collectCompilations(compilations);
    }),
  
    compileSources: async function(config, compilers) {
      return Promise.all(
        compilers.map(async compiler => {
          const compile = SUPPORTED_COMPILERS[compiler];
          if (!compile) throw new Error("Unsupported compiler: " + compiler);
  
          const compileFunc =
            config.all === true || config.compileAll === true
              ? compile.all
              : compile.necessary;

          let [contracts, output, compilerUsed, warnings] = await multiPromisify(
            compileFunc
          )(config);
          //console.log('compiled successful:', contracts)
          if (compilerUsed) {
            config.compilersInfo[compilerUsed.name] = {
              version: compilerUsed.version
            };
          }
  
          if (contracts && Object.keys(contracts).length > 0) {
            await this.writeContracts(contracts, config)
          }
  
          return { compiler, contracts, output, warnings }
        })
      );
    },
  
    reportCompilationStarted: options => {
      const logger = options.logger || console;
      if (!options.quiet) {
        logger.log(OS.EOL + `Compiling your contracts...`);
        logger.log(`===========================`);
      }
    },
  
    reportCompilationFinished: (options, config) => {
      const logger = options.logger || console;
      const { compilersInfo } = config;
      if (!options.quiet) {
        if (Object.keys(compilersInfo).length > 0) {
          logger.log(
            `> Artifacts written to ${options.contracts_build_directory}`
          );
          logger.log(`> Compiled successfully using:`);
  
          const maxLength = Object.keys(compilersInfo)
            .map(name => name.length)
            .reduce((max, length) => (length > max ? length : max), 0);
  
          for (const name in compilersInfo) {
            const padding = " ".repeat(maxLength - name.length);
  
            logger.log(`   - ${name}:${padding} ${compilersInfo[name].version}`);
          }
        }
        logger.log();
      }
    },
  
    reportNothingToCompile: options => {
      const logger = options.logger || console;
      if (!options.quiet) {
        logger.log(`> Everything is up to date, there is nothing to compile.`);
      }
    },
  
    writeContracts: async (contracts, options) => {
      await promisify(mkdirp)(options.contracts_build_directory);
      const extra_opts = { network_id: options.network_id };
      await options.artifactor.saveAll(contracts, extra_opts);
    }
  }