const debug = require('debug')('compile')
const compiler = require('./compiler/multiprocess-compiler')
const OS = require('os')
const Profiler = require('./profiler')
const expect = require('truffle-expect')
const find_contracts = require('truffle-contract-sources')
const Config = require('./truffle-config')
const detailedError = require('./detailed-error')
const {getFormattedVersion} = require('./compiler/load-compiler')
const getOptions = require('./get-options')
const _ = require('lodash')
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
const compile = function(inputSources, options) {
  return new Promise(async (res,rej) => {
    const solcVersion = getOptions().compiler.version
    options.compilers.solc.version = solcVersion
    const compilerInfo = { name: 'solc', version: getFormattedVersion(solcVersion) }
    const hasTargets = options.compilationTargets && options.compilationTargets.length

    expect.options(options, ['contracts_directory', 'compilers'])
    expect.options(options.compilers, ['solc'])

    options.compilers.solc.settings.evmVersion =
      _.get(options, ['compilers', 'solc', 'settings', 'evmVersion']) ||
      _.get(options, ['compilers', 'solc', 'evmVersion']) ||
      undefined

    options.compilers.solc.settings.optimizer =
      _.get(options, ['compilers', 'solc', 'settings', 'optimizer']) ||
      _.get(options, ['compilers', 'solc', 'optimizer']) ||
      {}

    options.compilers.solc.version =
      _.get(options, ['solc', 'vesion']) ||
      _.get(options, ['compilers', 'solc', 'settings', 'version']) ||
      _.get(options, ['compilers', 'solc', 'version']) ||
      undefined

    // Grandfather in old solc config
    if (options.solc) {
      options.compilers.solc.settings.evmVersion = options.solc.evmVersion
      options.compilers.solc.settings.optimizer = options.solc.optimizer
    }
    
    const { 
      operatingSystemIndependentSources,
      operatingSystemIndependentTargets,
      originalPathMappings
    } = formatPaths(inputSources, hasTargets)

    // Specify compilation targets
    // Each target uses defaultSelectors, defaulting to single target `*` if targets are unspecified
    const outputSelection = {}
    const targets = operatingSystemIndependentTargets
    const targetPaths = Object.keys(targets)

    targetPaths.length
      ? targetPaths.forEach((key) => (outputSelection[key] = defaultSelectors))
      : (outputSelection['*'] = defaultSelectors)

    const compilerSettings = {
      evmVersion: options.compilers.solc.settings.evmVersion,
      optimizer: options.compilers.solc.settings.optimizer,
      outputSelection,
    }

    // Nothing to compile? Bail.
    if (Object.keys(inputSources).length === 0) {
      return res({
        contracts: [], 
        files: {},
        compilerInfo: null,
        warnings: []
      })
    }

    debug('Starting compilation')
    const standardOutput = await compiler(operatingSystemIndependentSources, compilerSettings, options.compilers.solc.version)
    
    debug('Compilation done')

    const { contracts, sources, errors: allErrors = [] } = standardOutput
    const warnings = allErrors.filter((error) => error.severity === 'warning')
    const errors = allErrors.filter((error) => error.severity !== 'warning')      

    if (errors.length > 0) 
      return rej(await Promise.all(errors.map((err) => detailedError(err))))      

    const files = []      
    for (const [filePath, source] of Object.entries(sources))
      files[source.id] = originalPathMappings[filePath]

    const returnVal = {}

    Object.keys(contracts).forEach((source_path) => {
      const files_contracts = contracts[source_path];

      Object.keys(files_contracts).forEach((contract_name) => {
        const contract = files_contracts[contract_name];

        // All source will have a key, but only the compiled source will have
        // the evm output.
        if (!Object.keys(contract.evm).length) 
          return

        const contract_definition = {
          contract_name: contract_name,
          sourcePath: originalPathMappings[source_path], // Save original source path, not modified ones
          source: operatingSystemIndependentSources[source_path],
          sourceMap: contract.evm.bytecode.sourceMap,
          deployedSourceMap: contract.evm.deployedBytecode.sourceMap,
          legacyAST: sources[source_path].legacyAST,
          ast: sources[source_path].ast,
          abi: contract.abi,
          metadata: contract.metadata,
          bytecode: '0x' + contract.evm.bytecode.object,
          deployedBytecode: '0x' + contract.evm.deployedBytecode.object,
          unlinked_binary: '0x' + contract.evm.bytecode.object, // deprecated
          compiler: compilerInfo,
          devdoc: contract.devdoc,
          userdoc: contract.userdoc
        }

        // Reorder ABI so functions are listed in the order they appear
        // in the source file. Solidity tests need to execute in their expected sequence.
        contract_definition.abi = orderABI(contract_definition);

        // Go through the link references and replace them with older-style
        // identifiers. We'll do this until we're ready to making a breaking
        // change to this code.
        Object.keys(contract.evm.bytecode.linkReferences).forEach(file_name => {
          const fileLinks = contract.evm.bytecode.linkReferences[file_name];

          Object.keys(fileLinks).forEach(library_name => {
            const linkReferences = fileLinks[library_name] || [];

            contract_definition.bytecode = replaceLinkReferences(
                contract_definition.bytecode,
                linkReferences,
                library_name
            );
            contract_definition.unlinked_binary = replaceLinkReferences(
                contract_definition.unlinked_binary,
                linkReferences,
                library_name
            );
          });
        });

        // Now for the deployed bytecode
        Object.keys(contract.evm.deployedBytecode.linkReferences).forEach(file_name => {
              const fileLinks = contract.evm.deployedBytecode.linkReferences[file_name]

              Object.keys(fileLinks).forEach(library_name => {
                const linkReferences = fileLinks[library_name] || [];

                contract_definition.deployedBytecode = replaceLinkReferences(
                    contract_definition.deployedBytecode,
                    linkReferences,
                    library_name
                );
              });
            }
        );

        returnVal[contract_name] = contract_definition
      })
    })

    
    Promise.all(warnings.map((warn) => detailedError(warn, standardOutput.sources[_.get(warn, ['sourceLocation', 'file'])])))
        .then((warnings) => {
          return res({ contracts: returnVal, files, compilerInfo, warnings })
        })
    

  })
}

/**
 * Ensure sources have operating system independent paths
 * i.e., convert backslashes to forward slashes; things like C: are left intact.
 */
function formatPaths(sources, hasTargets) {

  const operatingSystemIndependentSources = {}
  const operatingSystemIndependentTargets = {}
  const originalPathMappings = {}

  Object.keys(sources).forEach(function(source) {
    // Turn all backslashes into forward slashes
    let replacement = source.replace(/\\/g, '/')

    // Turn G:/.../ into /G/.../ for Windows
    if (replacement.length >= 2 && replacement[1] === ':') {
      replacement = '/' + replacement;
      replacement = replacement.replace(':', '')
    }

    // Save the result
    operatingSystemIndependentSources[replacement] = sources[source]

    // Just substitute replacement for original in target case. It's
    // a disposable subset of `sources`
    if (hasTargets && options.compilationTargets.includes(source)) {
      operatingSystemIndependentTargets[replacement] = sources[source]
    }

    // Map the replacement back to the original source path.
    originalPathMappings[replacement] = source;
  })

  return {
    operatingSystemIndependentSources,
    operatingSystemIndependentTargets,
    originalPathMappings
  }
}

function replaceLinkReferences(bytecode, linkReferences, libraryName) {
  let linkId = '__' + libraryName;

  while (linkId.length < 40) {
    linkId += '_';
  }

  linkReferences.forEach(function(ref) {
    // ref.start is a byte offset. Convert it to character offset.
    const start = ref.start * 2 + 2;

    bytecode =
      bytecode.substring(0, start) + linkId + bytecode.substring(start + 40);
  });

  return bytecode;
}

function orderABI(contract) {
  let contract_definition;
  const ordered_function_names = [];

  for (let i = 0; i < contract.legacyAST.children.length; i++) {
    const definition = contract.legacyAST.children[i];

    // AST can have multiple contract definitions, make sure we have the
    // one that matches our contract
    if (
      definition.name !== 'ContractDefinition' ||
      definition.attributes.name !== contract.contract_name
    ) {
      continue;
    }

    contract_definition = definition;
    break;
  }

  if (!contract_definition) return contract.abi;
  if (!contract_definition.children) return contract.abi;

  contract_definition.children.forEach(function(child) {
    if (child.name === 'FunctionDefinition') {
      ordered_function_names.push(child.attributes.name);
    }
  });

  // Put function names in a hash with their order, lowest first, for speed.
  const functions_to_remove = ordered_function_names.reduce(function(
      obj,
      value,
      index
  ) {
    obj[value] = index;
    return obj;
  },
  {});

  // Filter out functions from the abi
  let function_definitions = contract.abi.filter(function(item) {
    return functions_to_remove[item.name] !== undefined;
  });

  // Sort removed function defintions
  function_definitions = function_definitions.sort(function(item_a, item_b) {
    const a = functions_to_remove[item_a.name];
    const b = functions_to_remove[item_b.name];

    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  // Create a new ABI, placing ordered functions at the end.
  const newABI = [];
  contract.abi.forEach(function(item) {
    if (functions_to_remove[item.name] !== undefined) return;
    newABI.push(item);
  });

  // Now pop the ordered functions definitions on to the end of the abi..
  Array.prototype.push.apply(newABI, function_definitions);

  return newABI;
}

// contracts_directory: String. Directory where .sol files can be found.
compile.all = function(options) {
  return new Promise((res, rej) => { 
    debug('compile.all started')
    find_contracts(options.contracts_directory, function(err, files) {
      if (err) return rej(err)
      options.paths = files
      res(compile.with_dependencies(options))
    })
  })
}

// contracts_directory: String. Directory where .sol files can be found.
// build_directory: String. Optional. Directory where .sol.js files can be found. Only required if `all` is false.
// all: Boolean. Compile all sources found. Defaults to true. If false, will compare sources against built files
//      in the build directory to see what needs to be compiled.
compile.necessary = function(options) {
  return new Promise((res, rej) => { 
    Profiler.updated(options, function(err, updated) {
      if (err) return rej(err)

      if (updated.length === 0) {
        return res({
          contracts: [], 
          files: {},
          compilerInfo: null,
          warnings: []
        })
      }

      options.paths = updated;
      res(compile.with_dependencies(options))
    })
  })
}

compile.with_dependencies = function(options) {
  return new Promise((res, rej) => { 
    options.contracts_directory = options.contracts_directory || process.cwd();

    expect.options(options, [
      'paths',
      'working_directory',
      'contracts_directory',
      'resolver',
    ])

    const config = Config.default().merge(options)

    Profiler.required_sources(
        config.with({
          paths: options.paths,
          base_path: options.contracts_directory,
          resolver: options.resolver,
        }),
        (err, allSources, required) => {
          if (err) return rej(err)

          options.compilationTargets = required
          res(compile(allSources, options))
        }
    );
  })
};

module.exports = compile
