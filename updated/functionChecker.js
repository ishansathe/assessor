const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const { subscribe } = require('diagnostics_channel')
const OVERFLOW_CONTRACT_PATH = 'C:/Users/ACER/assess/overflow.sol'

let contractCode = fs.readFileSync(OVERFLOW_CONTRACT_PATH, 'utf-8')

let contractAST = contractparser.parse(contractCode)

// console.log(contractAST)

function getFuncInfo(name) {
    let ok 
    contractparser.visit(contractAST, {
        // BinaryOperation: function(func) {
        //     console.log(func)
        // },
        // ContractDefinition: function(func) {
        //     // console.log(func)
        // }, FunctionDefinition: function(func) {
        //     // console.log(func)
        // },
        // UncheckedStatement: function(ucheck) {
        //     console.log(ucheck)
        // },
        "UncheckedStatement:exit": function(block){
            contractparser.visit(block, {
                ExpressionStatement: function(expression) {
                    console.log(expression)
                }
            })
        }
        // FunctionDefinition: function(func) {
            
        //     funcName = func.name
        //     if(name == func.name){
        //         console.log("works")
        //     }
        //     funcVisibility = func.visibility
    
        //     // console.log(`The function ${funcName} is a ${funcVisibility} access specifier`)
        //     paramList = []
        //     func.parameters.forEach(param => {
        //         paramInfo = {}
        //         paramInfo.name = param.name
        //         if((param.type == 'VariableDeclaration') && (param.typeName.type == 'ElementaryTypeName'))
        //             paramInfo.type = param.typeName.name
        //         paramList.push(paramInfo)
        //     })
            
        //     console.log (funcName, funcVisibility, paramList)
        // }
    })
}


getFuncInfo("withdraw")

// tokenList = contractparser.tokenize(contractCode)
// console.log(tokenList)
