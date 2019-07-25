function orderABI(contract) {
  let contract_definition;
  const ordered_function_names = [];

  for (let i = 0; i < contract.legacyAST.children.length; i++) {
    const definition = contract.legacyAST.children[i];

    // AST can have multiple contract definitions, make sure we have the
    // one that matches our contract
    if (
      definition.name !== 'ContractDefinition'
        || definition.attributes.name !== contract.contract_name
    )
      continue;


    contract_definition = definition;
    break;
  }

  if (!contract_definition)
    return contract.abi;
  if (!contract_definition.children)
    return contract.abi;

  contract_definition.children.forEach(child => {
    if (child.name === 'FunctionDefinition')
      ordered_function_names.push(child.attributes.name);
  });

  // Put function names in a hash with their order, lowest first, for speed.
  const functions_to_remove = ordered_function_names.reduce((
    obj,
    value,
    index,
  ) => {
    obj[value] = index;
    return obj;
  },
  {});

  // Filter out functions from the abi
  let function_definitions = contract.abi.filter(item => functions_to_remove[item.name] !== undefined);

  // Sort removed function defintions
  function_definitions = function_definitions.sort((item_a, item_b) => {
    const a = functions_to_remove[item_a.name];
    const b = functions_to_remove[item_b.name];

    if (a > b)
      return 1;
    if (a < b)
      return -1;
    return 0;
  });

  // Create a new ABI, placing ordered functions at the end.
  const newABI = [];
  contract.abi.forEach(item => {
    if (functions_to_remove[item.name] !== undefined)
      return;
    newABI.push(item);
  });

  // Now pop the ordered functions definitions on to the end of the abi..
  Array.prototype.push.apply(newABI, function_definitions);

  return newABI;
}

function replaceLinkReferences(bytecode, linkReferences, libraryName) {
  let linkId = `__${libraryName}`;

  while (linkId.length < 40)
    linkId += '_';


  linkReferences.forEach(ref => {
    // ref.start is a byte offset. Convert it to character offset.
    const start = ref.start * 2 + 2;

    bytecode = bytecode.substring(0, start) + linkId + bytecode.substring(start + 40);
  });

  return bytecode;
}

module.exports = { orderABI, replaceLinkReferences }
