pragma solidity ^0.5.0;
import "./Test2.sol";

contract Test3 is Test2 {
  uint256 public s3;

  constructor() public {

  }

 function setS3(uint256 _value) public {
    s = _value + 2;
  }  
}
