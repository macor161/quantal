var DummyToken = artifacts.require("./DummyToken.sol")

module.exports = function(deployer) {
  deployer.deploy(DummyToken, 1000000)  
}
