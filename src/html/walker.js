const load = require('../template/adapter')

const tool = load('tool')
const tagMap = load('tagMap')

/**
 * 深度优先遍历 ast
 */
function walk(ast) {
  const stack = [ast]
  const res = {
    title: '',
    body: [],
    style: [],
    script: [],
  }

  while (stack.length) {
    const node = stack.pop()
    const {
      type, tagName = '', attrs = [], children = []
    } = node

    node.nodeId = `a-${tool.getId()}` // 给每个节点设置唯一标识，a- 前缀表示是在运行前生成的，b- 前缀表示是在运行时生成的

    if (type !== 'element') continue // 跳过非元素节点

    const compName = tagMap[tagName]
    const attrsMap = {}

    // 属性列表转化成 map
    for (const attr of attrs) {
      const name = attr.name
      let value = attr.value

      if (name === 'style') value = value.replace('"', '\'')

      attrsMap[name] = value
    }

    node.attrs = attrsMap
    node.compName = compName

    if (tagName === 'title') {
      // 标题
      const child = children[0] || {}
      if (child.type === 'text') res.title = child.content
    } else if (tagName === 'link' && attrsMap.rel === 'stylesheet') {
      // 外部样式
      res.style.push({
        type: 'outer',
        src: attrsMap.href,
      })
    } else if (tagName === 'style') {
      // 内嵌样式
      const child = children[0] || {}
      if (child.type === 'text') {
        res.style.push({
          type: 'inner',
          content: child.content,
        })
      }
    } else if (tagName === 'body') {
      // 节点树
      res.body = node
    } else if (tagName === 'script') {
      // script 标签
      const child = children[0] || {}
      if (attrsMap.src) {
        res.script.push({
          type: 'outer',
          src: attrsMap.src,
        })
      } else if (child.type === 'text') {
        res.script.push({
          type: 'inner',
          content: child.content,
        })
      }
    }

    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]) // 子节点入栈
  }

  return res
}

module.exports = {
  walk
}
