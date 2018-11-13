const load = require('../index')

const Location = load('Location')

class History {
  constructor() {
    this._stack = []
  }

  /**
   * 对外属性和方法
   */
  get state() {

  }

  get length() {
    return this._stack.length
  }

  back() {
    this.go(-1)
  }

  forward() {
    this.go(1)
  }

  go(delta) {
    if (typeof delta === 'number') {

    } else {
      // 刷新当前页面
      // TODO
    }
  }

  pushState(state, title, url) {
    if (!url || typeof url !== 'string') return

    const {
      protocol, hostname, port, pathname, hash, search
    } = Location._$parse(url)
  }

  replaceState(state, title, url) {

  }
}

module.exports = History
