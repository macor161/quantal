//var DummyToken = artifacts.require("./DummyToken.sol")
var Test = artifacts.require("./Test.sol")

module.exports = function(deployer) {
  //deployer.deploy(DummyToken, 1000000)  
  deployer.deploy(Test, 456)  
}
