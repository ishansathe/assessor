const contractparser = require('@solidity-parser/parser')


function getMemberAccess(node) {
    return (node.expression.name+'.'+node.memberName)  
}

function findTxOrigin(AST) {
    let memAccess

    contractparser.visit(AST, {
        FunctionCall: function (fnCall) {
            if(fnCall.expression.name == 'require'){
                // This is because require only takes 2 arguments, 1st is the condition and the second an (optional) string statement
                // Informing user of the reason for failure of condition
                if(fnCall.arguments[0].operator == '=='){
                    let fnCallParams = fnCall.arguments[0]
                    if(fnCallParams.left.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.left)
                        if(memAccess == 'tx.origin')
                            console.log("Tx.origin is being used for 'Authentication'! Hence, is vulnerable.")
                    }

                    if(fnCallParams.right.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.right)
                        console.log(memAccess)
                        if(memAccess == 'tx.origin')
                            console.log("Tx.origin is being used for 'Authentication'! Hence, is vulnerable.")
                    }
                }
            }
            if(fnCall.expression.name == 'assert'){
                // This is because require only takes 2 arguments, 1st is the condition and the second an (optional) string statement
                // Informing user of the reason for failure of condition
                if(fnCall.arguments[0].type == '=='){
                    let fnCallParams = fnCall.arguments[0]
                    if(fnCallParams.left.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.left)
                        if(memAccess == 'tx.origin')
                            console.log("Tx.origin is being used for 'Authentication'! Hence, is vulnerable.")
                    }
                    
                    if(fnCallParams.right.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.right)
                        if(memAccess == 'tx.origin')
                            console.log("Tx.origin is being used for 'Authentication'! Hence, is vulnerable.")
                    }
                }
            }
        }
    })
}

let deepScanTxOrigin = (contractCode) => {
    let AST = contractparser.parse(contractCode)
    findTxOrigin(AST)
}

exports.DeepScanTxOrigin = (contractCode) => {
    deepScanTxOrigin(contractCode)
}