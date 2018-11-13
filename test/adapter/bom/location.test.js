const mock = require('../../mock')
const load = require('../../../src/template/adapter')

const config = load('config')
config.urlMap = {
  'test1': 'https://sub.host.com:8080/p/a/t/h?query=string#hash',
  'test2': '//sub.host.com#hash?query=string',
  'test3': 'a.c:0/?#'
}

const Location = load('Location')
const Event = load('Event')

let expectPagePath = ''
global.wx.redirectTo = function(options) {
  if (expectPagePath) expect(options.url).toBe(expectPagePath)
}
global.wx.navigateTo = function(options) {
  if (expectPagePath) expect(options.url).toBe(expectPagePath)
}

test('location: get', () => {
  const location1 = new Location('test1')
  expect(location1.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#hash')
  expect(location1.protocol).toBe('https:')
  expect(location1.host).toBe('sub.host.com:8080')
  expect(location1.hostname).toBe('sub.host.com')
  expect(location1.port).toBe('8080')
  expect(location1.origin).toBe('https://sub.host.com:8080')
  expect(location1.pathname).toBe('/p/a/t/h')
  expect(location1.search).toBe('?query=string')
  expect(location1.hash).toBe('#hash')

  const location2 = new Location('test2')
  expect(location2.href).toBe('http://sub.host.com/#hash?query=string')
  expect(location2.protocol).toBe('http:')
  expect(location2.host).toBe('sub.host.com')
  expect(location2.hostname).toBe('sub.host.com')
  expect(location2.port).toBe('')
  expect(location2.origin).toBe('http://sub.host.com')
  expect(location2.pathname).toBe('/')
  expect(location2.search).toBe('')
  expect(location2.hash).toBe('#hash?query=string')

  const location3 = new Location('test3')
  expect(location3.href).toBe('http://a.c:0/')
  expect(location3.protocol).toBe('http:')
  expect(location3.host).toBe('a.c:0')
  expect(location3.hostname).toBe('a.c')
  expect(location3.port).toBe('0')
  expect(location3.origin).toBe('http://a.c:0')
  expect(location3.pathname).toBe('/')
  expect(location3.search).toBe('')
  expect(location3.hash).toBe('')
})

test('location: set', () => {
  expectPagePath = ''
  let hashChangeCount = 0
  let oldURL = ''
  let newURL = ''
  let tempURL = ''
  const location = new Location('test1')
  const onHashChange = evt => {
    oldURL = evt.oldURL
    newURL = evt.newURL
    hashChangeCount++
  }
  location.addEventListener('hashchange', onHashChange)

  // protocol
  expect(location.protocol).toBe('https:')
  location.protocol = 'http'
  expect(location.protocol).toBe('http:')
  location.protocol = 'ftp:'
  expect(location.protocol).toBe('ftp:')

  // port
  expect(location.port).toBe('8080')
  location.port = ''
  expect(location.port).toBe('8080')
  location.port = 0
  expect(location.port).toBe('8080')
  location.port = -80
  expect(location.port).toBe('8080')
  location.port = 8000
  expect(location.port).toBe('8000')
  location.port = 80
  expect(location.port).toBe('')
  location.port = '3000'
  expect(location.port).toBe('3000')
  location.port = '80'
  expect(location.port).toBe('')

  // hostname
  expect(location.hostname).toBe('sub.host.com')
  location.hostname = 'a.b.c'
  expect(location.hostname).toBe('a.b.c')
  location.hostname = ''
  expect(location.hostname).toBe('a.b.c')
  location.hostname = 'c.b.a:8088'
  expect(location.hostname).toBe('c.b.a')
  expect(location.port).toBe('')

  // host
  expect(location.host).toBe('c.b.a')
  location.host = 'sub.host.com:8080'
  expect(location.host).toBe('sub.host.com:8080')
  expect(location.hostname).toBe('sub.host.com')
  expect(location.port).toBe('8080')
  location.host = ''
  expect(location.host).toBe('sub.host.com:8080')
  expect(location.hostname).toBe('sub.host.com')
  expect(location.port).toBe('8080')
  location.host = 'c.b.a'
  expect(location.host).toBe('c.b.a')
  expect(location.hostname).toBe('c.b.a')
  expect(location.port).toBe('')

  // origin
  expect(location.origin).toBe('ftp://c.b.a')
  location.origin = 'http://a.c.d:3033'
  expect(location.origin).toBe('http://a.c.d:3033')
  expect(location.protocol).toBe('http:')
  expect(location.hostname).toBe('a.c.d')
  expect(location.port).toBe('3033')
  location.origin = ''
  expect(location.origin).toBe('http://a.c.d:3033')
  expect(location.protocol).toBe('http:')
  expect(location.hostname).toBe('a.c.d')
  expect(location.port).toBe('3033')
  location.origin = 'https://c.b.a'
  expect(location.origin).toBe('https://c.b.a')
  expect(location.protocol).toBe('https:')
  expect(location.hostname).toBe('c.b.a')
  expect(location.port).toBe('')

  // pathname
  expect(location.pathname).toBe('/p/a/t/h')
  location.pathname = ''
  expect(location.pathname).toBe('/')
  location.pathname = 'p/a/t'
  expect(location.pathname).toBe('/p/a/t')
  location.pathname = '/'
  expect(location.pathname).toBe('/')
  location.pathname = '/cc/aa'
  expect(location.pathname).toBe('/cc/aa')

  // search
  expect(location.search).toBe('?query=string')
  location.search = ''
  expect(location.search).toBe('')
  location.search = 'a=123'
  expect(location.search).toBe('?a=123')
  location.search = '?'
  expect(location.search).toBe('')
  location.search = '?c=321'
  expect(location.search).toBe('?c=321')

  // hash
  expect(location.hash).toBe('#hash')
  expect(hashChangeCount).toBe(0)
  expect(oldURL).toBe('')
  expect(newURL).toBe('')
  tempURL = location.href
  location.hash = ''
  expect(location.hash).toBe('')
  expect(hashChangeCount).toBe(1)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.hash = 'abc'
  expect(location.hash).toBe('#abc')
  expect(hashChangeCount).toBe(2)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.hash = '#'
  expect(location.hash).toBe('')
  expect(hashChangeCount).toBe(3)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.hash = '#cba'
  expect(location.hash).toBe('#cba')
  expect(hashChangeCount).toBe(4)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  location.hash = 'cba'
  expect(location.hash).toBe('#cba')
  expect(hashChangeCount).toBe(4)

  // href
  expect(location.href).toBe('https://c.b.a/cc/aa?c=321#cba')
  tempURL = location.href
  location.href = '//a.b.c/aa/bb?v=321#abc'
  expect(location.href).toBe('https://a.b.c/aa/bb?v=321#abc')
  expect(location.protocol).toBe('https:')
  expect(location.host).toBe('a.b.c')
  expect(location.hostname).toBe('a.b.c')
  expect(location.port).toBe('')
  expect(location.origin).toBe('https://a.b.c')
  expect(location.pathname).toBe('/aa/bb')
  expect(location.search).toBe('?v=321')
  expect(location.hash).toBe('#abc')
  expect(hashChangeCount).toBe(5)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.href = 'c.b.a/mm/nn?p=456#000' // 不带协议，不以 / 开头
  expect(location.href).toBe('https://a.b.c/aa/c.b.a/mm/nn?p=456#000')
  expect(hashChangeCount).toBe(6)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.href = '/haha/rr/ee?n=098#111' // 不带协议，以 / 开头
  expect(location.href).toBe('https://a.b.c/haha/rr/ee?n=098#111')
  expect(hashChangeCount).toBe(7)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)
  tempURL = location.href
  location.href = '#222' // 不带协议，以 # 开头
  expect(location.href).toBe('https://a.b.c/haha/rr/ee?n=098#222')
  expect(hashChangeCount).toBe(8)
  expect(oldURL).toBe(tempURL)
  expect(newURL).toBe(location.href)

  location.removeEventListener('hashchange', onHashChange)
})

test('location: replace/toString/_$open', () => {
  const location1 = new Location('test1')
  const location2 = new Location('test2')
  const location3 = new Location('test3')

  // toString
  expect(location1.toString()).toBe(location1.href)
  expect(location2.toString()).toBe(location2.href)
  expect(location3.toString()).toBe(location3.href)

  // replace
  expectPagePath = `/pages/test2/test2?type=jump&hash=${encodeURIComponent('#hash?query=string')}`
  location1.replace(location2.href)
  expect(location1.href).toBe(location2.href)
  expectPagePath = '/pages/test3/test3?type=jump'
  location2.replace(location3.href)
  expect(location2.href).toBe(location3.href)
  expectPagePath = `/common/pages/default/default?url=${encodeURIComponent('http://a.s.d.f/q/w/e/r?q=1&e=3#0101')}`
  location3.replace('//a.s.d.f/q/w/e/r?q=1&e=3#0101')
  expect(location3.href).toBe('http://a.s.d.f/q/w/e/r?q=1&e=3#0101')

  // _$open
  expectPagePath = `/pages/test2/test2?type=open&hash=${encodeURIComponent('#hash?query=string')}`
  location1._$open(location1.href)
  expectPagePath = '/pages/test3/test3?type=open'
  location1._$open(location2.href)
  expectPagePath = `/common/pages/default/default?url=${encodeURIComponent('http://a.s.d.f/q/w/e/r?q=1&e=3#0101')}`
  location1._$open(location3.href)
})
