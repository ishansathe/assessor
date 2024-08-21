const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const overflow = require('./DeepOverflow.js')
const txorigin = require('./DeepTxOrigin.js')
const reentrancy = require('./DeepReentrancy.js')
const ARRAY_MAP = "C:\\Users\\ACER\\assess\\Detectors\\test\\testArrayMap.sol"
const OVERFLOW = 'C:/Users/ACER/assess/overflow.sol'
const TX_ORIGIN = 'C:\\Users\\ACER\\assess\\txOrigin.sol'
const RE_ENTRANCY = 'C:\\Users\\ACER\\assess\\reentrant.sol'

let contractCode = fs.readFileSync(TX_ORIGIN, 'utf-8')


function shallowOverflowScan(tokenList, i) {
    // console.log(true)
    let regex = /^uint\d+$/

    let checkFurther = false
    if((tokenList[i].value == '+')  || (tokenList[i].value == '-') || (tokenList[i].value == '*') 
        || (tokenList[i].value == '**') || (tokenList[i].value == '++') || (tokenList[i].value == '--')
        || (tokenList[i].value == '+=') || (tokenList[i].value == '-=') || (tokenList[i].value == '*=')){
        checkFurther = true
    }
    
    // Expression for string that begins with uint and contains a digit. (ranges from uint 8 to 256  all combinations)
    if((tokenList[i].value.search(regex) != -1) && (tokenList[i+1].value =='(')){
        checkFurther = true
    }
    // This was for typecasting -- truncation and signedness bug both.
        
    if(!checkFurther)
        return false
    else {
        // Deep Scan.
        // Pass the code to deep scan
        console.log("Beginning Deep Scan")
        overflow.DeepScanOverflow(contractCode)
        return true
    }
}

function shallowTxOriginScan(tokenList, i) {
    let checkFurther = false
    
    if((tokenList[i].type == 'Identifier') && (tokenList[i].value == 'tx'))
        if((tokenList[i+1].type == 'Punctuator') && (tokenList[i+1].value == '.'))
            if((tokenList[i+2].type == 'Identifier') && (tokenList[i+2].value == 'origin'))
                checkFurther = true
    
    if(!checkFurther) {
        return false
    }
    else {
        console.log("Beginning Deep Scan")
        txorigin.DeepScanTxOrigin(contractCode)
        return true
    }
}

function shallowReentrancyScan(tokenList, i) {
    let checkFurther = false
    if ((tokenList[i].value == '.') && (tokenList[i+1].value == 'call')){
        checkFurther = true
    }

    if(!checkFurther) {
        return false
    }
    else{
        console.log("Beginning Deep Scan for Reentrancy Vulnerability")
        reentrancy.DeepScanReentrancy(contractCode)
        return true
    }

}

function codeTraverser(scCode) {
    let tokenList = contractparser.tokenize(scCode)
    // console.log(tokenList)

    let overFlowScan = false

    let txOriginScan, reentrancyScan, uncheckedCallScan, badRandomScan = false

    for(let i =0; i<tokenList.length; i++) {
        if(!overFlowScan) {
            overFlowScan = shallowOverflowScan(tokenList, i)
            // console.log('found')
            // console.log(token)
            // overFlowScan = true
        }

        if(!txOriginScan){
            txOriginScan = shallowTxOriginScan(tokenList, i)
            // Deep Scan
            // txOriginScan = true
        }
        if(!reentrancyScan){
            // Deep Scan

            reentrancyScan = shallowReentrancyScan(tokenList, i)
        }
        if(!uncheckedCallScan){
            // Deep Scan
            uncheckedCallScan = true
        }
        if(!badRandomScan){
            // Deep Scan
            badRandomScan = true
        }
    }
    // console.log(tokenList)
}


(codeTraverser(contractCode))