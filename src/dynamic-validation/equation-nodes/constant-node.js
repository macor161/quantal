import { EquationNode } from './equation-node'
import { OpCodes } from '../op-codes'

const SUPPORTED_TYPES = ['uint', 'uint256']

export class ConstantNode extends EquationNode {

    constructor(type, value) {
        super(OpCodes.CONST)

        if (!SUPPORTED_TYPES.includes(type))
            throw `Unsupported type: ${type}`

        this.type = type
        this.values.push(value)
    }

    addNode(node) {
        throw 'This node does not support child nodes'
    }

}

