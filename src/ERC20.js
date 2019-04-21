import { ERC20 } from './index'
import { Equation } from './index'
import { equationFactory } from './index'

/**
 * @typedef {import("./dynamic-validation").Operators} Operators
 */


export class ERC20Test extends ERC20 {

}


/**
 * @typedef {Object} myMethodParams
 * @property {Operators} param1
 * @property {Operators} param2
 */
Object.defineProperty(ERC20Test, 'myMethod', {
    get() { 
        const _this = this
        return {
            /**
             * @type {myMethod2Params}
             */
            get require() {
                const methodInfo = { 
                    name: 'myMethod',
                    params: [{ name: 'param1', type: 'uint', position: 45 }]
                }
                const equation = new Equation(methodInfo.name)
                return equationFactory(_this, methodInfo, equation)
            }
        }
    }
})


/**
 * @typedef {Object} myMethod2Params
 * @property {Operators} param1
 * @property {Operators} param2
 */
Object.defineProperty(ERC20Test, 'myMethod2', {
    get() { 
        const _this = this
        return {
            /**
             * @type {myMethod2Params}
             */
            get require() {
                const methodInfo = { 
                    name: 'myMethod2',
                    params: [{ name: 'param2', type: 'uint', position: 45 }]
                }
                const equation = new Equation(methodInfo.name)
                return equationFactory(_this, methodInfo, equation)
            }
        }
    }
})





