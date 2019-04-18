export class EquationNode {

    constructor(opcode, isPartial = false) {
        this.opcode = opcode
        this.childNodes = []
        this.values = []
        this.isPartial = isPartial
    }

    addNode(node) {
        throw 'EquationNode class is abstract. "addNode" method must be implemented.'
    }
}


