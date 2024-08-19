const fs = require('fs')
const contractparser = require('@solidity-parser/parser')


let vulnerableUncheckedStatements = (tokenData) => {
    let StackForCurlyBraces = 0
    let uncheckedMarker = false
    for(let i = 0; i< tokenData.length; i++){
        if(tokenData[i].value == 'unchecked') {
            uncheckedMarker = true
            console.log('unchecked keyword found.')
        }
            

        if(uncheckedMarker){
            if(tokenData[i].value == '{')
                StackForCurlyBraces++;
            if(tokenData[i].value == '}')
                StackForCurlyBraces--;
        }

        if(uncheckedMarker && StackForCurlyBraces != 0) {
            if((tokenData[i].value == '+=') || (tokenData.value == '-='))
                return "Potentitally vulnerable to Integer Overflow and UnderFlow"

            if((tokenData[i].value == '+') || (tokenData.value == '-') 
                || (tokenData.value == '*') || (tokenData.value == '**'))
                return "Potentitally vulnerable to Integer Overflow and UnderFlow"
            
        } 
    }
}

let detectUnderOverFlows = () => {
    let contractData = fs.readFileSync('C:/Users/ACER/assess/overflow.sol', 'utf-8')
    let tokenData = contractparser.tokenize(contractData)
    let vulnerable = false

    // for( let i = 0; i< tokenData.length; i++){
    //     if(tokenData[i] == 'unchecked')
    // }
    // console.log(tokenData)

    
            
    vulnerable = vulnerableUncheckedStatements(tokenData)

    if(!vulnerable) {
        return "Not vulnerable to overflows."
    }

    return vulnerable
    
}


console.log(detectUnderOverFlows())