const importFresh = require('import-fresh')
const {readdir} = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const ast = require('./ast')

const FUNCTION_TYPE = 'function'

/**
 * Returns the contract information from all truffle json files
 * in a folder
 * // TODO: Validate path
 * @param {string} folderPath
 */
const getContractInfosFromFolder = async (folderPath) => {
  const files = await readdir(folderPath)
  return files.map((file) => getContractInfo(path.join(folderPath, file)))
}

async function getContractInfo(path) {
  const {contractName, abi, ast, bytecode, devdoc} = getContractFile(path)
  return {
    name: contractName,
    abi,
    ast,
    bytecode,
    devdoc,
    methods: getFunctions(contractName, abi, ast, devdoc),
    stateModifierFunctions: getStateModifierFunctions(abi, devdoc),
  }
}

function getFunctions(contractName, abi, astInfo, devdoc) {
  const astContract = ast.getContract(astInfo, contractName)
  return abi
      .filter((member) => member.type === FUNCTION_TYPE)
      .map((viewFunction) => {
        const astMethod = ast.getMethod(astContract, viewFunction)

        if (astMethod) {
          // Public function
          if (astMethod.nodeType === 'FunctionDefinition') {
            for (const i in viewFunction.outputs) {
              const abiOutput = viewFunction.outputs[i]
              const astOutput = astMethod.returnParameters.parameters[i]

              if (abiOutput.type === 'address' && astOutput.typeName.name !== 'address') {
                abiOutput.contractName = astOutput.typeName.name
              }
            }
          // Public variable
          } else if (astMethod.nodeType === 'VariableDeclaration') {
            viewFunction.outputs[0].contractName = astMethod.typeName.name
          }
        } else {
          console.log(`${contractName} method not found: `, viewFunction.name)
        }

        return {
          ...viewFunction,
          doc: getDocForAbiFunction(viewFunction, devdoc),
        }
      })
}

function getStateModifierFunctions(abi, devdoc) {
  return abi
      .filter((member) => !member.constant && member.type === FUNCTION_TYPE)
      .map((abiFunction) => ({
        ...abiFunction,
        doc: getDocForAbiFunction(abiFunction, devdoc),
      }))
}

/**
 * // TODO: Get doc
 * @param {Object} abiFunction
 * @param {Object} devdoc
 */
function getDocForAbiFunction(abiFunction, devdoc) {
  if (!devdoc || !devdoc.methods) {
    return null
  }

  const docMethods = _.filter(devdoc.methods, (doc, method) => method.indexOf(`${abiFunction.name}(`) === 0 )

  const doc = docMethods[0]

  // We currently don't support functions with multiple signatures
  if (docMethods.length > 1) {
    delete doc.params
  }

  return doc
}

/**
 * Returns the smart contract json file content
 * // TODO: Load asynchronously
 * @param {string} path
 */
const getContractFile = (path) => importFresh(path)

module.exports = {getContractInfo, getContractInfosFromFolder}
