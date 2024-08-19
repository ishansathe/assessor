const contractparser = require('@solidity-parser/parser')
const fs = require('fs')
const TESTOVERFLOW = 'C:\\Users\\ACER\\assess\\overflow.sol'
const BOUNDARY = 'C:\\Users\\ACER\\assess\\Detectors\\test\\testArrayMap.sol'

let contractCode = fs.readFileSync(TESTOVERFLOW, 'utf-8')

let contractAST = contractparser.parse(String(contractCode))





// getStatementInfo(contractAST)

class FunInfo {
    constructor(_name, _visibility, _params){
        this.name = _name,
        this.visibility = _visibility
        this.parameters = _params
    }
}
function BaseFun(AST) {
    let info = []
    contractparser.visit(AST, {
        FunctionDefinition: function(func){
            // console.log(func.name, func.visibility)

            let paramList = []
            func.parameters.forEach(param => {
                // console.log(param.name, param.typeName.name, param.typeName.stateMutability)
                let paramObj = {
                    name : param.name,
                    type : param.typeName.name,
                    mutability : param.typeName.stateMutability
                }
                paramList.push(paramObj)
            })
            let newFun = new FunInfo(func.name, func.visibility, paramList)
            info.push(newFun)
        }
    })
    // console.log(info)
    return(info)
}




function getMemberAccess(node) {
    return (node.expression.name+'.'+node.memberName)  
}






// fs.writeFileSync('./overflowAST.json', JSON.stringify(contractAST))



function getIdentifiers (contractAST, funcName) {
    identifierList = []
    contractparser.visit(contractAST, {
        FunctionDefinition: function (func) {
            if(func.name == funcName) {
                contractparser.visit(func.body, {
                    Identifier: function(id, parent) {
                        let idName = id.name
                        if(parent.type == 'MemberAccess') {
                            idName = (getMemberAccess(parent))
                        }
                        if(parent.type == 'IndexAccess'){
                        //    Not really needed right now. Only the identifiers are truly used.
                        }
                        // Accessing the mapping and array values is a bit complicated.
                        
                        identifierList.push(idName)
                    }
                })
            }
        }
    })

    console.log(identifierList)
}

// getIdentifiers(contractAST, 'withdraw')

let funcTop = BaseFun(contractAST)
funcTop.forEach(info => {
    console.log(info)
    getIdentifiers(contractAST, info.name)
})
