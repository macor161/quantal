import documentReady from 'document-ready-promise'

/**
 * Returns an EthereumProvider instance
 */
export default async function() {

  await documentReady()

  // Modern dapp browsers...
  if (window.ethereum) {
    await window.ethereum.enable()
    return window.ethereum
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    return window.web3.givenProvider
  }
  // Fallback to localhost; use dev console port by default...
  else {
    return new Web3.providers.HttpProvider(
      "http://127.0.0.1:9545"
    )
  }
}




