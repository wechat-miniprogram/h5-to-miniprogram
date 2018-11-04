/**
 * 调整 js
 */

const acorn = require('acorn')
const acornGlobals = require('acorn-globals')
const MagicString = require('magic-string')
const babel = require('@babel/core')

const ignoreGlobalVar = require('./ignore-global-var')

/**
 * 调整全局变量
 */
function replaceGlobal(ast, magicString) {
  // 查找全局变量
  const globalVars = acornGlobals(ast)

  // 替换全局变量
  globalVars.forEach(globalVar => {
    globalVar.nodes.forEach(node => {
      if (node.name && ignoreGlobalVar.indexOf(node.name) < 0) {
        magicString.overwrite(node.start, node.end, `window['${node.name}']`)
      }
    })
  })

  return magicString.toString()
}

/**
 * 将最顶层的函数声明挂在 window 下
 */
function adjustTopFuncDecl(ast, magicString) {
  const topFuncs = []

  if (ast.type === 'Program') {
    ast.body.forEach(node => {
      if (node.type === 'FunctionDeclaration' && node.id && node.id.type === 'Identifier') {
        // 函数声明
        topFuncs.push(node.id.name)
      } else if (node.type === 'VariableDeclaration' && Array.isArray(node.declarations)) {
        // 函数声明表达式
        node.declarations.forEach(declaration => {
          const init = declaration.init

          if (init && init.type === 'FunctionExpression' && init.id && init.id.type === 'Identifier') {
            topFuncs.push(init.id.name)
          }
        })
      }
    })
  }

  const appendLine = topFuncs.map(funcName => `window['${funcName}'] = ${funcName}`).join(';')
  if (appendLine) magicString.append(`\n${appendLine};`)

  return magicString.toString()
}

module.exports = function (code) {
  const comments = []
  const ast = acorn.parse(code, {
    sourceType: 'script',
    locations: true,
    onComment(block, text, start, end) {
      comments.push({
        block, text, start, end
      })
    }
  })
  const magicString = new MagicString(code)

  code = replaceGlobal(ast, magicString)
  code = adjustTopFuncDecl(ast, magicString)

  // 转换代码
  code = babel.transformSync(code, {
    minified: false,
    compact: false,
    comments: false,
  }).code

  return code
}
