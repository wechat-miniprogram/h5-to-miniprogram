const load = require('../template/adapter')
const walker = require('./walker')
const _ = require('../utils')

const parser = load('parser')

module.exports = {
  /**
   * 解析 html
   */
  parse(content) {
    const ast = parser.parse(content)

    if (ast.length !== 1) throw new Error('invalid entry html')

    return walker.walk(ast[0])
  },

  /**
   * 生成页面
   */
  async generate(options) {
    const output = options.output
    const body = options.body
    const bodyClass = (body.attrs.class || '') + ' h5-body' // 增加默认 class

    await _.writeFile(output, `<body wx:if="{{pageId}}" data-private-node-id="${body.nodeId}" data-private-page-id="{{pageId}}" id="${body.id || ''}" class="${bodyClass}" style="${body.attrs.style || ''}" />`)
  }
}
