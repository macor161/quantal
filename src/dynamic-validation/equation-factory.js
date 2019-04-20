import { MethodParamNode } from './equation-nodes/method-param-node'
import { QContract } from '../qcontract'
import { createOperators } from './operators'

export function equationFactory(contractClass, methodInfo, equation) {
    return methodInfo.params
        .map(param => ({
            get [param.name]() {
                equation.addNode(new MethodParamNode(param.type, param.position))
                return createOperators(contractClass, methodInfo, equation)
            }
        }))
        .reduce((result, param) => ({ ...result, ...param }))
}