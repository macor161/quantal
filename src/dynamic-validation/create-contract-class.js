export function createContractClass(contractClass, methodInfo, equation) {
    const newClass = class extends contractClass {}
    newClass.dynamicValidation = (newClass.dynamicValidation || []).concat([equation])
    return newClass     
}