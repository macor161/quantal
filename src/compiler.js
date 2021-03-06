// Original source code: https://github.com/trufflesuite/truffle/blob/v5.0.10/packages/truffle-compile/index.js

const _ = require('lodash')
const { MultiprocessCompiler } = require('./compiler/multiprocess-compiler')
const Profiler = require('./profiler')
const { findContractFiles } = require('./find-contract-files')
const detailedError = require('./detailed-error')
const { formatPaths } = require('./utils/format-paths')
const { orderABI, replaceLinkReferences } = require('./utils/artifacts')


/**
 * Compile all contracts, regardless of their last modification time
 * @param {Object} options
 */
async function all(options) {
  options.paths = await findContractFiles(options.contractsDir)
  return withDependencies(options)
}

/**
 * Compile contracts that have changed since last compilation
 * @param {Object} options
 */
async function necessary(options) {
  return new Promise((res, rej) => {
    Profiler.updated(options, (err, updated) => {
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
      return res(withDependencies(options))
    })
  })
}

async function compile(inputSources, options) {
  const { outputSelection: artifactsContent } = options.compiler

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
    targetPaths.forEach(key => { outputSelection[key] = artifactsContent })
  else
    outputSelection['*'] = artifactsContent

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
      warnings: [],
      errors: [],
    }
  }

  const multiprocessCompiler = new MultiprocessCompiler({
    solcOptions: compilerSettings,
    version: options.compiler.version,
    onUpdate: options.onUpdate,
  })

  const standardOutput = await multiprocessCompiler.compile(operatingSystemIndependentSources)
  const compilerInfo = { name: 'solc', version: await multiprocessCompiler.getFullVersion() }

  const { contracts, sources, errors: allErrors = [] } = standardOutput
  const warnings = allErrors.filter(error => error.severity === 'warning')
  const errors = allErrors.filter(error => error.severity !== 'warning')

  if (errors.length > 0) {
    return {
      contracts: [],
      files: {},
      warnings: [],
      errors: await Promise.all(errors.map(err => {
        const file = inputSources[_.get(err, ['sourceLocation', 'file'])]
        return detailedError(err, file && {
          source: file.content,
          path: file.absolutePath,
        })
      })),
    }
  }

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
        source: operatingSystemIndependentSources[source_path].content,
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
    warnings.map(warn => {
      const file = inputSources[_.get(warn, ['sourceLocation', 'file'])]
      return detailedError(warn, file && {
        source: file.content,
        path: file.absolutePath,
      })
    }),
  )

  return {
    contracts: returnVal,
    files,
    compilerInfo,
    warnings: detailedWarnings,
    errors: [],
  }
}


async function withDependencies(options) {
  return new Promise((res, rej) => {
    Profiler.required_sources(
      {
        paths: options.paths,
        base_path: options.contractsDir,
        resolver: options.resolver,
        contracts_directory: options.contractsDir,
      },
      (err, allSources, required) => {
        if (err)
          return rej(err)

        options.compilationTargets = required
        return res(compile(allSources, options))
      },
    )
  })
}

module.exports = { all, necessary }
