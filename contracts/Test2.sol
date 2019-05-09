pragma solidity ^0.5.0;


contract Test2 {

  uint256 public s;

  constructor() public {
    
  }

  function setS(uint256 _value) public returns(uint256) {
    s = s + _value;
    return s;
  }  

  function setS(string memory _value) public returns(uint256) {
    return 4;
  }   

  /*
  function getToken() public view returns(ERC20) {
    return token;
  }

  function getToken2() public view returns(ERC20 t, uint256 num) {
    t = token;
    num = 6;
  }*/
}

 