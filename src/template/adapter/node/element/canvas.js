const load = require('../../index')

const Element = load('Element')

const NEED_TO_CALL_DRAW = ['fill', 'stroke', 'fillRect', 'fillText', 'strokeRect', 'strokeText', 'drawImage']

class HTMLCanvasElement extends Element {
  constructor(options, tree) {
    super(options, tree)

    this._drawTimer = null
    this._context = null // for canvas
    this._initRect()
  }

  /**
   * 初始化长宽
   */
  _initRect() {
    let width = this.getAttribute('width')
    let height = this.getAttribute('height')

    if (width) {
      if (/^[.\d]+$/.test(width)) width = `${width}px`
      this._style.width = width
    }

    if (height) {
      if (/^[.\d]+$/.test(height)) height = `${height}px`
      this._style.height = height
    }
  }

  /**
   * 绘制 canvas
   */
  _draw() {
    if (this._drawTimer) return

    this._drawTimer = setTimeout(() => {
      this._context.draw(true, () => {
        this._drawTimer = null
      })
    }, 0)
  }

  /**
   * 设置 context
   */
  get _$context() {
    return this._context
  }

  set _$context(context) {
    const that = this

    // 接口微调
    NEED_TO_CALL_DRAW.forEach(name => {
      context[`_$${name}`] = context[name]
      context[name] = function (...args) {
        if (name === 'drawImage' && typeof args[0] === 'object') {
          // 第一个参数改为 image 路径
          args[0] = args[0].src
        }

        // eslint-disable-next-line no-unused-expressions
        this[`_$${name}`] && this[`_$${name}`](...args)
        that._draw()
      }
    })

    this._context = context
  }

  /**
   * 对外属性和方法
   */
  get width() {
    return parseInt(this.getAttribute('width'), 10) || 0
  }

  set width(value) {
    this.setAttribute('width', value)
    this._initRect()
  }

  get height() {
    return parseInt(this.getAttribute('height'), 10) || 0
  }

  set height(value) {
    this.setAttribute('height', value)
    this._initRect()
  }

  getContext(contextType) {
    // 目前只支持 2d
    if (contextType !== '2d') console.warn(`not support context type for canvas.getContext: ${contextType}`)

    return this._context
  }
}

module.exports = HTMLCanvasElement
