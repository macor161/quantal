import { ComparatorNode } from './equation-nodes/comparator-node'
import { createTypes } from './types'
import { OpCodes } from './op-codes'

/**
 * Operators
 * @typedef {import("./types").Operator} Operator
 * @typedef {Object} Operators
 * @property {Operators} not 
 * @property {Operator} toEqual 
 * @property {Operator} toBeGreaterThan
 * @property {Operator} toBeGreaterThanOrEqual
 * @property {Operator} toBeLessThan
 * @property {Operator} toBeLessThanOrEqual
 */

/**
 * Create operators
 * @param {class} contractClass
 * @param {Object} methodInfo
 * @param {Equation} equation
 * @param {boolean} not
 */
export function createOperators(contractClass, methodInfo, equation, not = false) {
    return {
        ...( not 
            ? null
            : { not: createOperators(contractClass, methodInfo, equation) }  
        ),

        get toEqual() {
            const opcode = not ? OpCodes.NE : OpCodes.EQ
            equation.addNode(new ComparatorNode(opcode))
            return createTypes(contractClass, methodInfo, equation)
        },

        get toBeGreaterThan() {
            const opcode = not ? OpCodes.LE : OpCodes.GT
            equation.addNode(new ComparatorNode(opcode))
            return createTypes(contractClass, methodInfo, equation)
        },

        get toBeGreaterThanOrEqual() {
            const opcode = not ? OpCodes.LT : OpCodes.GE
            equation.addNode(new ComparatorNode(opcode))
            return createTypes(contractClass, methodInfo, equation)
        },

        get toBeLessThan() {
            const opcode = not ? OpCodes.GE : OpCodes.LT
            equation.addNode(new ComparatorNode(opcode))
            return createTypes(contractClass, methodInfo, equation)
        },

        get toBeLessThanOrEqual() {
            const opcode = not ? OpCodes.GT : OpCodes.LE
            equation.addNode(new ComparatorNode(opcode))
            return createTypes(contractClass, methodInfo, equation)
        }        
    }
}

