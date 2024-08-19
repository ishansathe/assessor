const fs = require('fs')
const contractparser = require('@solidity-parser/parser')

let detectReentrancy = () => {
    let contractData = fs.readFileSync('C:/Users/ACER/assess/reentrant.sol', 'utf-8')
    let contractAST = contractparser.parse(contractData)
    fs.writeFileSync('C:/Users/ACER/assess/testReentrant.json', JSON.stringify(contractAST))
    // console.log(tokenData.children[1].subNodes)

}

detectReentrancy()
