const load = require('../index')

const Node = load('Node')
const tool = load('tool')

class TextNode extends Node {
  constructor(options, tree) {
    options.type = 'text'

    super(options, tree)

    this._content = options.content || ''
  }

  /**
   * 更新父组件树
   */
  _triggerParentUpdate() {
    if (this.parentNode) this.parentNode._$trigger('_childNodesUpdate')
  }

  /**
   * 对应的 dom 信息
   */
  get _$domInfo() {
    return {
      nodeId: this._nodeId,
      pageId: this._pageId,
      type: this._type,
      content: this._content,
    }
  }

  /**
   * 对外属性和方法
   */
  get nodeType() {
    return Node.TEXT_NODE
  }

  get textContent() {
    return this._content
  }

  set textContent(value) {
    value += ''

    this._content = value
    this._triggerParentUpdate()
  }

  get nodeValue() {
    return this.textContent
  }

  set nodeValue(value) {
    this.textContent = value
  }

  get nodeName() {
    return '#text'
  }

  cloneNode() {
    return this.ownerDocument._$createTextNode({
      content: this._content,
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
    })
  }
}

module.exports = TextNode
