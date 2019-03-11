pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract DummyToken is ERC20 {

  constructor(uint256 supply) public {
    _mint(msg.sender, supply);
  }


}
