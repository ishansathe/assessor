const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const TEST_PATH1 = 'C:/Users/ACER/assess/overflow.sol'


let fileData = fs.readFileSync(TEST_PATH1)
// fileData is actually a buffer type 
let contractAST = contractparser.parse(String(fileData))
// fs.writeFileSync('C:/Users/ACER/assess/Detectors/contractAST.json', JSON.stringify(contractAST))
let tokenizedContract = contractparser.tokenize(String(fileData))


function paramChecker(contractSubNodes, func) {
    let paramlist = []
    for(let i = 0; i<contractSubNodes.length; i++) {
        if((contractSubNodes[i].type == 'FunctionDefinition') 
            && (contractSubNodes[i].name == func))
            contractSubNodes[i].parameters.forEach(element => {
                paramlist.push(element.name)
            });
    }

    return paramlist
}


function functionChecker(contractAST, func){
    // console.log(contractAST)
    
    for(let i = 0; i<contractAST.children.length; i++){
        if(contractAST.children[i].kind == 'contract'){
            // console.log(contractAST.children[i].subNodes)
            return paramChecker(contractAST.children[i].subNodes, func)


            // for(let j = 0; j < contractAST.children[i].subNodes.length; j++) {
            //     if((contractAST.children[i].subNodes[j].type == 'FunctionDefinition') 
            //         && (contractAST.children[i].subNodes[j].name == func))
            //         console.log(contractAST.children[i].subNodes[j].parameters)
            // }
        }
    }
}

console.log(functionChecker(contractAST, "withdraw"))

