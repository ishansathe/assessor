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
                            console.log(fnCall.expression.name)
                            targetVariable = {
                                type: fnCall.expression.name,
                                name : fnCall.arguments[0].name
                            }
                            targetFunc = (func.name)
                        }
                    }
                }
            })
            if (func.name == targetFunc)
                func.parameters.forEach(param => {
                    variableList.push(getName_and_Type(param, param.typeName, "", false, false))
                })
        }
    })
    contractparser.visit(AST, {
        StateVariableDeclaration: function(svb) {
            // console.log(svb.variables[0].name)
            // Only 1 variable in each *state* variable declaration (for solidity)
            variableList.push(getName_and_Type(svb.variables[0], svb.variables[0].typeName, "", false, false))
            // Passing typeName for compatibility issues
            // Type is an empty string and mapping is false for starters.
        }
    })
    console.log(targetVariable)
    console.log(variableList)

    variableList.forEach(variable => {
        if (variable.name == targetVariable.name){
            console.log("Match found")
        }
    })
}

function getName_and_Type(vb, vbTypeInfo, type, mapping, array) {
    let done = false
    if(vbTypeInfo.type == 'Mapping'){
        type = type  + vbTypeInfo.keyType.name + '=>'
        mapping = true
        return getName_and_Type(vb, vbTypeInfo.valueType, type, mapping, array)
        // We use return here to ensure that the return value of the function when called again is returned.
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
        // console.log(type,vb.name)
        return {
            type: type, 
            name: vb.name
        }
    }

    if(vbTypeInfo.type == 'ArrayTypeName') {
        type = type + '[' + vbTypeInfo.length.number+ ']'
        array = true
        return getName_and_Type(vb, vbTypeInfo.baseTypeName, type, mapping, array)
        // This method explains why remix (would accept values as [20][10] even though the array was actually [10][20])
        // I am unsure if this is the expected behaviour in all cases.
    }
    if(array & done) {
        // console.log(type,vb.name)
        return {
            type: type, 
            name: vb.name
        }

    }

    if(!mapping && !array){
        // console.log (vbTypeInfo.name, vb.name)
        return {
            type: vbTypeInfo.name, 
            name: vb.name
        }
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
