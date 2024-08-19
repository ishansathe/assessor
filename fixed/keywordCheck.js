const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const TEST_PATH1 = 'C:/Users/ACER/assess/overflow.sol'


let fileData = fs.readFileSync(TEST_PATH1)
// fileData is actually a buffer type 
let contractAST = contractparser.parse(String(fileData))
// fs.writeFileSync('C:/Users/ACER/assess/Detectors/contractAST.json', JSON.stringify(contractAST))
let tokenizedContract = contractparser.tokenize(String(fileData))


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



// I was worried about the time complexity of passing so many arrays and performing loops.
// But apparently when objects and arrays are passed in JavaScript, they are always just pointers!
function uncheckedStatementChecker(index, tokenArray) {
    let uncheckedMarker = false
    let braceStackCounter = 0
    for(index; index<tokenArray.length; index++){
        if(tokenArray[index].value == 'unchecked'){
            uncheckedMarker = true
        }

        if(uncheckedMarker) {
            if(tokenArray[index].value == '{'){
                braceStackCounter ++;
            }
            if(tokenArray[index].value == '}'){
                braceStackCounter--;
            }
        }

        if(uncheckedMarker && braceStackCounter != 0) {
            if((tokenArray[index].value == '+=') || (tokenArray[index].value == '-='))
                return true

            if((tokenArray[index].value == '+') || (tokenArray[index].value == '-') 
                || (tokenArray[index].value == '*') || (tokenArray[index].value == '**')) 
            // Exponentiation can indeed cause overflow.
                return true
        }
    }
    return false
}

function KeywordChecker (tokenArray) {

    let functionManager = ""
    let vulnerability
    for(i=0; i<tokenArray.length; i++){
        if(tokenArray[i].value == 'function'){
            functionManager = tokenArray[i+1].value
            if(uncheckedStatementChecker(i, tokenArray)){
                console.log(`Unchecked Overflow vulnerability found in function: ${functionManager}`)
            }
        }

        if(functionManager != ""){
            
        }
    }
}

KeywordChecker(tokenizedContract)