const load = require('../index')

const Node = load('Node')

class Comment extends Node {
  constructor(options, tree) {
    options.type = 'comment'

    super(options, tree)
  }

  /**
   * 对应的 dom 信息
   */
  get _$domInfo() {
    return {
      nodeId: this._nodeId,
      pageId: this._pageId,
      type: this._type,
    }
  }

  /**
   * 对外属性和方法
   */
  get nodeType() {
    return Node.COMMENT_NODE
  }
}

module.exports = Comment
