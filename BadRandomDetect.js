const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const VULN_TYPE = "UnsafeRandomization"

let detectBadRandomization = () => {
    let contractData = fs.readFileSync('', 'utf-8')
    let tokenData = contractparser.tokenize(contractData)

    for(let i = 0; i<tokenData.length; i++){
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'hash'))
                    return ("Potentially Insecure Randomization by use of block.hash")
        
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'difficulty'))
                    return ("Potentially Insecure Randomization by use of block.difficulty")
        
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'gaslimit'))
                    return ("Potentially Insecure Randomization by use of block.gaslimit")
        
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'number'))
                    return ("Potentially Insecure Randomization by use of block.number")
        
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'timestamp'))
                    return ("Potentially Insecure Randomization by use of block.timestamp")

        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'block'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'hash'))
                    return ("Potentially Insecure Randomization by use of block.hash")

    }
}

detectBadRandomization(filename)

// Remember, this code is incomplete because it does not have the file to scan. 
// We also have to look for databases.