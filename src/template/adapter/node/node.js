const load = require('../index')

const EventTarget = load('EventTarget')
const cache = load('cache')

class Node extends EventTarget {
  constructor(options, tree) {
    super()

    this._nodeId = options.nodeId // 唯一标识
    this._type = options.type
    this._parentNode = null
    this._tree = tree
    this._pageId = tree.pageId
  }

  /**
   * 内部 nodeId
   */
  get _$nodeId() {
    return this._nodeId
  }

  /**
   * 内部 pageId
   */
  get _$pageId() {
    return this._pageId
  }

  /**
   * 更新 parentNode
   */
  _$updateParent(parentNode = null) {
    this._parentNode = parentNode
  }

  /**
   * 对外属性和方法
   */
  get parentNode() {
    return this._parentNode
  }

  get nodeValue() {
    return null
  }

  get previousSibling() {
    const childNodes = this.parentNode && this.parentNode.childNodes || []
    const index = childNodes.indexOf(this)

    if (index > 0) {
      return childNodes[index - 1]
    }

    return null
  }

  get previousElementSibling() {
    const childNodes = this.parentNode && this.parentNode.childNodes || []
    const index = childNodes.indexOf(this)

    if (index > 0) {
      for (let i = index - 1; i >= 0; i--) {
        if (childNodes[i].nodeType === Node.ELEMENT_NODE) {
          return childNodes[i]
        }
      }
    }

    return null
  }

  get ownerDocument() {
    return cache.getDocument(this._pageId) || null
  }
}

// 静态属性
Node.ELEMENT_NODE = 1
Node.TEXT_NODE = 3
Node.CDATA_SECTION_NODE = 4
Node.PROCESSING_INSTRUCTION_NODE = 7
Node.COMMENT_NODE = 8
Node.DOCUMENT_NODE = 9
Node.DOCUMENT_TYPE_NODE = 10
Node.DOCUMENT_FRAGMENT_NODE = 11

module.exports = Node
