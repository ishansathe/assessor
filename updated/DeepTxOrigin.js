const contractparser = require('@solidity-parser/parser')


function getMemberAccess(node) {
    return (node.expression.name+'.'+node.memberName)  
}

function checkNicheAuthentication(paramLeft, paramRight){
    let leftMemAccess, rightMemAccess
    if(paramLeft.type == 'MemberAccess'){
        leftMemAccess = getMemberAccess(paramLeft)
    }
    if(paramRight.type == 'MemberAccess'){
        rightMemAccess = getMemberAccess(paramRight)
    }

    if(((leftMemAccess == 'tx.origin') && (rightMemAccess == 'msg.sender') )
        ||((leftMemAccess == 'msg.sender') && (rightMemAccess == 'tx.origin'))) {
    return true
    }
    else return false
}

function findTxOrigin(AST) {
    let memAccess
    let niche = false

    contractparser.visit(AST, {
        FunctionCall: function (fnCall, parent) {
            if(fnCall.expression.name == 'require'){
                // This is because require only takes 2 arguments, 1st is the condition and the second an (optional) string statement
                // Informing user of the reason for failure of condition
                if(fnCall.arguments[0].operator == '=='){
                    let fnCallParams = fnCall.arguments[0]
                    if(fnCallParams.left.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.left)

                        niche = checkNicheAuthentication(fnCallParams.left, fnCallParams.right)
                        if (niche) {
                            console.log("Niche use case detected. Not vulnerable")
                        }
                        else if(memAccess == 'tx.origin')
                            console.log("Tx.origin is being used for 'Authentication'! Hence, is vulnerable.")
                    }

                    if(fnCallParams.right.type == "MemberAccess"){
                        memAccess = getMemberAccess(fnCallParams.right)
                        niche = checkNicheAuthentication(fnCallParams.left, fnCallParams.right)
                        if (niche) {
                            console.log("Niche use case detected. Not vulnerable")
                        }
                        else if(memAccess == 'tx.origin')
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
            if(parent.type == 'EmitStatement'){
                fnCall.arguments.forEach( arg => {
                    if (arg.type == 'MemberAccess'){
                        memAccess = getMemberAccess(arg)
                        if(memAccess =='tx.origin'){
                            console.log("Tx.origin is used in an emit statement for events. Hence, not vulnerable")
                        }
                    }
                })
            }
        },
    })
}

let deepScanTxOrigin = (contractCode) => {
    let AST = contractparser.parse(contractCode)
    findTxOrigin(AST)
}

exports.DeepScanTxOrigin = (contractCode) => {
    deepScanTxOrigin(contractCode)
}