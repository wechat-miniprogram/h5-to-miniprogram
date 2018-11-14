const load = require('../../adapter/index')

const cache = load('cache')
const EventTarget = load('EventTarget')
const Event = load('Event')
const tool = load('tool')

const ELEMENT_DIFF_KEYS = ['nodeId', 'tagName', 'compName', 'id', 'class', 'style']
const TEXT_NODE_DIFF_KEYS = ['nodeId', 'content']
const NOT_RENDER_CHILDREN_NODE = ['CANVAS', 'IMG']

/**
 * 过滤子节点，只获取儿子节点
 */
function filterNodes(domNode) {
  const childNodes = domNode.childNodes || []

  if (!childNodes.map) return []
  if (NOT_RENDER_CHILDREN_NODE.indexOf(domNode.tagName) >= 0) return []

  return childNodes.map(child => {
    const domInfo = child._$domInfo
    domInfo.class = (domInfo.class || '') + ' h5-element' // 增加默认 class
    return domInfo
  })
}

/**
 * 比较新旧子节点是否不同
 */
function checkDiffChildNodes(newChildNodes, oldChildNodes) {
  if (newChildNodes.length !== oldChildNodes.length) return true

  for (let i = 0, len = newChildNodes.length; i < len; i++) {
    const newChild = newChildNodes[i]
    const oldChild = oldChildNodes[i]

    if (newChild.type !== oldChild.type) return true

    const keys = newChild.type === 'element' ? ELEMENT_DIFF_KEYS : TEXT_NODE_DIFF_KEYS

    for (const key of keys) {
      if (newChild[key] !== oldChild[key]) return true
    }
  }

  return false
}

Component({
  data: {
    children: [], // 孩子节点
    wxCompName: '',
    // img
    src: '',
    // canvas
    canvasId: '',
    // input
    type: '',
    value: '',
    disabled: false,
    maxlength: '',
  },
  options: {
    addGlobalClass: true, // 开启全局样式
    addGlobalId: true, // 开启全局 id
  },
  attached() {
    const nodeId = this.dataset.privateNodeId
    const pageId = this.dataset.privatePageId
    const data = {}

    this.nodeId = nodeId
    this.pageId = pageId

    // 存储 nodeId 到 component 实例的映射
    cache.setNodeComp(pageId, nodeId, this)

    // 记录 dom
    this.domNode = cache.getNode(pageId, nodeId)

    // 存储其他字段
    this.window = cache.getWindow(pageId)

    // 初始化孩子节点
    const children = filterNodes(this.domNode)
    if (checkDiffChildNodes(children, this.data.children)) {
      data.children = children
    }

    // 监听全局事件
    this.onChildNodesUpdate = this.onChildNodesUpdate.bind(this)
    this.domNode.addEventListener('_childNodesUpdate', tool.throttle(this.onChildNodesUpdate))

    // 特殊处理各种标签
    const tagName = this.domNode.tagName
    if (tagName === 'IMG') this.initImg(data)
    if (tagName === 'CANVAS') this.initCanvas(data)
    if (tagName === 'A') this.initA()
    if (tagName === 'INPUT') this.initInput(data)

    // 执行一次 setData
    if (Object.keys(data).length) this.setData(data)
  },
  methods: {
    /**
     * 监听子节点变化
     */
    onChildNodesUpdate() {
      const window = this.window
      const tagName = this.domNode.tagName

      // 检查当前节点的变化
      if (tagName === 'IMG') {
        const oldSrc = this.data.src
        const newSrc = this.domNode.src

        if (newSrc !== oldSrc) this.setData({src: newSrc})
      }

      // 儿子节点有变化
      const childNodes = this.domNode.childNodes
      const children = filterNodes(this.domNode)
      if (checkDiffChildNodes(children, this.data.children)) {
        this.setData({children})

        // 触发 window 的更新事件
        window._$trigger('_domTreeUpdate')
      }

      for (const childNode of childNodes) {
        // 触发子节点变化
        childNode._$trigger('_childNodesUpdate')
      }
    },

    /**
     * 触发事件
     */
    callEvent(evt, eventName, extra) {
      const pageId = this.pageId
      const originNodeId = evt.currentTarget.dataset.privateNodeId || this.nodeId
      const originNode = cache.getNode(pageId, originNodeId)

      EventTarget._$process(originNode, eventName, evt, extra)
    },

    /**
     * 监听节点事件
     */
    onTouchStart(evt) {
      if (this.window._$checkEvent(evt)) {
        this.callEvent(evt, 'touchstart')
      }
    },

    onTouchMove(evt) {
      if (this.window._$checkEvent(evt)) {
        this.callEvent(evt, 'touchmove')
      }
    },

    onTouchEnd(evt) {
      if (this.window._$checkEvent(evt)) {
        this.callEvent(evt, 'touchend')

        setTimeout(() => {
          this.callEvent(evt, 'click', {button: 0}) // 默认左键
        }, 0)
      }
    },

    onTouchCancel(evt) {
      if (this.window._$checkEvent(evt)) {
        this.callEvent(evt, 'touchcancel')
      }
    },

    /**
     * 初始化 img 标签
     */
    initImg(data) {
      data.wxCompName = 'image'
      data.src = this.domNode.src
    },

    /**
     * 监听 img 标签 load 事件
     */
    onImgLoad(evt) {
      // 设置宽高
      this.domNode._$width = evt.detail.width
      this.domNode._$height = evt.detail.height

      this.domNode._$trigger('load', {
        event: new Event({
          name: 'load',
          target: this.domNode,
          eventPhase: Event.AT_TARGET
        }),
        currentTarget: this.domNode,
      })
    },

    /**
     * 监听 img 标签 error 事件
     */
    onImgError() {
      this.domNode._$trigger('error', {
        event: new Event({
          name: 'error',
          target: this.domNode,
          eventPhase: Event.AT_TARGET
        }),
        currentTarget: this.domNode,
      })
    },

    /**
     * 初始化 canvas 标签
     */
    initCanvas(data) {
      data.wxCompName = 'canvas'
      data.canvasId = this.nodeId

      this.domNode._$context = wx.createCanvasContext(this.nodeId, this)
    },

    /**
     * 初始化 a 标签
     */
    initA() {
      const window = this.window

      this.domNode.addEventListener('click', evt => {
        // 延迟触发跳转，先等所有同步回调处理完成
        setTimeout(() => {
          if (evt.cancelable) return

          // 处理 a 标签的跳转
          const href = this.domNode.href
          const target = this.domNode.target

          if (target === '_blank') window.open(href)
          else window.location.href = href
        }, 0)
      })
    },

    /**
     * 初始化 input 标签
     */
    initInput(data) {
      data.wxCompName = 'input'
      data.type = this.domNode.type
      data.value = this.domNode.value
      data.disabled = this.domNode.disabled
      data.maxlength = this.domNode.maxlength

      if (data.type === 'number') data.type = 'digit' // 调整为带小数点
    },

    /**
     * 监听 input 标签 input 事件
     */
    onInputInput(evt) {
      this.domNode.value = evt.detail.value

      this.domNode._$trigger('input', {
        event: new Event({
          name: 'input',
          target: this.domNode,
          eventPhase: Event.AT_TARGET
        }),
        currentTarget: this.domNode,
      })
    },

    /**
     * 监听 input 标签 blur 事件
     */
    onInputBlur() {
      this.domNode._$trigger('blur', {
        event: new Event({
          name: 'blur',
          target: this.domNode,
          eventPhase: Event.AT_TARGET
        }),
        currentTarget: this.domNode,
      })
    },

    /**
     * 监听 input 标签 focus 事件
     */
    onInputFocus() {
      this.domNode._$trigger('focus', {
        event: new Event({
          name: 'focus',
          target: this.domNode,
          eventPhase: Event.AT_TARGET
        }),
        currentTarget: this.domNode,
      })
    },
  }
})
