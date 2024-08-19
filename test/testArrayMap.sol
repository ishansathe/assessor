// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract test{
    mapping (bool => mapping (string => uint) ) public mapper;
    uint8 [10][20] public twoD;
    mapping(address => mapping(uint => uint)) testAddVal;
    uint public testVal;

    function setMap(uint count, string calldata message, bool state) public returns (bool){
        if (count < 244444)
            mapper[state][message] = count;
        return setVal(count, state);
    }

    function setTwoD(uint8 num1, uint8 num2, uint8 value) public {
        twoD[num1][num2] = value;
        twoD[num1][num2]++;
    }

    function setVal(uint _newVal, bool _result) private returns (bool) {
        testVal = uint104(_newVal);
        testVal++;
        return _result;
    }

    function sendEth(address payable to) payable external {
        to.transfer(2);
        testAddVal[msg.sender][3] = msg.value;
    }

    fallback() external  payable { }
    receive() external  payable { }
}
