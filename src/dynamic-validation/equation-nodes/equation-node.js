export class EquationNode {

    constructor(opcode) {
        this.opcode = opcode
        this.childNodes = []
        this.values = []
    }

    addNode(node) {
        throw 'EquationNode class is abstract. "addNode" method must be implemented.'
    }

    get isPartial() { 
        return false 
    }
}


