const fs = require('fs')
const contractparser = require('@solidity-parser/parser')

const DYNAMICARRAY_FILE ='C:\\Users\\ACER\\assess\\Detectors\\test\\dynamicArray.sol'
const TEST_ARRAY_MAP = 'C:/Users/ACER/assess/Detectors/test/testArrayMap.sol'
const txOrigin = 'C:\\Users\\ACER\\assess\\txOrigin.sol'

readData = fs.readFileSync(txOrigin, 'utf-8')
contractAST = contractparser.parse(String(readData))
fs.writeFileSync('./txOrigin.json', JSON.stringify(contractAST))


// fs.writeFileSync('./arrayMapAST.json', JSON.stringify(contractAST))
// fs.writeFileSync('./dynamicArrayAST.json', JSON.stringify(contractAST))

contractparser.visit(contractAST, {
    FunctionDefinition: function(node) {
        // console.log(node)
    }
})

let tokenList = (contractparser.tokenize(readData))

tokenList.forEach(token => {
    if(token.type =='Type'){
        console.log(token)
        // uint104 can be identified using this.
    }
});