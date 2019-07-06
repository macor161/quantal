const outdent = require('outdent')
const { formatSource } = require('../src/formatting')


function getMockedColors() {
    return {
        controls: jest.fn(text => text), 
        declarations: jest.fn(text => text), 
        types: jest.fn(text => text), 
        comments: jest.fn(text => text), 
        lineNumbers: jest.fn(text => text)         
    }
}

describe('Fromatting', () => {
    xtest('Format types', async () => {  
        
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
          
            function trueFunction() private returns (bool) {
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

    
    xtest('Format single line comments', async () => {  
        
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

