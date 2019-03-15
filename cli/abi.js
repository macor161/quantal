 const getCallFunctions = abi => abi
    .filter(member => member.constant)



module.exports = { getCallFunctions }