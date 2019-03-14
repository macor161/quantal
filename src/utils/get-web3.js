import Web3 from "web3"

const getWeb3 = async () => {
  
    if (document.readyState === 'complete') 
      return _getWeb3()

    return new Promise(async (resolve, reject) => {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", async () => {
        try {
          resolve(await _getWeb3())
        }
        catch(err) {
          reject(err)
        }
        
      })
    })
}

var _web3 = null


/**
 * Returns a single instance of web3 
 */
async function _getWeb3() {
  if (_web3)
    return _web3

  // Modern dapp browsers...
  if (window.ethereum) {
    _web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
    return _web3

  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    return window.web3
  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider(
      "http://127.0.0.1:9545"
    )
    return  new Web3(provider)
  }
}

export default getWeb3
