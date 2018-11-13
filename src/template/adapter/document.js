const load = require('./index')

const EventTarget = load('EventTarget')
const Tree = load('Tree')
const Node = load('Node')
const Element = load('Element')
const TextNode = load('TextNode')
const Comment = load('Comment')
const tool = load('tool')
const tagMap = load('tagMap')
const cache = load('cache')
const A = load('A')
const Image = load('Image')
const Canvas = load('Canvas')
const Input = load('Input')
const Cookie = load('Cookie')

class Document extends EventTarget {
  constructor(pageId, pageKey, ast, nodeIdMap) {
    super()

    // 存入 pageKey，方便其它地方获取
    cache.setPageKey(pageId, pageKey)

    // 用于封装特殊标签和对应构造器
    const that = this
    this._imageConstructor = function HTMLImageElement(width, height) {
      let options
      let tree

      if (typeof width === 'object' && typeof height === 'object') {
        options = width
        tree = height
      } else {
        options = {
          tagName: 'img',
          compName: tagMap.img,
          nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
          attrs: {},
          width,
          height,
        }
        tree = that._tree
      }

      return new Image(options, tree)
    }

    this._pageId = pageId
    this._pageKey = pageKey
    this._tree = new Tree(pageId, ast, nodeIdMap, this)
    this._cookie = new Cookie()

    // documentElement
    this._node = this._$createElement({
      tagName: 'html',
      compName: '',
      attrs: {},
      nodeId: `a-${tool.getId()}`, // 运行前生成，使用 a- 前缀
      type: Node.DOCUMENT_NODE,
    })
    this._node._$updateParent(this) // documentElement 的 parentNode 是 document

    // head 元素
    this._head = this.createElement('head')

    // 更新 body 的 parentNode
    this._tree.root._$updateParent(this._node)
  }

  get _$pageKey() {
    return this._pageKey
  }

  /**
   * Image 构造器
   */
  get _$imageConstructor() {
    return this._imageConstructor
  }

  /**
   * 触发节点事件
   */
  _$trigger(eventName, options) {
    this.documentElement._$trigger(eventName, options)
  }

  /**
   * 内部所有节点创建都走此接口，统一把控
   */
  _$createElement(options, tree) {
    const tagName = options.tagName.toUpperCase()

    if (tagName === 'A') {
      return new A(options, tree || this._tree)
    } else if (tagName === 'IMG') {
      return new this._imageConstructor(options, tree || this._tree)
    } else if (tagName === 'CANVAS') {
      return new Canvas(options, tree || this._tree)
    } else if (tagName === 'INPUT') {
      return new Input(options, tree || this._tree)
    } else {
      return new Element(options, tree || this._tree)
    }
  }

  /**
   * 内部所有文本节点创建都走此接口，统一把控
   */
  _$createTextNode(options, tree) {
    return new TextNode(options, tree || this._tree)
  }

  /**
   * 对外属性和方法
   */
  get nodeType() {
    return Node.DOCUMENT_NODE
  }

  get documentElement() {
    return this._node
  }

  get body() {
    return this._tree.root
  }

  get nodeName() {
    return '#document'
  }

  get head() {
    return this._head
  }

  get defaultView() {
    return cache.getWindow(this._pageId) || null
  }

  get URL() {
    if (this.defaultView) return this.defaultView.location.href

    return ''
  }

  get cookie() {
    return this._cookie.getCookie(this.URL)
  }

  set cookie(value) {
    if (!value || typeof value !== 'string') return

    this._cookie.setCookie(value, this.URL)
  }

  getElementById(id) {
    if (typeof id !== 'string') return

    return this._tree.getById(id) || null
  }

  getElementsByTagName(tagName) {
    if (typeof tagName !== 'string') return []

    return this._tree.getByTagName(tagName)
  }

  getElementsByClassName(className) {
    if (typeof className !== 'string') return []

    return this._tree.getByClassName(className)
  }

  querySelector(selector) {
    if (typeof selector !== 'string') return

    return this._tree.query(selector)[0] || null
  }

  querySelectorAll(selector) {
    if (typeof selector !== 'string') return []

    return this._tree.query(selector)
  }

  createElement(tagName) {
    if (typeof tagName !== 'string') return

    tagName = tagName.trim().toLowerCase()

    if (!tagName) return

    return this._$createElement({
      tagName,
      compName: tagMap[tagName],
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
    })
  }

  createTextNode(content) {
    content = '' + content

    return this._$createTextNode({
      content,
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
    })
  }

  createComment() {
    return new Comment({
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
    }, this._tree)
  }

  createDocumentFragment() {
    return new Element({
      tagName: 'documentfragment',
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
      nodeType: Node.DOCUMENT_FRAGMENT_NODE,
    }, this._tree)
  }

  createEvent() {
    const window = cache.getWindow(this._pageId)

    return new window.CustomEvent()
  }

  addEventListener(eventName, handler, options) {
    this.documentElement.addEventListener(eventName, handler, options)
  }

  removeEventListener(eventName, handler, isCapture) {
    this.documentElement.removeEventListener(eventName, handler, isCapture)
  }

  dispatchEvent(evt) {
    this.documentElement.dispatchEvent(evt)
  }
}

module.exports = Document
