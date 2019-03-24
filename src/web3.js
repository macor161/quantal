import Web3 from "web3"

let web3
let accounts = []


export async function init(web3Instance) {
  if (web3Instance) 
    await setWeb3(web3Instance)
  else
    await setWeb3(await initWeb3())

  return getWeb3()

}


async function initWeb3() {
  
    // If document is already loaded
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




export function getWeb3() {
  if (!web3) 
    throw 'web3 is not initialized'

  return web3
}

export async function setWeb3(web3Instance) {
  web3 = web3Instance
  await updateAccounts()  
}



export function getAccounts() {
  return accounts
}



async function updateAccounts() {
  accounts = await web3.eth.getAccounts()
}

/**
 * Returns a new web3 instance
 */
async function _getWeb3() {
  // Modern dapp browsers...
  if (window.ethereum) {
    let web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
    return web3
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




