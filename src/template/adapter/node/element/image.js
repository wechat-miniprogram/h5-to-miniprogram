const load = require('../../index')

const Element = load('Element')
const Event = load('Event')
const tool = load('tool')
const config = load('config')

const resFilter = config.resFilter || (src => src)

class Image extends Element {
  constructor(options, tree) {
    const width = options.width
    const height = options.height

    if (typeof width === 'number' && width >= 0) options.attrs.width = width
    if (typeof height === 'number' && height >= 0) options.attrs.height = height

    super(options, tree)

    this._naturalWidth = 0
    this._naturalHeight = 0

    this._initRect()
  }

  /**
   * 初始化长宽
   */
  _initRect() {
    const width = parseInt(this.getAttribute('width'), 10)
    const height = parseInt(this.getAttribute('height'), 10)

    if (typeof width === 'number' && width >= 0) this._style.width = `${width}px`
    if (typeof height === 'number' && height >= 0) this._style.height = `${height}px`
  }

  /**
   * 用于图片加载回调后设置
   */
  set _$width(value) {
    const width = this.getAttribute('width')

    if (!width && width !== 0) this.setAttribute('width', value)
  }

  /**
   * 用于图片加载回调后设置
   */
  set _$height(value) {
    const height = this.getAttribute('width')

    if (!height && height !== 0) this.setAttribute('height', value)
  }

  /**
   * 对外属性和方法
   */
  get src() {
    return this.getAttribute('src') || ''
  }

  set src(value) {
    if (!value || typeof value !== 'string') return

    value = tool.replaceStyleUrl(value, resFilter, this.ownerDocument._$pageKey)

    this.setAttribute('src', value)

    setTimeout(() => {
      wx.getImageInfo({
        src: this.src,
        success: res => {
          // 加载成功，调整图片的宽高
          const width = parseInt(this.getAttribute('width'), 10)
          const height = parseInt(this.getAttribute('height'), 10)

          if (typeof width !== 'number' || !isFinite(width) || width < 0) this.setAttribute('width', res.width)
          if (typeof height !== 'number' || !isFinite(height) || height < 0) this.setAttribute('height', res.height)

          this._naturalWidth = res.width
          this._naturalHeight = res.height

          this._initRect()

          // 触发 load 事件
          this._$trigger('load', {
            event: new Event({
              name: 'load',
              target: this,
              eventPhase: Event.AT_TARGET
            }),
            currentTarget: this,
          })
        },
        fail: () => {
          // 加载失败，触发 error 事件
          this._$trigger('error', {
            event: new Event({
              name: 'error',
              target: this,
              eventPhase: Event.AT_TARGET
            }),
            currentTarget: this,
          })
        },
      })
    }, 0)
  }

  get width() {
    return +this.getAttribute('width') || 0
  }

  set width(value) {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) return

    this.setAttribute('width', value)
    this._initRect()
  }

  get height() {
    return +this.getAttribute('height') || 0
  }

  set height(value) {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) return

    this.setAttribute('height', value)
    this._initRect()
  }

  get naturalWidth() {
    return this._naturalWidth
  }

  get naturalHeight() {
    return this._naturalHeight
  }
}

module.exports = Image
