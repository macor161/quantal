import { EquationNode } from './equation-node'
import { OpCodes } from '../op-codes'

const SUPPORTED_OP_CODES = [OpCodes.EQ, OpCodes.GE, OpCodes.GT, OpCodes.LE, OpCodes.LT, OpCodes.NE]

export class ComparatorNode extends EquationNode {

    constructor(opcode, leftNode, rightNode) {
        super(opcode)

        if (!SUPPORTED_OP_CODES.includes(opcode))
            throw `Unsupported op code: ${opcode}`

        if (leftNode)
            this.addNode(leftNode)

        if (rightNode)
            this.addNode(rightNode)
    }

    addNode(node) {
        if (this.isPartial)
            this.childNodes.push(node)
    }

    get isPartial() { 
        return this.childNodes.length < 2 
    }

}

