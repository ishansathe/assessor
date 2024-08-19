const contractparser = require('@solidity-parser/parser')


function getMemberAccess(node) {
    return (node.expression.name+'.'+node.memberName)  
}

function checkOperator (node) {
    if((node.operator == '+') || (node.operator == '-') || (node.operator == '*') || (node.operator == '**')
        || (node.operator == '+=') || (node.operator == '-=') || (node.operator == '*='))
        return true
    return false
}


class FuncInfo {
    constructor(_name, _visibility, _params){
        this.name = _name
        this.visibility = _visibility
        this.params = _params
    }
}

function checkVulnerable(idList, targetFunc, op) {
    // We write 'op' because we are considering both binary and unary operations
    idList.forEach(id => {
        if(id =='msg.value'){
            console.log(`Function ${targetFunc.name} is potentially vulnerable to overflow exploit at line ${op.loc.start.line}`)
        }
        for(let i = 0; i<targetFunc.params.length; i++){
            if(id === targetFunc.params[i].name){
                console.log(`Function ${targetFunc.name} is vulnerable to the overflow exploit at line ${op.loc.start.line}`)
            }
        }
    });
}

function BinaryUnaryOps(func, idList, targetFunc) {
    contractparser.visit(func, {
        Block: function (blk, parent) {
            if(parent.type == 'UncheckedStatement') {
                contractparser.visit(blk, {
                    BinaryOperation: function(bop, parent) {
                        if(parent.type == 'ExpressionStatement') {
                            if(checkOperator(bop)){
                                contractparser.visit(bop, {
                                    Identifier: function(id, parent){
                                        let idName = id.name
                                        if(parent.type == 'MemberAccess'){
                                            idName = getMemberAccess(parent)
                                        }
                                        idList.push(idName)
                                    }
                                })
                            }                                    
                            checkVulnerable(idList, targetFunc, bop)
                            
                        }
                    },
                    UnaryOperation: function(uop) {
                        if(uop){
                            console.log("Potentially vulnerable function via Unary Operations")
                        }
                    }
                })
            }
        }
    })
}

function TypeCastChecking(AST) {

    let targetVariable ;
    let targetFunc;
    let variableList = [];

    let regex = /uint\d*/
    contractparser.visit(AST, {
        FunctionDefinition: function(func) {
            contractparser.visit(func, {
                FunctionCall: function(fnCall) {
                    // This is to ensure that we are calling a direct typecast (and not a member 'transfer', etc function)
                    if(fnCall.expression.name){
                        if(fnCall.expression.name.search(regex) != -1){
                            // console.log(fnCall.expression.name)
                            // Explicit type conversions take only 1 argument.
                            // console.log(fnCall.arguments[0].name)
                            targetVariable = fnCall.arguments[0].name
                            targetFunc = (func.name)
                        }
                    }
                }
            })
        }
    })
    contractparser.visit(AST, {
        StateVariableDeclaration: function(svb) {
            // console.log(svb.variables[0].name)
            // Only 1 variable in each *state* variable declaration (for solidity)
            getName_and_Type(svb.variables[0], svb.variables[0].typeName, "", false, false)
            // Passing typeName for compatibility issues
            // Type is an empty string and mapping is false for starters.
        }
    })
    // console.log(variableList)
}

function getName_and_Type(vb, vbTypeInfo, type, mapping, array) {
    let done = false
    if(vbTypeInfo.type == 'Mapping'){
        type = type  + vbTypeInfo.keyType.name + '=>'
        mapping = true
        getName_and_Type(vb, vbTypeInfo.valueType, type, mapping, array)
    }
    if(vbTypeInfo.type == 'ElementaryTypeName'){
        if(mapping){
            type = type + vbTypeInfo.name
            done = true
        }
        if(array){
            type = vbTypeInfo.name + type
            done = true
        }
    }
    if(mapping && done) {
        console.log(vb.name, type)
    }

    if(vbTypeInfo.type == 'ArrayTypeName') {
        type = type + '[' + vbTypeInfo.length.number+ ']'
        array = true
        getName_and_Type(vb, vbTypeInfo.baseTypeName, type, mapping, array)
    }
    if(array & done) {
        console.log(vb.name, type)
    }

    if(!mapping && !array){
        console.log(vb.name, vbTypeInfo.name)
    }
    
}

function goDeep(contractAST) {
    
    let checkSignednessTruncation = false
    let typeCastArgList = []
    // let regex = /^uint\d*$/

    contractparser.visit(contractAST, {
        FunctionDefinition: function(func){ 
            
            let paramName, paramType, paramMutab
            let paramList = []

            func.parameters.forEach(param => {
                paramType = param.typeName.name
                paramName = param.name
                paramMutab = param.stateMutability
                let paramObj = {
                    name : paramName,
                    type : paramType,
                    stateMutability : paramMutab
                }
                paramList.push(paramObj)
            })


            let targetFunc = new FuncInfo(func.name, func.visibility, paramList)

            let idList = []

            BinaryUnaryOps(func, idList, targetFunc)
        }
    })

    
}


let deepScanOverflow = (contractCode) => {
    contractAST = contractparser.parse(contractCode, {loc: true})
    // goDeep(contractAST)
    TypeCastChecking(contractAST)
}

exports.DeepScanOverflow = (contractCode) => {
    deepScanOverflow(contractCode)
}
