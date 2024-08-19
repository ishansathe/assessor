const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const TEST_PATH1 = 'C:/Users/ACER/assess/overflow.sol'


let fileData = fs.readFileSync(TEST_PATH1)
// fileData is actually a buffer type 
let contractAST = contractparser.parse(String(fileData))
// fs.writeFileSync('C:/Users/ACER/assess/Detectors/contractAST.json', JSON.stringify(contractAST))
let tokenizedContract = contractparser.tokenize(String(fileData))


// We now have a contract tree and the function name. The goal is to find out details of the function

function visibilityChecker(contractSubNodes, func) {
    for(let i = 0; i<contractSubNodes.length; i++) {
        if((contractSubNodes[i].type == 'FunctionDefinition') 
            && (contractSubNodes[i].name == func))
            return contractSubNodes[i].visibility
    }
}

function functionChecker(contractAST, func){
    // console.log(contractAST)
    
    for(let i = 0; i<contractAST.children.length; i++){
        if(contractAST.children[i].kind == 'contract'){
            // console.log(contractAST.children[i].subNodes)
            for(let j = 0; j < contractAST.children[i].subNodes.length; j++) {
                return visibilityChecker(contractAST.children[i].subNodes, func)
                
            }
        }
    }
}



let visibility = functionChecker(contractAST, "withdraw")
console.log(`Therefore, the function withdraw is ${visibility} and hence vulnerable to the Overflow Vulnerability!`)