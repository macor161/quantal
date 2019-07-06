const outdent = require('outdent')

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
    test('Format single line comments1', async () => {  
        const { formatSource } = require('../src/formatting')

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

