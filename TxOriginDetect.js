const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const PATH = 'C:/Users/ACER/assess/VulnContract/'
const VULN_TYPE = 'TxOrigin/'


let detectTxOrigin = (filename) => {
    let contract = fs.readFileSync(`${PATH}${VULN_TYPE}${filename}`)
    let tokenObject = contractparser.tokenize(String(contract))
    // This turns the file into a list of keywords, identifiers, punctuators and identifiers.
    // console.log(tokenObject)

    // Since tokenObject is actually an array of objects
    for(let i=0; i<tokenObject.length; i++ ){
        if((tokenObject[i].type == 'Identifier') && (tokenObject[i].value == 'tx'))
            if((tokenObject[i+1].type == 'Punctuator') && (tokenObject[i+1].value == '.'))
                if((tokenObject[i+2].type == 'Identifier') && (tokenObject[i+2].value == 'origin'))
                    return true
    }
}

// detectTxOrigin('SmartContract1.sol')

let getTargetFiles = () => {
    fileList = fs.readdirSync(`${PATH}${VULN_TYPE}`)

    let detectionResult 
    fileList.forEach(file => {
        detectionResult = detectTxOrigin(file)
        if(detectionResult)
            console.log(`Usage of tx.origin detected in ${file}`)
    });
}

getTargetFiles()