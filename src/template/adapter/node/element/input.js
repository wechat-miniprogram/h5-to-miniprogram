const load = require('../../index')

const Element = load('Element')

const DEFAULT_MAX_LENGTH = '140'

class HTMLInputElement extends Element {
  /**
   * 调用 _generateHtml 接口时用于处理额外的属性，
   */
  _$dealWithAttrsForGenerateHtml(html, node) {
    const type = node.type
    if (type) html += ` type="${type}"`

    const value = node.value
    if (value) html += ` type="${value}"`

    const disabled = node.disabled
    if (disabled) html += ' disabled'

    const maxlength = node.maxlength
    if (maxlength) html += ` maxlength="${maxlength}"`

    return html
  }

  /**
   * 调用 outerHTML 的 setter 时用于处理额外的属性
   */
  _$dealWithAttrsForOuterHTML(node) {
    this.type = node.type || ''
    this.value = node.value || ''
    this.disabled = node.disabled || ''
    this.maxlength = node.maxlength || DEFAULT_MAX_LENGTH
  }

  /**
   * 调用 cloneNode 接口时用于处理额外的属性
   */
  _$dealWithAttrsForCloneNode() {
    return {
      type: this.type,
      value: this.value,
      disabled: this.disabled,
      maxlength: this.maxlength,
    }
  }

  /**
   * 对外属性和方法
   */
  get type() {
    return this._attrs.get('type')
  }

  set type(value) {
    value = '' + value
    this._attrs.set('type', value)
  }

  get value() {
    return this._attrs.get('value')
  }

  set value(value) {
    value = '' + value
    this._attrs.set('value', value)
  }

  get disabled() {
    return !!this._attrs.get('disabled')
  }

  set disabled(value) {
    value = !!value
    this._attrs.set('disabled', value)
  }

  get maxlength() {
    return this._attrs.get('maxlength') || DEFAULT_MAX_LENGTH
  }

  set maxlength(value) {
    value = '' + value
    this._attrs.set('maxlength', value)
  }
}

module.exports = HTMLInputElement
