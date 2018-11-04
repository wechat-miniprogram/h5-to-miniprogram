const load = require('../../index')

const Element = load('Element')

class HTMLAnchorElement extends Element {
  /**
   * 调用 _generateHtml 接口时用于处理额外的属性，
   */
  _$dealWithAttrsForGenerateHtml(html, node) {
    const href = node.href
    if (href) html += ` href="${href}"`

    const target = node.target
    if (target) html += ` target="${target}"`

    return html
  }

  /**
   * 调用 outerHTML 的 setter 时用于处理额外的属性
   */
  _$dealWithAttrsForOuterHTML(node) {
    this.href = node.href || ''
    this.target = node.target || ''
  }

  /**
   * 调用 cloneNode 接口时用于处理额外的属性
   */
  _$dealWithAttrsForCloneNode() {
    return {
      href: this.href,
      target: this.target,
    }
  }

  /**
   * 对外属性和方法
   */
  get href() {
    return this._attrs.get('href')
  }

  set href(value) {
    value = '' + value
    this._attrs.set('href', value)
  }

  get target() {
    return this._attrs.get('target')
  }

  set target(value) {
    value = '' + value
    this._attrs.set('target', value)
  }
}

module.exports = HTMLAnchorElement
