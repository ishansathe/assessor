const fs = require('fs')
const contractparser = require('@solidity-parser/parser')
const overflow = require('./DeepOverflow.js')
const ARRAY_MAP = "C:\\Users\\ACER\\assess\\Detectors\\test\\testArrayMap.sol"
const OVERFLOW = 'C:/Users/ACER/assess/overflow.sol'

let contractCode = fs.readFileSync(ARRAY_MAP, 'utf-8')


function shallowOverflowScan(token, tokenList, i) {
    // console.log(true)
    let regex = /^uint\d+$/

    let checkFurther = false
    if((token.value == '+')  || (token.value == '-') || (token.value == '*') || (token.value == '**') || (token.value == '++')
        || (token.value == '+=') || (token.value == '-=') || (token.value == '*=') || (token.value == '--')){
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
        overflow.DeepScanOverflow(contractCode)
        console.log("Beginning Deep Scan")
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
            overFlowScan = shallowOverflowScan(tokenList[i], tokenList, i)
            // console.log('found')
            // console.log(token)
            // overFlowScan = true
        }

        if(!txOriginScan){
            // Deep Scan
            txOriginScan = true
        }
        if(!reentrancyScan){
            // Deep Scan
            reentrancyScan = true
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