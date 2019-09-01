const outdent = require('outdent')
const { formatSource } = require('../src/formatting')
const { formatWarning, formatWarnings } = require('../src/formatting/format-warnings')
const { formatError, formatErrors } = require('../src/formatting/format-error')


function getMockedColors() {
  return {
    controls: jest.fn(text => text),
    declarations: jest.fn(text => text),
    types: jest.fn(text => text),
    comments: jest.fn(text => text),
    lineNumbers: jest.fn(text => text),
  }
}

const warnings = [
  {
    component: 'general',
    formattedMessage: 'contracts/ERC20.sol:33:9: Warning: Unused local variable.\n        uint256 t = 3;\n        ^-------^\n',
    message: 'Unused local variable.',
    severity: 'warning',
    sourceLocation: {
      absolutePath: '/test-project/contracts/ERC20.sol',
      end: 1192,
      file: 'ERC20.sol',
      start: 1183,
      line: 33,
      col: 9,
    },
    type: 'Warning',
    sourceContext: {
      30: '    * @dev Total number of tokens in existence',
      31: '    */',
      32: '    function totalSupply() public view returns (uint256) {',
      33: '        uint256 t = 3;',
      34: '        return _totalSupply;',
      35: '    }',
    },
  },
  {
    component: 'general',
    formattedMessage: '/test-project/contracts/Test2.sol:15:17: Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.\n  function setS(string memory _value) public returns(uint256) {\n                ^------------------^\n',
    message: 'Unused function parameter. Remove or comment out the variable name to silence this warning.',
    severity: 'warning',
    sourceLocation: {
      absolutePath: '/test-project/contracts/Test2.sol',
      end: 233,
      file: 'Test2.sol',
      start: 213,
      line: 15,
      col: 17,
    },
    type: 'Warning',
    sourceContext: {
      12: '    return s;',
      13: '  }  ',
      14: '',
      15: '  function setS(string memory _value) public returns(uint256) {',
      16: '    return 4;',
      17: '  }   ',
    },
  },
  {
    component: 'general',
    formattedMessage: '/test-project/contracts/Test2.sol:15:3: Warning: Function state mutability can be restricted to pure\n  function setS(string memory _value) public returns(uint256) {\n  ^ (Relevant source part starts here and spans across multiple lines).\n',
    message: 'Function state mutability can be restricted to pure',
    severity: 'warning',
    sourceLocation: {
      absolutePath: '/test-project/contracts/Test2.sol',
      end: 278,
      file: 'Test2.sol',
      start: 199,
      line: 15,
      col: 3,
    },
    type: 'Warning',
    sourceContext: {
      12: '    return s;',
      13: '  }  ',
      14: '',
      15: '  function setS(string memory _value) public returns(uint256) {',
      16: '    return 4;',
      17: '  }   ',
    },
  },
]

describe('Fromatting', () => {
  test('Format types', async () => {
    const source = outdent`
        contract Test is Test2 {
            uint256 public s3;
          
            constructor(bytes32 _key, address _address) public {
              string memory myString;
            }
          
            function registerContract(bytes32 _key, address _address) public returns (bool) {
              require(_address == address(0));
              int var1 = -32;    
          
              return true;
            }
        }`

    const colors = getMockedColors()

    formatSource(source.split('\n'), { colors })

    expect(colors.types.mock.calls.length).toBe(9)
    expect(colors.types.mock.calls[0][0]).toBe('uint256')
    expect(colors.types.mock.calls[1][0]).toBe('bytes32')
    expect(colors.types.mock.calls[2][0]).toBe('address')
    expect(colors.types.mock.calls[3][0]).toBe('string')
    expect(colors.types.mock.calls[4][0]).toBe('bytes32')
    expect(colors.types.mock.calls[5][0]).toBe('address')
    expect(colors.types.mock.calls[6][0]).toBe('bool')
    expect(colors.types.mock.calls[7][0]).toBe('address')
    expect(colors.types.mock.calls[8][0]).toBe('int')
  })

  test('Format declarations', async () => {
    const source = outdent`
        pragma solidity ^0.5.0;
        import "./Test2.sol";

        contract Test is Test2 {          
            constructor(bytes32 _key, address _address) public {
              bool t = false;
            }
          
            function f() private returns (bool) {
              int var1 = -32;    
          
              return true;
            }
        }`

    const colors = getMockedColors()

    formatSource(source.split('\n'), { colors })

    expect(colors.declarations.mock.calls.length).toBe(9)

    expect(colors.declarations.mock.calls[0][0]).toBe('solidity')
    expect(colors.declarations.mock.calls[1][0]).toBe('contract')
    expect(colors.declarations.mock.calls[2][0]).toBe('is')
    expect(colors.declarations.mock.calls[3][0]).toBe('constructor')
    expect(colors.declarations.mock.calls[4][0]).toBe('public')
    expect(colors.declarations.mock.calls[5][0]).toBe('false')
    expect(colors.declarations.mock.calls[6][0]).toBe('function')
    expect(colors.declarations.mock.calls[7][0]).toBe('private')
    expect(colors.declarations.mock.calls[8][0]).toBe('true')
  })


  test('Format controls', async () => {
    const source = outdent`
        pragma solidity ^0.5.0;
        import "./Test2.sol";

        contract Test is Test2 {  
            event Event1(address indexed member); 

            constructor(bytes32 _key, address _address) public {
              require(_address == address(0));
            }
          
            function f() private returns (bool) {
              int var1 = -32;    
              emit Event1(address(0));
              return true;
            }
        }`

    const colors = getMockedColors()

    formatSource(source.split('\n'), { colors })

    expect(colors.controls.mock.calls.length).toBe(6)

    expect(colors.controls.mock.calls[0][0]).toBe('pragma')
    expect(colors.controls.mock.calls[1][0]).toBe('import')
    expect(colors.controls.mock.calls[2][0]).toBe('require')
    expect(colors.controls.mock.calls[3][0]).toBe('returns')
    expect(colors.controls.mock.calls[4][0]).toBe('emit')
    expect(colors.controls.mock.calls[5][0]).toBe('return')
  })


  test('Format single line comments', async () => {
    const source = outdent`
        // This is a test
        function setS(uint256 _value) public returns(uint256) {
          s = s + _value; // This is another test
          return s;
        } `

    const colors = getMockedColors()

    formatSource(source.split('\n'), { colors })

    expect(colors.comments.mock.calls.length).toBe(2)
    expect(colors.comments.mock.calls[0][0]).toBe('// This is a test')
    expect(colors.comments.mock.calls[1][0]).toBe('// This is another test')
  })
})

describe('Error and warning formatting', () => {
  test('formatWarning should return the correct formatting', async () => {
    expect(formatWarning(warnings[0])).toMatchSnapshot()
  })

  test('formatWarnings should return the correct formatting', async () => {
    expect(formatWarnings(warnings)).toMatchSnapshot()
  })

  test('formatError should return the correct formatting', async () => {
    expect(formatError(warnings[0])).toMatchSnapshot()
  })

  test('formatErrors should return the correct formatting', async () => {
    expect(formatErrors(warnings)).toMatchSnapshot()
  })
})
