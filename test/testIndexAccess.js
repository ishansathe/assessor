const contractparser = require('@solidity-parser/parser')
const fs = require('fs')

let object = {
    "type": "BinaryOperation",
    "operator": "=",
    "left": {
        "type": "IndexAccess",
        "base": {
            "type": "IndexAccess",
            "base": {
                "type": "Identifier",
                "name": "mapper"
            },
            "index": {
                "type": "Identifier",
                "name": "state"
            }
        },
        "index": {
            "type": "Identifier",
            "name": "message"
        }
    },
    "right": {
        "type": "BinaryOperation",
        "operator": "+",
        "left": {
            "type": "Identifier",
            "name": "count"
        },
        "right": {
            "type": "NumberLiteral",
            "number": "3",
            "subdenomination": null
        }
    }
}

let object2 = {
    "type": "BinaryOperation",
    "operator": "-",
    "left": {
        "type": "IndexAccess",
        "base": {
            "type": "Identifier",
            "name": "balances"
        },
        "index": {
            "type": "MemberAccess",
            "expression": {
                "type": "Identifier",
                "name": "msg"
            },
            "memberName": "sender"
        }
    },
    "right": {
        "type": "Identifier",
        "name": "amount"
    }
}

let object3 = {
    "type": "BinaryOperation",
    "operator": "=",
    "left": {
        "type": "IndexAccess",
        "base": {
            "type": "IndexAccess",
            "base": {
                "type": "Identifier",
                "name": "testAddVal"
            },
            "index": {
                "type": "MemberAccess",
                "expression": {
                    "type": "Identifier",
                    "name": "msg"
                },
                "memberName": "sender"
            }
        },
        "index": {
            "type": "NumberLiteral",
            "number": "3",
            "subdenomination": null
        }
    },
    "right": {
        "type": "MemberAccess",
        "expression": {
            "type": "Identifier",
            "name": "msg"
        },
        "memberName": "value"
    }
}
// console.log(object)

let object4 = JSON.parse(fs.readFileSync('C:\\Users\\ACER\\assess\\Detectors\\test\\dynamicArrayAST.json', 'utf-8'))

let object5 = {
    "type": "BinaryOperation",
    "operator": "=",
    "left": {
        "type": "IndexAccess",
        "base": {
            "type": "Identifier",
            "name": "balances"
        },
        "index": {
            "type": "IndexAccess",
            "base": {
                "type": "Identifier",
                "name": "users"
            },
            "index": {
                "type": "Identifier",
                "name": "i"
            }
        }
    },
    "right": {
        "type": "IndexAccess",
        "base": {
            "type": "Identifier",
            "name": "newBalances"
        },
        "index": {
            "type": "Identifier",
            "name": "i"
        }
    }
}

function getMemberAccess(node) {
    return (node.expression.name+'.'+node.memberName)  
}

// While Mapping cannot be passed as a parameter, arrays can. And they can be of multi dimensional.
function getArray_Mapping(object) {
    let wholeOperand = ''
    contractparser.visit(object, {
        IndexAccess: function(ia, parent) {
            let index
            let id = ia
            if(parent.type == 'BinaryOperation'){
                while(id.type != 'Identifier'){
                    if(id.index.type == 'Identifier'){
                        index = id.index.name
                        wholeOperand = '[' + index + ']' + wholeOperand
                        // Since we are moving from right to left (or top to down in the AST)   
                    }

                    if(id.index.type == 'MemberAccess') {
                        index = getMemberAccess(id.index)
                        wholeOperand = '[' + index + ']' + wholeOperand
                    }
                    if(id.index.type == 'NumberLiteral'){
                        index = id.index.number
                        wholeOperand = '[' + index + ']' + wholeOperand
                    }

                    recursiveSearch = (id) => {return id.base}
                    id = recursiveSearch(id)
                }
                if(id.type == 'Identifier') {
                    // This is the actual base.
                    wholeOperand = id.name + wholeOperand
                }
            }
        }
    })
    console.log(wholeOperand)
}

// contractparser.visit(object4, {
//     FunctionDefinition: function(func) {
//         getArray_Mapping(func.body)
//     }
// })
getArray_Mapping(object5)

getArray