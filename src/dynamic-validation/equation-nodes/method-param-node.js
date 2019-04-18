import { EquationNode } from './equation-node'
import { OpCodes } from '../op-codes'

const SUPPORTED_TYPES = ['uint', 'uint256']

export class MethodParamNode extends EquationNode {

    constructor(type, position) {
        super(OpCodes.PARAM)

        if (!SUPPORTED_TYPES.includes(type))
            throw `Unsupported type: ${type}`

        this.values.push(position)
    }

    addNode(node) {
        throw 'This node does not support child nodes'
    }

}

