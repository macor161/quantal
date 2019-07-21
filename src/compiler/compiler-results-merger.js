class CompilerResultsMerger {

    constructor(compilerResults = []) {
        this._lastAstId = 0
        this._lastAstNodeId = 0
        this._results = {
            contracts: {},
            sources: {},
            errors: []
        }

        for (const compilerResult of compilerResults)
            this.addResults(compilerResult)
    }

    addResults(compilerResults) {
        this._results.sources = { ...(this._results.sources), ...(compilerResults.sources) }
        this._results.contracts = { ...(this._results.contracts), ...(compilerResults.contracts) }

        if (compilerResults.errors)
            this._results.errors = this._results.errors.concat(compilerResults.errors)
    }

    getResults() {
        return this._results
    }
}

module.exports = { CompilerResultsMerger }