const { preParse } = require('../src/solidity-preparser')
const { readFile } = require('fs-extra')
const path = require('path')
const debug = require('debug')('test')
const outdent = require('outdent')

describe('preParse', () => {
    test('Supports NO whitespace between solidity and version', async () => {
        const content = outdent`
        pragma solidity^0.4.24;

        contract TestContract {}
        `

        const nbOfLines = preParse(content)
            .split('\n')
            .length

        expect(nbOfLines).toEqual(1)
    })

    
    test('Supports global imports', async () => {
        const content = outdent`
        pragma solidity 0.4.18;

        import "zeppelin-solidity/contracts/math/SafeMath.sol";
        import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";        
        
        /**
         * 
         */
        contract Contract is Pausable {
            uint 3;
        }`

        
        const nbOfLines = preParse(content)
            .split('\n')
            .length

        expect(nbOfLines).toEqual(3)
    })

    test('Supports named symbols imports', async () => {
        const content = outdent`
        pragma solidity 0.4.18;

        import { Contract1, Contract2 } from "./libraries/Test.sol";
        import {symbol1 as alias, symbol2} from "filename";      
        
        /**
         * 
         */
        contract Contract {
        }`

        
        const nbOfLines = preParse(content)
            .split('\n')
            .length

        expect(nbOfLines).toEqual(3)
    })
})