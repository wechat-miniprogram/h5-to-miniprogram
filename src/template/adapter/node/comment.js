const load = require('../index')

const Node = load('Node')

class Comment extends Node {
  constructor(options, tree) {
    options.type = 'comment'

    super(options, tree)
  }

  /**
   * 对外属性和方法
   */
  get nodeType() {
    return Node.COMMENT_NODE
  }
}

module.exports = Comment
