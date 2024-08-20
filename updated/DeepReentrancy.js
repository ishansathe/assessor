const contractparser = require('@solidity-parser/parser')

function deepScanReentrancy(contractCode) {
    contractparser.parse(contractCode)
    console.log("Yes")
}

exports.DeepScanReentrancy = (contractCode) => {
    deepScanReentrancy(contractCode)
}