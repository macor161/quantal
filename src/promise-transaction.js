export class PromiseTransaction {

    constructor(transaction, requestType, middleware) {
        this._requestType = requestType
        this._transaction = transaction
        this._middleware = middleware || (response => response)

        return new Proxy(transaction, {
            get: this._proxyHandler.bind(this)
        })
    }


    unpromise() {
        return this._transaction
    }


    _getPromise() {
        if (!this._promise) {
            this._promise = this._transaction[this._requestType]()
                .then(this._middleware)
        }

        return this._promise
    }


    _proxyHandler(target, name) {
        if (name === 'then' || name === 'catch') 
            return this._getPromise()[name].bind(this._promise)
        
        if (target._transaction[name]) {
            return target._transaction[name]
        }
    }    
}