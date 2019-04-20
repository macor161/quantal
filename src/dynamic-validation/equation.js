
export class Equation {

    constructor(methodSignature) {
        this._mainNode = null
        this._methodSignature = methodSignature
        // TODO: Calculate signature hash
    }

    addNode(node) {
        if (!this._mainNode)
            this._mainNode = node
        else if (this._mainNode.isPartial) 
            this._mainNode.addNode(node)
        else if (node.isPartial) {
            node.addNode(this._mainNode)
            this._mainNode = node
        }
        else
            throw 'Invalid node'
    }


}



