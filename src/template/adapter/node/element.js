const load = require('../index')

const Attribute = load('Attribute')
const Node = load('Node')
const TextNode = load('TextNode')
const ClassList = load('ClassList')
const Style = load('Style')
const cache = load('cache')
const parser = load('parser')
const tagMap = load('tagMap')
const tool = load('tool')

/**
 * 检查节点是否需要进入 dom 树中
 */
function checkNeedToBeInTree(node) {
  return node instanceof Element || node instanceof TextNode
}

class Element extends Node {
  constructor(options, tree) {
    options.type = 'element'

    super(options, tree)

    this._tagName = options.tagName || ''
    this._compName = options.compName || ''
    this._children = []
    this._nodeType = options.nodeType || Node.ELEMENT_NODE
    this._unary = !!parser.voidMap[this._tagName.toLowerCase()]
    this._notTriggerUpdate = false
    this._dataset = {}

    this._classList = new ClassList('', this._onClassOrStyleUpdate.bind(this))
    this._style = new Style(this, '', this._onClassOrStyleUpdate.bind(this))
    this._attrs = new Attribute(this, this._triggerParentUpdate.bind(this))

    // 为了兼容 jQuery 的 defaultDisplay 逻辑
    let defaultComputedStyle = ''
    if (this.tagName === 'DIV') {
      defaultComputedStyle = 'display: block'
    } else if (this.tagName === 'SPAN') {
      defaultComputedStyle = 'display: inline'
    }

    this._computedStyle = new Style(this, defaultComputedStyle) // 修改 computedStyle 不做更新处理
    this._boundingClientRect = {}

    this._initAttrs(options.attrs)
  }

  /**
   * 初始化属性
   */
  _initAttrs(attrs = {}) {
    this._notTriggerUpdate = true // 初始化不触发更新

    Object.keys(attrs).forEach(name => {
      if (name.indexOf('data-') === 0) {
        // dataset
        const datasetName = tool.toCamel(name.substr(5))
        this._dataset[datasetName] = attrs[name]
      } else {
        // 其他属性
        this.setAttribute(name, attrs[name])
      }
    })

    this._notTriggerUpdate = false // 重启触发更新
  }

  /**
   * 监听 class 或 style 属性值变化
   */
  _onClassOrStyleUpdate() {
    this._attrs.triggerUpdate()
    this._triggerParentUpdate()
  }

  /**
   * 更新父组件树
   */
  _triggerParentUpdate() {
    if (this.parentNode && !this._notTriggerUpdate) this.parentNode._$trigger('_childNodesUpdate')
  }

  /**
   * 更新子组件树
   */
  _triggerMeUpdate() {
    if (!this._notTriggerUpdate) this._$trigger('_childNodesUpdate')
  }

  /**
   * 更新子节点变动引起的映射表修改
   */
  _updateChildrenExtra(node, isRemove) {
    const id = node.id

    // 更新 nodeId - dom 映射表
    if (isRemove) {
      cache.setNode(this._pageId, node._$nodeId, null)
      cache.setNodeComp(this._pageId, node._$nodeId, null)
    } else {
      cache.setNode(this._pageId, node._$nodeId, node)
    }

    // 更新 id - dom 映射表
    if (id) {
      if (isRemove) {
        this._tree.updateIdMap(id, null)
      } else {
        this._tree.updateIdMap(id, node)
      }
    }

    if (node.childNodes && node.childNodes.length) {
      for (const child of node.childNodes) {
        this._updateChildrenExtra(child, isRemove)
      }
    }
  }

  /**
   * 遍历 dom 树，生成 html
   */
  _generateHtml(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // 文本节点
      return node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 元素
      const tagName = node.tagName.toLowerCase()
      let html = `<${tagName}`

      // 属性
      if (node.id) html += ` id="${node.id}"`
      if (node.className) html += ` class="${node.className}"`

      const styleText = node.style.cssText
      if (styleText) html += ` style="${styleText}"`

      const src = node.src
      if (src) html += ` src=${src}`

      const dataset = node.dataset
      Object.keys(dataset).forEach(name => {
        html += ` data-${tool.toDash(name)}="${dataset[name]}"`
      })

      html = this._$dealWithAttrsForGenerateHtml(html, node)

      if (node._$isUnary) {
        // 空标签
        return `${html} />`
      } else {
        const childrenHtml = node.childNodes.map(child => this._generateHtml(child)).join('')
        return `${html}>${childrenHtml}</${tagName}>`
      }
    }
  }

  /**
   * 遍历 ast，生成 dom 树
   */
  _generateDomTree(node) {
    const {
      type,
      tagName = '',
      attrs = [],
      children = [],
      content = '',
    } = node

    const nodeId = `b-${tool.getId()}` // 运行时生成，使用 b- 前缀

    if (type === 'element') {
      // 元素
      const compName = tagMap[tagName]
      const attrsMap = {}

      // 属性列表转化成 map
      for (const attr of attrs) {
        const name = attr.name
        let value = attr.value

        if (name === 'style') value = value.replace('"', '\'')

        attrsMap[name] = value
      }

      const element = this.ownerDocument._$createElement({
        tagName, compName, attrs: attrsMap, nodeId
      })

      for (let child of children) {
        child = this._generateDomTree(child)

        if (child) element.appendChild(child)
      }

      return element
    } else if (type === 'text') {
      // 文本
      return this.ownerDocument._$createTextNode({content, nodeId})
    }
  }

  /**
   * 对应的 dom 信息
   */
  get _$domInfo() {
    return {
      nodeId: this._$nodeId,
      pageId: this._$pageId,
      type: this._type,
      tagName: this._tagName,
      compName: this._compName,
      id: this.id,
      class: this.className,
      style: this.style.cssText,
    }
  }

  /**
   * 是否空标签
   */
  get _$isUnary() {
    return this._unary
  }

  /**
   * 存取 computedStyle
   */
  get _$computedStyle() {
    return this._computedStyle
  }

  set _$computedStyle(computedStyle) {
    this._computedStyle._$setStyle(computedStyle)
  }

  /**
   * 设置 boundingClientRect
   */
  set _$boundingClientRect(boundingClientRect) {
    this._boundingClientRect = boundingClientRect
  }

  /**
   * 调用 _generateHtml 接口时用于处理额外的属性
   */
  _$dealWithAttrsForGenerateHtml(html) {
    // 具体实现逻辑由子类实现
    return html
  }

  /**
   * 调用 outerHTML 的 setter 时用于处理额外的属性
   */
  _$dealWithAttrsForOuterHTML() {
    // ignore，具体实现逻辑由子类实现
  }

  /**
   * 调用 cloneNode 接口时用于处理额外的属性
   */
  _$dealWithAttrsForCloneNode() {
    // 具体实现逻辑由子类实现
    return {}
  }

  /**
   * 对外属性和方法
   */
  get id() {
    return this._attrs.get('id')
  }

  set id(id) {
    if (typeof id !== 'string') return

    id = id.trim()
    const oldId = this._attrs.get('id')
    this._attrs.set('id', id)

    if (id === oldId) return

    // 更新 tree
    if (this._tree.getById(oldId) === this) this._tree.updateIdMap(oldId, null)
    if (id) this._tree.updateIdMap(id, this)
    this._triggerParentUpdate()
  }

  get className() {
    return this._classList.toString()
  }

  set className(className) {
    if (typeof className !== 'string') return

    this._classList._$parse(className)
  }

  get classList() {
    return this._classList
  }

  get tagName() {
    return this._tagName.toUpperCase()
  }

  get nodeName() {
    return this.tagName
  }

  get childNodes() {
    return this._children
  }

  get children() {
    return this._children.filter(child => child.nodeType === Node.ELEMENT_NODE)
  }

  get firstChild() {
    return this._children[0]
  }

  get lastChild() {
    return this._children[this._children.length - 1]
  }

  get innerHTML() {
    return this._children.map(child => this._generateHtml(child)).join('')
  }

  get clientWidth() {
    return this._boundingClientRect.width || 0
  }

  get clientHeight() {
    return this._boundingClientRect.height || 0
  }

  set innerHTML(html) {
    if (typeof html !== 'string') return

    const fragment = this.ownerDocument._$createElement({
      tagName: 'documentfragment',
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
      nodeType: Node.DOCUMENT_FRAGMENT_NODE,
    })

    // 解析成 ast
    const ast = parser.parse(html)

    // 生成 dom 树
    ast.forEach(item => {
      const node = this._generateDomTree(item)
      if (node) fragment.appendChild(node)
    })

    // 删除所有子节点
    this._children.forEach(node => {
      node._$updateParent(null)

      // 更新映射表
      this._updateChildrenExtra(node, true)
    })
    this._children.length = 0

    // 追加新子节点
    if (this._tagName === 'table') {
      // table 节点需要判断是否存在 tbody
      let hasTbody = false

      for (const child of fragment.childNodes) {
        if (child.tagName === 'TBODY') {
          hasTbody = true
          break
        }
      }

      if (!hasTbody) {
        const tbody = this.ownerDocument._$createElement({
          tagName: 'tbody',
          compName: tagMap.tbody,
          attrs: {},
          nodeType: Node.ELEMENT_NODE,
          nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
        })

        tbody.appendChild(fragment)
        this.appendChild(tbody)
      }
    } else {
      this.appendChild(fragment)
    }
  }

  get outerHTML() {
    return this._generateHtml(this)
  }

  set outerHTML(html) {
    if (typeof html !== 'string') return

    // 解析成 ast，只取第一个作为当前节点
    const ast = parser.parse(html)[0]

    if (ast) {
      // 生成 dom 树
      const node = this._generateDomTree(ast)

      // 删除所有子节点
      this._children.forEach(node => {
        node._$updateParent(null)

        // 更新映射表
        this._updateChildrenExtra(node, true)
      })
      this._children.length = 0

      this._notTriggerUpdate = true // 先不触发更新

      // 追加新子节点
      const children = [].concat(node.childNodes)
      for (const child of children) {
        this.appendChild(child)
      }

      this._tagName = node.tagName.toLowerCase()
      this._compName = tagMap[this._tagName] || ''
      this.id = node.id || ''
      this.className = node.className || ''
      this.style.cssText = node.style.cssText || ''
      this.src = node.src || ''
      this._dataset = Object.assign({}, node.dataset)

      this._$dealWithAttrsForOuterHTML(node)

      this._notTriggerUpdate = false // 重启触发更新
      this._triggerParentUpdate()
    }
  }

  get innerText() {
    // WARN：此处处理成和 textContent 一致，不去判断是否会渲染出来的情况
    return this.textContent
  }

  set innerText(text) {
    this.textContent = text
  }

  get textContent() {
    return this._children.map(child => child.textContent).join('')
  }

  set textContent(text) {
    text = '' + text

    // 空串不新增 textNode 节点
    if (!text) return

    const nodeId = `b-${tool.getId()}` // 运行时生成，使用 b- 前缀
    const child = this.ownerDocument._$createTextNode({content: text, nodeId})

    // 删除所有子节点
    this._children.forEach(node => {
      node._$updateParent(null)

      // 更新映射表
      this._updateChildrenExtra(node, true)
    })
    this._children.length = 0

    this.appendChild(child)
  }

  get nodeType() {
    return this._nodeType
  }

  get style() {
    return this._style
  }

  set style(value) {
    this._style.cssText = value
  }

  get attributes() {
    return this._attrs.list
  }

  get src() {
    return this._attrs.get('src')
  }

  set src(value) {
    value = '' + value
    this._attrs.set('src', value)
  }

  get dataset() {
    return this._dataset
  }

  cloneNode(deep) {
    const dataset = {}
    Object.keys(this._dataset).forEach(name => {
      dataset[`data-${tool.toDash(name)}`] = this._dataset[name]
    })

    const newNode = this.ownerDocument._$createElement({
      tagName: this._tagName,
      compName: this._compName,
      attrs: {
        id: this.id,
        class: this.className,
        style: this.style.cssText,
        src: this.src,

        ...dataset,
        ...this._$dealWithAttrsForCloneNode(),
      },
      nodeType: this._nodeType,
      nodeId: `b-${tool.getId()}`, // 运行时生成，使用 b- 前缀
    })

    if (deep) {
      // 深克隆
      for (const child of this._children) {
        newNode.appendChild(child.cloneNode(deep))
      }
    }

    return newNode
  }

  appendChild(node) {
    if (!checkNeedToBeInTree(node)) return

    let nodes
    let hasUpdate = false

    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // documentFragment
      nodes = [].concat(node.childNodes)
    } else {
      nodes = [node]
    }

    for (const node of nodes) {
      if (node === this) continue
      if (node.parentNode) node.parentNode.removeChild(node)

      this._children.push(node)
      node._$updateParent(this) // 设置 parentNode

      // 更新映射表
      this._updateChildrenExtra(node)

      hasUpdate = true
    }

    // 触发 webview 端更新
    if (hasUpdate) this._triggerMeUpdate()

    return this
  }

  removeChild(node) {
    if (!checkNeedToBeInTree(node)) return

    const index = this._children.indexOf(node)

    if (index >= 0) {
      // 已经插入，需要删除
      this._children.splice(index, 1)

      node._$updateParent(null)

      // 更新映射表
      this._updateChildrenExtra(node, true)

      // 触发 webview 端更新
      this._triggerMeUpdate()
    }

    return node
  }

  insertBefore(node, ref) {
    if (!checkNeedToBeInTree(node)) return
    if (ref && !checkNeedToBeInTree(ref)) return

    let nodes
    let hasUpdate = false

    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // documentFragment
      nodes = [].concat(node.childNodes)
    } else {
      nodes = [node]
    }

    for (const node of nodes) {
      if (node === this) continue
      if (node.parentNode) node.parentNode.removeChild(node)

      const insertIndex = ref ? this._children.indexOf(ref) : -1

      if (insertIndex === -1) {
        // 插入到末尾
        this._children.push(node)
      } else {
        // 插入到 ref 之前
        this._children.splice(insertIndex, 0, node)
      }

      node._$updateParent(this) // 设置 parentNode

      // 更新映射表
      this._updateChildrenExtra(node)

      hasUpdate = true
    }


    // 触发 webview 端更新
    if (hasUpdate) this._triggerMeUpdate()

    return node
  }

  replaceChild(node, old) {
    if (!checkNeedToBeInTree(node) || !checkNeedToBeInTree(old)) return

    let nodes
    let hasUpdate = false

    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // documentFragment
      nodes = [].concat(node.childNodes)
    } else {
      nodes = [node]
    }

    for (const node of nodes) {
      if (node === this) continue
      if (node.parentNode) node.parentNode.removeChild(node)

      const replaceIndex = this._children.indexOf(old)

      if (replaceIndex === -1) {
        // 插入到末尾
        this._children.push(node)
      } else {
        // 替换到 old
        this._children.splice(replaceIndex, 1, node)
      }

      node._$updateParent(this) // 设置 parentNode

      // 更新映射表
      this._updateChildrenExtra(node)
      this._updateChildrenExtra(old, true)

      hasUpdate = true
    }

    // 触发 webview 端更新
    if (hasUpdate) this._triggerMeUpdate()

    return old
  }

  getElementsByTagName(tagName) {
    if (typeof tagName !== 'string') return []

    return this._tree.getByTagName(tagName, this)
  }

  getElementsByClassName(className) {
    if (typeof className !== 'string') return []

    return this._tree.getByClassName(className, this)
  }

  querySelector(selector) {
    if (typeof selector !== 'string') return

    return this._tree.query(selector, this)[0] || null
  }

  querySelectorAll(selector) {
    if (typeof selector !== 'string') return []

    return this._tree.query(selector, this)
  }

  setAttribute(name, value) {
    if (typeof name !== 'string') return

    value = '' + value

    if (name === 'id') {
      // id 要提前到此处特殊处理
      this.id = value
    } else {
      this._attrs.set(name, value)
    }
  }

  getAttribute(name) {
    if (typeof name !== 'string') return ''

    return this._attrs.get(name)
  }

  hasAttribute(name) {
    if (typeof name !== 'string') return false

    return this._attrs.has(name)
  }

  removeAttribute(name) {
    if (typeof name !== 'string') return false

    return this._attrs.remove(name)
  }

  getBoundingClientRect() {
    return this._boundingClientRect
  }
}

module.exports = Element
