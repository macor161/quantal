class CompilerResultsMerger {

    constructor(compilerResults = []) {
        this._lastSourceId = 0
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
        let lastSourceId = this._lastSourceId

        for (const [path, source] of Object.entries(compilerResults.sources)) {
            source.id += this._lastSourceId
            this._results.sources[path] = source

            if (lastSourceId < source.id)
                lastSourceId = source.id
        }

        this._lastSourceId = lastSourceId + 1
        this._results.contracts = { ...(this._results.contracts), ...(compilerResults.contracts) }

        if (compilerResults.errors)
            this._results.errors = this._results.errors.concat(compilerResults.errors)
    }

    getResults() {
        return this._results
    }
}

module.exports = { CompilerResultsMerger }