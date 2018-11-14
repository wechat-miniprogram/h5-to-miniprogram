const load = require('./index')

const EventTarget = load('EventTarget')
const Event = load('Event')
const Location = load('Location')
const Navigator = load('Navigator')
const Node = load('Node')
const cache = load('cache')
const styleList = load('styleList')
const Request = load('XMLHttpRequest')
const CustomEvent = load('CustomEvent')
const LocalStorage = load('LocalStorage')
const SessionStorage = load('SessionStorage')
const Screen = load('Screen')
const History = load('History')

class Window extends EventTarget {
  constructor(pageId, pageKey) {
    super()

    this._pageId = pageId
    this._pageKey = pageKey

    this._outerHeight = 0
    this._outerWidth = 0
    this._innerHeight = 0
    this._innerWidth = 0

    this._location = new Location(pageKey)
    this._navigator = new Navigator()
    this._localStorage = new LocalStorage(pageId, this)
    this._sessionStorage = new SessionStorage(pageId, this)
    this._screen = new Screen()
    this._history = new History(this._location)

    this._nowFetchingWebviewInfoPromise = null // 正在拉取 webview 端信息的 promise 实例

    this._fetchDeviceInfo()
    this._initInnerEvent()

    // 补充实例的属性，用于 'xxx' in XXX 判断
    this.onhashchange = null
  }

  /**
   * 初始化内部事件
   */
  _initInnerEvent() {
    // 监听 location 的事件
    this._location.addEventListener('hashchange', ({oldURL, newURL}) => {
      this._$trigger('hashchange', {
        event: new Event({
          name: 'hashchange',
          target: this,
          eventPhase: Event.AT_TARGET,
          _$extra: {
            oldURL,
            newURL,
          },
        }),
        currentTarget: this,
      })
    })

    // 监听 history 的事件
    this._history.addEventListener('popstate', ({state}) => {
      this._$trigger('popstate', {
        event: new Event({
          name: 'popstate',
          target: this,
          eventPhase: Event.AT_TARGET,
          _$extra: {state},
        }),
        currentTarget: this,
      })
    })
  }

  /**
   * 拉取设备参数
   */
  _fetchDeviceInfo() {
    try {
      const info = wx.getSystemInfoSync()

      this._outerHeight = info.screenHeight
      this._outerWidth = info.screenWidth
      this._innerHeight = info.windowHeight
      this._innerWidth = info.windowWidth

      this._screen._$init(info)
      this._navigator._$init(info)
    } catch (err) {
      // ignore
    }
  }

  /**
   * 拉取 computedStyle
   */
  _fetchComputedStyle(scope, callback) {
    wx.createSelectorQuery()
      .in(scope)
      .selectAll('.h5-body >>> .h5-element')
      .fields({
        dataset: true,
        computedStyle: styleList,
      })
      .exec(res => {
        res = (res || [])[0]
        const infoList = res || []

        infoList.forEach(info => {
          const {privateNodeId, privatePageId} = info.dataset
          const node = cache.getNode(privatePageId, privateNodeId)

          if (!node) return

          info = Object.assign({}, info)
          delete info.dataset
          node._$computedStyle = info
        })

        callback()
      })
  }

  /**
   * 拉取 boundingClientRect
   */
  _fetchBoundingClientRect(scope, callback) {
    wx.createSelectorQuery().in(scope).selectAll('.h5-body >>> .h5-element').fields({
      dataset: true,
      rect: true,
      size: true,
    })
      .exec(res => {
        res = (res || [])[0]
        const infoList = res || []

        infoList.forEach(info => {
          const {privateNodeId, privatePageId} = info.dataset
          const node = cache.getNode(privatePageId, privateNodeId)

          if (!node) return

          info = Object.assign({}, info)
          delete info.dataset
          node._$boundingClientRect = info
        })

        callback()
      })
  }

  /**
   * 拉取 webview 端的一些元素信息
   */
  _$fetchWebviewInfo(scope) {
    if (this._nowFetchingWebviewInfoPromise) return this._nowFetchingWebviewInfoPromise

    // 保存正在拉取中的 promise 实例
    // eslint-disable-next-line no-unused-vars
    this._nowFetchingWebviewInfoPromise = new Promise((resolve, reject) => {
      this._fetchComputedStyle(scope, () => {
        this._fetchBoundingClientRect(scope, () => {
          resolve()
        })
      })
    })
    this._nowFetchingWebviewInfoPromise.then(() => {
      this._nowFetchingWebviewInfoPromise = null
    }).catch(() => {
      this._nowFetchingWebviewInfoPromise = null
    })

    return this._nowFetchingWebviewInfoPromise
  }

  /**
   * 对外属性和方法
   */
  get location() {
    return this._location
  }

  set location(href) {
    this._location.href = href
  }

  get navigator() {
    return this._navigator
  }

  get CustomEvent() {
    return CustomEvent
  }

  get HTMLIFrameElement() {
    // TODO，react 有使用到
    return function () {}
  }

  get XMLHttpRequest() {
    const that = this

    return function XMLHttpRequest(...args) {
      return new Request(that, ...args)
    }
  }

  get self() {
    return this
  }

  get localStorage() {
    return this._localStorage
  }

  get sessionStorage() {
    return this._sessionStorage
  }

  get screen() {
    return this._screen
  }

  get history() {
    return this._history
  }

  get outerHeight() {
    return this._outerHeight
  }

  get outerWidth() {
    return this._outerWidth
  }

  get innerHeight() {
    return this._innerHeight
  }

  get innerWidth() {
    return this._innerWidth
  }

  get Image() {
    return cache.getDocument(this._pageId)._$imageConstructor
  }

  get setTimeout() {
    return setTimeout.bind(null)
  }

  get clearTimeout() {
    return clearTimeout.bind(null)
  }

  get setInterval() {
    return setInterval.bind(null)
  }

  get clearInterval() {
    return clearInterval.bind(null)
  }

  open(url) {
    // 不支持 windowName 和 windowFeatures
    this.location._$open(url)
  }

  getComputedStyle(element) {
    if (typeof element !== 'object' && element.nodeType !== Node.ELEMENT_NODE) return null

    return element._$computedStyle
  }
}

module.exports = Window
