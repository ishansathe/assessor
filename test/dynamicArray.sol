// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MappingProcessor {
    // Define a mapping from an address to an unsigned integer
    mapping(address => uint256) public balances;

    // Function to update the balance for a given address
    function updateBalance(address user, uint256 newBalance) public {
        balances[user] = newBalance;
    }

    // Function to bulk update balances using arrays (instead of passing a mapping)
    function bulkUpdateBalances(address[] memory users, uint256[] memory newBalances) public {
        require(users.length == newBalances.length, "Input arrays must have the same length");

        for (uint256 i = 0; i < users.length; i++) {
            balances[users[i]] = newBalances[i];
        }
    }

    // Function to retrieve the balance of a given address
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
}