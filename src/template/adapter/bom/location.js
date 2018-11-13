/**
 * 暂不对 ipv6 地址做支持
 */

const load = require('../index')

const config = load('config')
const EventTarget = load('EventTarget')

const urlMap = config.urlMap || {}
const HREF_CACHE = {}

class Location extends EventTarget {
  constructor(pageKey) {
    super()

    const {
      protocol, hostname, port, hash, search, pathname
    } = HREF_CACHE[pageKey] || {}

    this._pageKey = pageKey

    this._protocol = protocol || 'http:'
    this._hostname = hostname || ''
    this._port = port || ''
    this._pathname = pathname || '/'
    this._search = search || ''
    this._hash = hash || ''

    this._lastHash = ''
    this._lastHref = ''
  }

  /**
   * 解析 href
   */
  static _$parse(href = '') {
    href = href.trim()

    // protocol
    let protocol = /^[a-zA-Z0-9]+:/i.exec(href)
    if (protocol) {
      protocol = protocol[0].toLowerCase()
      href = href.slice(protocol.length)
    }

    // 跳过 //
    if (href.indexOf('//') === 0) {
      href = href.slice(2)
    }

    let hostStart = 0
    let hostEnd = -1
    let isEnd = false
    let host
    for (let i = 0, len = href.length; i < len; i++) {
      const char = href[i]
      if ('\t\n\r "%\';<>\\^`{|}'.indexOf(char) >= 0) {
        // RFC 2396：不允许在 hostname 中使用的字符
        if (hostEnd === -1) hostEnd = i
      } else if ('#/?'.indexOf(char) >= 0) {
        // host 结束符
        if (hostEnd === -1) hostEnd = i
        isEnd = true
      } else if (char === '@') {
        hostStart = i + 1
        hostEnd = -1
      }

      if (isEnd) break
    }

    if (hostEnd === -1) {
      host = href.slice(hostStart)
      href = ''
    } else {
      host = href.slice(hostStart, hostEnd)
      href = href.slice(hostEnd)
    }


    // port
    let port = /:[0-9]*$/.exec(host)
    if (port) {
      port = port[0]
      host = host.slice(0, host.length - port.length)

      if (port !== ':') port = port.slice(1)
    } else {
      port = ''
    }

    // hostname
    for (let i = 0, len = host.length; i < len; i++) {
      const char = host[i]
      const isValid = (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || '.-+_'.indexOf(char) >= 0 || char.charCodeAt(0) > 127

      // 不合法的 host 字符
      if (!isValid) {
        host = host.slice(0, i)

        href = `/${host.slice(i)}${href}`
      }
    }
    const hostname = host.length > 255 ? '' : host.toLowerCase()

    // hash
    let hash
    let searchIndex = -1
    let hashIndex = -1
    for (let i = 0, len = href.length; i < len; i++) {
      if (href[i] === '#') {
        hash = href.slice(i)
        hashIndex = i
        break
      } else if (href[i] === '?' && searchIndex === -1) {
        searchIndex = i
      }
    }
    hash = hash === '#' ? '' : hash

    // search
    let search
    if (searchIndex !== -1) {
      if (hashIndex === -1) {
        search = href.slice(searchIndex)
      } else {
        search = href.slice(searchIndex, hashIndex)
      }
    }
    search = search === '?' ? '' : search

    // pathname
    let pathname
    const firstIndex = searchIndex !== -1 && (hashIndex === -1 || searchIndex < hashIndex) ? searchIndex : hashIndex
    if (firstIndex > 0) {
      pathname = href.slice(0, firstIndex)
    } else if (firstIndex === -1 && href.length > 0) {
      pathname = href
    }
    if (hostname && !pathname) {
      pathname = '/'
    }

    return {
      protocol,
      hostname,
      port,
      pathname,
      hash,
      search,
    }
  }

  /**
   * 打开一个新页面
   */
  _$open(url) {
    const pageKeys = Object.keys(HREF_CACHE)
    const parseRes = Location._$parse(url)

    for (const pageKey of pageKeys) {
      const {
        protocol, hostname, port, pathname
      } = HREF_CACHE[pageKey]

      parseRes.protocol = parseRes.protocol || 'http:'
      parseRes.hostname = parseRes.hostname || ''
      parseRes.port = parseRes.port || ''
      parseRes.pathname = parseRes.pathname || '/'
      parseRes.hash = parseRes.hash || ''
      parseRes.search = parseRes.search || ''

      if (parseRes.protocol === protocol && parseRes.hostname === hostname && parseRes.port === port && parseRes.pathname === pathname) {
        let param = ['type=open']
        if (parseRes.search) param.push(`search=${encodeURIComponent(parseRes.search)}`)
        if (parseRes.hash) param.push(`hash=${encodeURIComponent(parseRes.hash)}`)

        param = '?' + param.join('&')

        wx.navigateTo({
          url: `/pages/${pageKey}/${pageKey}${param}`
        })

        return
      }
    }

    // 没有命中任何一个页面，则前往 webview 页面
    const href = `${parseRes.protocol}//${(parseRes.hostname || '') + (parseRes.port ? ':' + parseRes.port : '')}${parseRes.pathname}${parseRes.search}${parseRes.hash}`
    wx.navigateTo({
      url: `/common/pages/default/default?url=${encodeURIComponent(href)}`
    })
  }

  /**
   * 检查 url 变化是否需要跳转
   */
  _checkUrl() {
    const pageKeys = Object.keys(HREF_CACHE)

    for (const pageKey of pageKeys) {
      const {
        protocol, hostname, port, pathname
      } = HREF_CACHE[pageKey]

      if (this._protocol === protocol && this._hostname === hostname && this._port === port && this._pathname === pathname) {
        if (pageKey !== this._pageKey) {
          let param = ['type=jump']
          if (this._search) param.push(`search=${encodeURIComponent(this._search)}`)
          if (this._hash) param.push(`hash=${encodeURIComponent(this._hash)}`)

          param = '?' + param.join('&')

          wx.redirectTo({
            url: `/pages/${pageKey}/${pageKey}${param}`
          })
        }

        return
      }
    }

    // 没有命中任何一个页面，则前往 webview 页面
    wx.redirectTo({
      url: `/common/pages/default/default?url=${encodeURIComponent(this.href)}`
    })
  }

  /**
   * 开始检查 hash 变化
   */
  _startCheckHash() {
    this._lastHash = this.hash
    this._lastHref = this.href
  }

  /**
   * 检查 hash 变化
   */
  _endCheckHash() {
    if (this._lastHash !== this.hash) {
      this._$trigger('hashchange', {
        event: {
          oldURL: this._lastHref,
          newURL: this.href,
        }
      })
    }
  }

  /**
   * 对外属性和方法
   */
  get href() {
    return `${this._protocol}//${this.host}${this._pathname}${this._search}${this._hash}`
  }

  set href(value) {
    if (!value || typeof value !== 'string') return

    this._startCheckHash()

    if (!/^(([a-zA-Z0-9]+:)|(\/\/))/i.test(value)) {
      // 没有带协议
      if (value.indexOf('/') === 0) {
        // 以 / 开头，直接替换整个 pathname、search、hash
        value = `${this._protocol}//${this.host}${value}`
      } else if (value.indexOf('#') === 0) {
        // 以 # 开头，直接替换整个 hash
        value = `${this._protocol}//${this.host}${this._pathname}${this._search}${value}`
      } else {
        // 非以 / 开头，则替换 pathname 的最后一段、search、hash
        let pathname = this._pathname.split('/')
        pathname.pop()
        pathname = pathname.join('/')

        value = `${this._protocol}//${this.host}${pathname}/${value}`
      }
    }

    const {
      protocol, hostname, port, hash, search, pathname
    } = Location._$parse(value)

    this._protocol = protocol || this._protocol
    this._hostname = hostname || this._hostname
    this._port = port || ''
    this._pathname = pathname || '/'
    this._search = search || ''
    this._hash = hash || ''

    this._endCheckHash()
    this._checkUrl()
  }

  get protocol() {
    return this._protocol
  }

  set protocol(value) {
    if (!value || typeof value !== 'string') return

    const parseRes = /^([a-z0-9.+-]+)(:)?$/i.exec(value)

    if (parseRes) {
      if (parseRes[2] === ':') {
        this._protocol = value
      } else {
        this._protocol = `${parseRes[1]}:`
      }
      this._checkUrl()
    }
  }

  get host() {
    return (this._hostname || '') + (this._port ? ':' + this._port : '')
  }

  set host(value) {
    if (!value || typeof value !== 'string') return

    const {hostname, port} = Location._$parse(`//${value}`)

    this._hostname = hostname || this._hostname
    this._port = port || ''
    this._checkUrl()
  }

  get hostname() {
    return this._hostname
  }

  set hostname(value) {
    if (!value || typeof value !== 'string') return

    const {hostname} = Location._$parse(`//${value}`)

    this._hostname = hostname || this._hostname
    this._checkUrl()
  }

  get port() {
    return this._port
  }

  set port(value) {
    value = +value

    if (typeof value !== 'number' || !isFinite(value) || value <= 0) return

    const port = value === 80 ? '' : value + ''

    this._port = port
    this._checkUrl()
  }

  get origin() {
    return `${this._protocol}//${this.host}`
  }

  set origin(value) {
    if (!value || typeof value !== 'string') return
    if (!/^(([a-zA-Z0-9]+:)|(\/\/))/i.test(value)) return // 没有带协议

    const {protocol, hostname, port} = Location._$parse(value)

    this._protocol = protocol || this._protocol
    this._hostname = hostname || this._hostname
    this._port = port || ''
    this._checkUrl()
  }

  get pathname() {
    return this._pathname
  }

  set pathname(value) {
    if (typeof value !== 'string') return

    if (!value || value === '/') {
      this._pathname = '/'
    } else {
      if (value[0] !== '/') value = `/${value}`

      const {pathname} = Location._$parse(`//miniprogram${value}`)

      this._pathname = pathname || '/'
    }
    this._checkUrl()
  }

  get search() {
    return this._search
  }

  set search(value) {
    if (typeof value !== 'string') return

    if (!value || value === '?') {
      this._search = ''
    } else {
      if (value[0] !== '?') value = `?${value}`

      const {search} = Location._$parse(`//miniprogram${value}`)

      this._search = search || ''
    }
  }

  get hash() {
    return this._hash
  }

  set hash(value) {
    if (typeof value !== 'string') return

    this._startCheckHash()

    if (!value || value === '#') {
      this._hash = ''
    } else {
      if (value[0] !== '#') value = `#${value}`

      const {hash} = Location._$parse(`//miniprogram${value}`)

      this._hash = hash || ''
    }

    this._endCheckHash()
  }

  reload() {
    // 暂不实现 TODO
  }

  replace(value) {
    // 和直接调用 location.href 的区别，不写入 history TODO
    this.href = value
  }

  toString() {
    return this.href
  }
}

// 预先解析各个页面的 url
Object.keys(urlMap).forEach(pageKey => {
  const {
    protocol, hostname, port, hash, search, pathname
  } = Location._$parse(urlMap[pageKey])

  HREF_CACHE[pageKey] = {
    protocol: protocol || 'http:',
    hostname: hostname || '',
    port: port || '',
    pathname: pathname || '/',
    hash: hash || '',
    search: search || '',
  }
})

module.exports = Location
