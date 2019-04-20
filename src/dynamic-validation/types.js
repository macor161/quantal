import { ConstantNode } from './equation-nodes/constant-node'
import { createContractClass } from './create-contract-class'

/**
 * Types supported by operators
 * @typedef {Object} Operator
 * @property {function} uint
 */

/**
 * Create operators
 * @param {Equation} equation 
 */
export function createTypes(contractClass, methodInfo, equation) {
    return {
        uint(value) {
            equation.addNode(new ConstantNode('uint256', value))
            return createContractClass(contractClass, methodInfo, equation)
        }
    }
}

