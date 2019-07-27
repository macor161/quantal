// Original source code: https://github.com/trufflesuite/truffle/blob/v5.0.10/packages/truffle-compile/index.js

const debug = require('debug')('compile')
const expect = require('truffle-expect')
const _ = require('lodash')
const compiler = require('./compiler/multiprocess-compiler')
const Profiler = require('./profiler')
const { findContractFiles } = require('./find-contract-files')
const Config = require('./truffle-config')
const detailedError = require('./detailed-error')
const { getFormattedVersion } = require('./compiler/load-compiler')
const { formatPaths } = require('./utils/format-paths')
const { orderABI, replaceLinkReferences } = require('./utils/artifacts')

const defaultSelectors = {
  '': ['legacyAST', 'ast'],
  '*': [
    'abi',
    'metadata',
    'evm.bytecode.object',
    'evm.bytecode.sourceMap',
    'evm.deployedBytecode.object',
    'evm.deployedBytecode.sourceMap',
    'userdoc',
    'devdoc',
  ],
}


// Most basic of the compile commands. Takes a hash of sources, where
// the keys are file or module paths and the values are the bodies of
// the contracts. Does not evaulate dependencies that aren't already given.
const compile = async function (inputSources, options, truffleOptions) {
  const solcVersion = options.compiler.version
  const compilerInfo = { name: 'solc', version: getFormattedVersion(solcVersion) }
  truffleOptions.compilers.solc.version = solcVersion

  const {
    operatingSystemIndependentSources,
    operatingSystemIndependentTargets,
    originalPathMappings,
  } = formatPaths(inputSources, options.compilationTargets)

  // Specify compilation targets
  // Each target uses defaultSelectors, defaulting to single target `*` if targets are unspecified
  const outputSelection = {}
  const targets = operatingSystemIndependentTargets
  const targetPaths = Object.keys(targets)

  if (targetPaths.length > 0)
    targetPaths.forEach(key => { outputSelection[key] = defaultSelectors })
  else
    outputSelection['*'] = defaultSelectors

  const compilerSettings = {
    evmVersion: options.compiler.evmVersion,
    optimizer: options.compiler.optimizer,
    outputSelection,
  }

  // Nothing to compile? Bail.
  if (Object.keys(inputSources).length === 0) {
    return {
      contracts: [],
      files: {},
      compilerInfo: null,
      warnings: [],
    }
  }

  debug('Starting compilation')
  const standardOutput = await compiler(operatingSystemIndependentSources, compilerSettings, options.compiler.version)
  debug('Compilation done')

  const { contracts, sources, errors: allErrors = [] } = standardOutput
  const warnings = allErrors.filter(error => error.severity === 'warning')
  const errors = allErrors.filter(error => error.severity !== 'warning')

  if (errors.length > 0)
    throw (await Promise.all(errors.map(err => detailedError(err))))

  const files = []
  for (const [filePath, source] of Object.entries(sources))
    files[source.id] = originalPathMappings[filePath]

  const returnVal = {}

  Object.keys(contracts).forEach(source_path => {
    const files_contracts = contracts[source_path]

    Object.keys(files_contracts).forEach(contract_name => {
      const contract = files_contracts[contract_name]

      // All source will have a key, but only the compiled source will have
      // the evm output.
      if (!Object.keys(contract.evm).length)
        return

      const contract_definition = {
        contract_name,
        sourcePath: originalPathMappings[source_path], // Save original source path, not modified ones
        source: operatingSystemIndependentSources[source_path],
        sourceMap: contract.evm.bytecode.sourceMap,
        deployedSourceMap: contract.evm.deployedBytecode.sourceMap,
        legacyAST: sources[source_path].legacyAST,
        ast: sources[source_path].ast,
        abi: contract.abi,
        metadata: contract.metadata,
        bytecode: `0x${contract.evm.bytecode.object}`,
        deployedBytecode: `0x${contract.evm.deployedBytecode.object}`,
        unlinked_binary: `0x${contract.evm.bytecode.object}`, // deprecated
        compiler: compilerInfo,
        devdoc: contract.devdoc,
        userdoc: contract.userdoc,
      }

      // Reorder ABI so functions are listed in the order they appear
      // in the source file. Solidity tests need to execute in their expected sequence.
      contract_definition.abi = orderABI(contract_definition)

      // Go through the link references and replace them with older-style
      // identifiers. We'll do this until we're ready to making a breaking
      // change to this code.
      Object.keys(contract.evm.bytecode.linkReferences).forEach(file_name => {
        const fileLinks = contract.evm.bytecode.linkReferences[file_name]

        Object.keys(fileLinks).forEach(library_name => {
          const linkReferences = fileLinks[library_name] || []

          contract_definition.bytecode = replaceLinkReferences(
            contract_definition.bytecode,
            linkReferences,
            library_name,
          )
          contract_definition.unlinked_binary = replaceLinkReferences(
            contract_definition.unlinked_binary,
            linkReferences,
            library_name,
          )
        })
      })

      // Now for the deployed bytecode
      Object.keys(contract.evm.deployedBytecode.linkReferences).forEach(file_name => {
        const fileLinks = contract.evm.deployedBytecode.linkReferences[file_name]

        Object.keys(fileLinks).forEach(library_name => {
          const linkReferences = fileLinks[library_name] || []

          contract_definition.deployedBytecode = replaceLinkReferences(
            contract_definition.deployedBytecode,
            linkReferences,
            library_name,
          )
        })
      })

      returnVal[contract_name] = contract_definition
    })
  })


  const detailedWarnings = await Promise.all(
    warnings.map(warn => detailedError(warn, sources[_.get(warn, ['sourceLocation', 'file'])])),
  )

  return {
    contracts: returnVal, files, compilerInfo, warnings: detailedWarnings,
  }
}


// contracts_directory: String. Directory where .sol files can be found.
compile.all = async function (options, truffleOptions) {
  debug('compile.all started')
  options.paths = await findContractFiles(options.contractsDir)
  return compile.with_dependencies(options, truffleOptions)
}

// contracts_directory: String. Directory where .sol files can be found.
// build_directory: String. Optional. Directory where .sol.js files can be found. Only required if `all` is false.
// all: Boolean. Compile all sources found. Defaults to true. If false, will compare sources against built files
//      in the build directory to see what needs to be compiled.
compile.necessary = function (options, truffleOptions) {
  return new Promise((res, rej) => {
    Profiler.updated(truffleOptions, (err, updated) => {
      if (err)
        return rej(err)

      if (updated.length === 0) {
        return res({
          contracts: [],
          files: {},
          compilerInfo: null,
          warnings: [],
        })
      }

      options.paths = updated
      return res(compile.with_dependencies(options, truffleOptions))
    })
  })
}

compile.with_dependencies = function (options, truffleOptions) {
  return new Promise((res, rej) => {
    expect.options(truffleOptions, [
      'working_directory',
      'contracts_directory',
      'resolver',
    ])

    const config = Config.default().merge(truffleOptions)

    Profiler.required_sources(
      config.with({
        paths: options.paths,
        base_path: options.contractsDir,
        resolver: truffleOptions.resolver,
      }),
      (err, allSources, required) => {
        if (err)
          return rej(err)

        options.compilationTargets = required
        return res(compile(allSources, options, truffleOptions))
      },
    )
  })
}

module.exports = compile
