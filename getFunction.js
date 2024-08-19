const fs = require('fs')
const contractparser = require('@solidity-parser/parser')

const TEST_PATH1 = 'C:/Users/ACER/assess/overflow.sol'
const TEST_PATH2 = 'C:/Users/ACER/assess/VulnContract/TxOrigin/SmartContract5.sol'

let fileData = fs.readFileSync(TEST_PATH1)
// fileData is actually a buffer type 

let contractAST = contractparser.parse(String(fileData))
// fs.writeFileSync('C:/Users/ACER/assess/Detectors/contractAST.json', JSON.stringify(contractAST))


let tokenizedContract = contractparser.tokenize(String(fileData))



// console.log(tokenizedContract)

// What I want to see, 
/*
    Whenever a vulnerability is discovered, say for overflow in this case.
    I want to see the function inside which the vulnerability  was discovered.
    We are trying to achieve and detect functional dependency.
    So any variable, functions, lowlevel functions, etc that are used can be detected and identified
    later on via the BFS search of the AST.


    Till then, I have to work on finding the above.
    No, I will search the function. and the vulnerability inside it.
    I have to search all functions, since we don't know location of vulnerability before hand.


    --------------- Note
     Our tool should also be able to detect use of libraries such as safemath for older compiler versions.
    ----------------------------------

    Note, this is for the BFS part
    If the operand does not match the parameter of the function, then it is likely to be stored elsewhere,
    either retrieved as ouput from another function
    or stored in a state variable.

    Thus, this same function will be recursively called.
    Otherwise, the result of vulnerable or not will be returned.
*/


// We now have a contract tree and the function name. The goal is to find out details of the function

function visibilityChecker(contractSubNodes, func) {
    for(let i = 0; i<contractSubNodes.length; i++) {
        if((contractSubNodes[i].type == 'FunctionDefinition') 
            && (contractSubNodes[i].name == func))
            return contractSubNodes[i].visibility
    }
}

function statementChecker(functionBody, func) {
    // This body is usually of type 'block', but i guess there can be single lines as well. Hence it's that way.
    // Here, the statements as a whole are passed as the body.
    // This could potentially return an error when an if statement with a single statement is called.

    if(Array.isArray(functionBody))
        functionBody.forEach(element => {
            console.log(element)
        })

}

// For array and mapping type variables.
function indexAccess(expressionParam) {    
    if (expressionParam.type == 'IndexAccess'){
        // Assumption is made that param with type 'indexAccess has already been sent to here.
        indexAccess(expressionParam.base) //This is to allow for mapping of mappings    
            // I think I will keep multi dimensional arrays out of scope for now.
        if (expressionParam.type == 'Identifier') {
            return expressionParam.name
        }
    }
}

function getOperand(param) {
    if(param.type == 'Identifier')
        return param.name
    if(param.type = 'IndexAccess')
        getArrayMapOperands(param)
}

// function getArrayMapOperands() {
//     if(b)
// }


// You know, to avoid confusion, I'll use the standard way.
// This function is to check the statements for the Overflow vulnerability.
// Hence, it will collect the operands as a list 
function statemChecker(contractSubNodes, func) {

    let funStatements;
    for(let i = 0; i<contractSubNodes.length; i++) {
        if((contractSubNodes[i].type == 'FunctionDefinition') 
            && (contractSubNodes[i].name == func))
            funStatements = contractSubNodes[i].body.statements
    }

    let uncheckedBlock;
    for (let i=0; i<funStatements.length; i++) {
        if(funStatements[i].type == 'UncheckedStatement'){
            uncheckedBlock = funStatements[i].block.statements
        }
    }

    // console.log(uncheckedBlock)

    operandList = []
    for(let i = 0; i< uncheckedBlock.length; i++){
        if((uncheckedBlock[i].type == 'ExpressionStatement') 
            && (uncheckedBlock[i].expression.type == 'BinaryOperation')  
            && (uncheckedBlock[i].expression.operator != '=')) 
            {
                console.log(uncheckedBlock[i].expression.left)
                console.log(uncheckedBlock[i].expression.right)
            }
    }
}
// and then compare it with parameters.
// To see if these parameters of the public function are indeed used in the on the unchecked arithmetic operation.
// This part will be done in the main function. (or in another one)


function functionChecker(contractAST, func){
    // console.log(contractAST)
    let paramlist = []
    
    for(let i = 0; i<contractAST.children.length; i++){
        if(contractAST.children[i].kind == 'contract'){
            // console.log(contractAST.children[i].subNodes)
            paramlist = ['amount'] //Output of paramchecker

            statemChecker(contractAST.children[i].subNodes, func)

            // statementChecker()


            // Now, if overflow keyword is found, visibility is public, then it is sensible to search for operands.
            // Otherwise, an expectation is set where developer is smart enough to not cause overflow to their own detriment.
            // We then declare as non vulnerable to this type.
            // However, the function is created in the same way as prior ones to enable modularity and flexibility for future.

            // for(let j = 0; j < contractAST.children[i].subNodes.length; j++) {
            //     if((contractAST.children[i].subNodes[j].type == 'FunctionDefinition') 
            //         && (contractAST.children[i].subNodes[j].name == func))
            //         console.log(contractAST.children[i].subNodes[j].body.statements)
            // }
        }
    }
}

functionChecker(contractAST, "withdraw")