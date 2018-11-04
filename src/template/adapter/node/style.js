const load = require('../index')

const tool = load('tool')
const config = load('config')
const styleList = load('styleList')
const cache = load('cache')

const resFilter = config.resFilter || (src => src)
const rem = typeof config.rem === 'number' && isFinite(config.rem) ? config.rem : 0

/**
 * 解析样式串
 */
function parse(styleText, pageKey) {
  const rules = {}

  if (styleText) {
    styleText.split(';').forEach(rule => {
      rule = rule.trim()

      if (!rule) return

      const split = rule.indexOf(':')

      if (split === -1) return

      const name = tool.toCamel(rule.substr(0, split).trim())
      let value = rule.substr(split + 1).trim()

      if (name === 'background' || name === 'backgroundImage') {
        // 需要调整资源路径
        value = tool.replaceStyleUrl(value, resFilter, pageKey)
      }

      if (rem) {
        // 需要调整 rem
        value = tool.replaceStyleRem(value, rem)
      }

      rules[name] = value
    })
  }

  return rules
}

class Style {
  constructor(element, styleText = '', onUpdate) {
    this._element = element
    this._doUpdate = onUpdate || (() => {})
    this._disableCheckUpdate = false // 是否禁止检查更新

    // 设置各个属性的 getter、setter
    const properties = {}

    styleList.forEach(name => {
      properties[name] = {
        get() {
          return this[`_${name}`] || ''
        },
        set(value) {
          const oldValue = this[`_${name}`]

          this[`_${name}`] = value !== undefined ? '' + value : undefined

          if (oldValue !== value) this._checkUpdate()
        },
      }
    })
    Object.defineProperties(this, properties)

    // 解析样式
    const pageKey = cache.getPageKey(element._$pageId)
    const rules = parse(styleText, pageKey)

    this._disableCheckUpdate = true // 初始化不当做更新
    for (const name of styleList) {
      this[name] = rules[name]
    }
    this._disableCheckUpdate = false
  }

  /**
   * 检查更新
   */
  _checkUpdate() {
    if (!this._disableCheckUpdate) {
      this._doUpdate()
    }
  }

  /**
   * 设置样式
   */
  _$setStyle(style) {
    if (typeof style === 'string') {
      this.cssText = style
    } else if (typeof style === 'object') {
      this._disableCheckUpdate = true // 将每条规则的设置合并为一次更新
      for (const name of styleList) {
        this[name] = style[name]
      }
      this._disableCheckUpdate = false
      this._checkUpdate()
    }
  }

  /**
   * 对外属性和方法
   */
  get cssText() {
    const joinText = styleList.filter(name => this[`_${name}`]).map(name => `${tool.toDash(name)}:${this['_' + name]}`).join(';').trim()
    return joinText ? `${joinText};` : ''
  }

  set cssText(styleText) {
    if (typeof styleText !== 'string') return

    styleText = styleText.replace('"', '\'')

    // 解析样式
    const pageKey = cache.getPageKey(this._element._$pageId)
    const rules = parse(styleText, pageKey)

    this._disableCheckUpdate = true // 将每条规则的设置合并为一次更新
    for (const name of styleList) {
      this[name] = rules[name]
    }
    this._disableCheckUpdate = false
    this._checkUpdate()
  }

  getPropertyValue(name) {
    if (typeof name !== 'string') return ''

    name = tool.toCamel(name)
    return this[name] || ''
  }
}

module.exports = Style
