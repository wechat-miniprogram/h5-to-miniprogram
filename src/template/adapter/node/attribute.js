const load = require('../index')

const config = load('config')
const cache = load('cache')

const resFilter = config.resFilter || (src => src)

class Attribute {
  constructor(element, onUpdate) {
    this._element = element
    this._doUpdate = onUpdate
    this._map = {}
    this._list = []

    this.triggerUpdate()
  }

  /**
   * 属性列表，需要动态更新
   */
  get list() {
    return this._list
  }

  /**
   * 设置属性
   */
  set(name, value) {
    const element = this._element
    const map = this._map
    const pageKey = cache.getPageKey(element._$pageId)

    if (name === 'id') {
      map.id = value
    } else if (name === 'class') {
      element.className = value
    } else if (name === 'style') {
      element.style.cssText = value
    } else {
      if (name === 'src') {
        // 需要调整资源路径
        value = resFilter(value, pageKey)
      }

      map[name] = value

      // 其他字段的设置需要触发父组件更新
      this._doUpdate()
    }

    this.triggerUpdate()
  }

  /**
   * 取属性
   */
  get(name) {
    const element = this._element
    const map = this._map

    if (name === 'class') {
      return element.className
    } else if (name === 'style') {
      return element.style.cssText
    } else {
      return map[name] || ''
    }
  }

  /**
   * 判断属性是否存在
   */
  has(name) {
    const element = this._element
    const map = this._map

    if (name === 'id') {
      return !!element.id
    } else if (name === 'class') {
      return !!element.className
    } else if (name === 'style') {
      return !!element.style.cssText
    } else {
      return Object.prototype.hasOwnProperty.call(map, name)
    }
  }

  /**
   * 删除属性
   */
  remove(name) {
    const element = this._element
    const map = this._map

    if (name === 'id') {
      element.id = ''
    } else if (name === 'class' || name === 'style') {
      this.set(name, '')
    } else {
      // 其他字段的设置需要触发父组件更新
      delete map[name]
      this._doUpdate()
    }

    this.triggerUpdate()
  }

  /**
   * 更新属性列表
   */
  triggerUpdate() {
    const map = this._map
    const list = this._list

    // 清空旧的列表
    list.forEach(item => {
      delete list[item.name]
    })
    delete list.class
    delete list.style
    list.length = 0

    // 添加新列表
    Object.keys(map).forEach(name => {
      if (name !== 'id') {
        const item = {name, value: map[name]}

        list.push(item)
        list[name] = item
      }
    })

    const idValue = this.get('id')
    const classValue = this.get('class')
    const styleValue = this.get('style')
    if (idValue) {
      const item = {name: 'id', value: idValue}

      list.push(item)
      list.id = item
    }
    if (classValue) {
      const item = {name: 'class', value: classValue}

      list.push(item)
      list.class = item
    }
    if (styleValue) {
      const item = {name: 'style', value: styleValue}

      list.push(item)
      list.style = item
    }
  }
}

module.exports = Attribute
