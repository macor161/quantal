import getWeb3 from './utils/get-web3'
import erc20 from '../build/contracts/DummyToken.json'

export * from './eblocks/index'

export class Test {

    async a() {

        const web3 = await getWeb3()
    }
}