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

    let modifiedVariable ;
    let targetFunc;
    let variableList = [];
    let conditionals = false

    let regex = /uint\d*/


    contractparser.visit(AST, {
        FunctionDefinition: function(func) {
            contractparser.visit(func, {
                FunctionCall: function(fnCall) {
                    // This is to ensure that we are calling a direct typecast (and not a member 'transfer', etc function)
                    if(fnCall.expression.name){
                        if(fnCall.expression.name.search(regex) != -1){
                            // console.log(fnCall.expression.name)
                            modifiedVariable = {
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
    
    if(modifiedVariable) {

        // If the typecasting is done, then the statevariables are also checked. Otherwise it is not required.
        contractparser.visit(AST, {
            StateVariableDeclaration: function(svb) {
                // Only 1 variable in each *state* variable declaration (for solidity)
                variableList.push(getName_and_Type(svb.variables[0], svb.variables[0].typeName, "", false, false))
                // Passing typeName for compatibility issues
                // Type is an empty string and mapping and array parameter is false for initialization.
            }
        })


        variableList.forEach(variable => {
            TruncationChecker(variable, modifiedVariable)
            SignednessChecker(variable, modifiedVariable)
        })
    }
    
}

function TruncationChecker(variable, modifiedVariable) {
    let typeNumberRegex = /\d*$/g
    let baseType, targetType
    if (variable.name == modifiedVariable.name){
        // console.log(variable.type)
        baseType = variable.type.match(typeNumberRegex)
        // Returns a list of matches. Our first element will always be the number
        baseType = Number(baseType[0])
        // console.log(baseType)

        targetType = modifiedVariable.type.match(typeNumberRegex)
        targetType = Number(targetType[0])
        // console.log(targetType)

        if ((baseType == 0) && (targetType < 256)) {
            console.log("Truncation Vulnerability detected")
        }
        else if ((baseType > targetType)){
            console.log("Truncation Vulnerability detected")
        }
    }
}

function SignednessChecker(variable, modifiedVariable) {
    let typeRegex = /.*int/g
    // '.*' accepts all values. must match with 'int' and must have none or any number of digits [0-9] after 'int'.
    if(variable.name == modifiedVariable.name){
        baseVarType = variable.type.match(typeRegex)
        baseVarType = baseVarType[0]
        // console.log(baseVarType)
        modVarType = modifiedVariable.type.match(typeRegex)
        modVarType = modVarType[0]
        // console.log(modVarType)

        if ((modVarType == "uint") && (baseVarType == 'int')){
            // This is because it only matters if an initial variable of type 'int' which can have a -ve value
            // is converted to uint.
            // Because the last bit is then no longer used to represent negative integers and hence the value changes.
            console.log("Signedness Vulnerability discovered!")
        }
    }
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
    goDeep(contractAST)
    TypeCastChecking(contractAST)
}

exports.DeepScanOverflow = (contractCode) => {
    deepScanOverflow(contractCode)
}
