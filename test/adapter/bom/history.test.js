const mock = require('../../mock')
const load = require('../../../src/template/adapter')

const config = load('config')
config.urlMap = {
  'test1': 'https://sub.host.com:8080/p/a/t/h?query=string#hash',
}

const History = load('History')
const Location = load('Location')
const Event = load('Event')

let expectTitle = ''
global.wx.setNavigationBarTitle = function(options) {
  if (expectTitle) expect(options.title).toBe(expectTitle)
}
global.wx.redirectTo = function() {}
global.wx.navigateTo = function() {}

test('history', () => {
  const location = new Location('test1')
  const history = new History(location)
  let popStateCount = 0
  let state = null
  const onPopState = evt => {
    state = evt.state
    popStateCount++
  }
  history.addEventListener('popstate', onPopState)

  expect(history.length).toBe(1)
  expect(history.state).toBe(null)
  expect(popStateCount).toBe(0)

  // pushState
  expectTitle = 'test1'
  history.pushState({a: 1}, expectTitle, '#123')
  expect(history.length).toBe(2)
  expect(history.state).toEqual({a: 1})
  expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#123')
  expectTitle = 'test2'
  history.pushState({b: 2}, expectTitle, '/test#321')
  expect(history.length).toBe(3)
  expect(history.state).toEqual({b: 2})
  expect(location.href).toBe('https://sub.host.com:8080/test#321')
  expectTitle = 'test3'
  history.pushState({c: 3}, expectTitle, 'https://sub.host.com:8080/haha/hehe?a=123#/my-hash')
  expect(history.length).toBe(4)
  expect(history.state).toEqual({c: 3})
  expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#/my-hash')
  history.pushState({d: 4}, 'xxxxx', 'https://sub.host.com/haha/hehe?a=123#/my-hash') // 跨域，不支持
  expect(history.length).toBe(4)
  expect(history.state).toEqual({c: 3})
  expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#/my-hash')

  // replaceState
  expectTitle = 'test11'
  history.replaceState({aa: 1}, expectTitle, '#other-hash')
  expect(history.length).toBe(4)
  expect(history.state).toEqual({aa: 1})
  expect(location.href).toBe('https://sub.host.com:8080/haha/hehe?a=123#other-hash')
  expectTitle = 'test22'
  history.replaceState({bb: 2}, expectTitle, '/test#123')
  expect(history.length).toBe(4)
  expect(history.state).toEqual({bb: 2})
  expect(location.href).toBe('https://sub.host.com:8080/test#123')
  expectTitle = 'test33'
  history.replaceState({cc: 3}, expectTitle, 'https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
  expect(history.length).toBe(4)
  expect(history.state).toEqual({cc: 3})
  expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
  history.replaceState({dd: 4}, 'xxxxx', 'http://sub.host.com/yoyo/qiegenao?cc=aa&dd=xx#123') // 跨域，不支持
  expect(history.length).toBe(4)
  expect(history.state).toEqual({cc: 3})
  expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')

  // location 的变化接入 history
  location.hash = '#/ppp/ooo'
  expect(history.length).toBe(5)
  expect(history.state).toBe(null)
  location.href = 'https://sub.host.com:8080/simple#/'
  expect(history.length).toBe(6)
  expect(history.state).toBe(null)
  location.replace('https://sub.host.com:8080/simple#/other') // location.replace 不进入 history
  expect(history.length).toBe(6)
  expect(history.state).toBe(null)

  // go/back/forward
  expect(popStateCount).toBe(0)
  history.back()
  expect(popStateCount).toBe(1)
  expect(state).toBe(null)
  expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/ppp/ooo')
  history.back()
  expect(popStateCount).toBe(2)
  expect(state).toEqual({cc: 3})
  expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')
  history.go(-2)
  expect(popStateCount).toBe(3)
  expect(state).toEqual({a: 1})
  expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#123')
  history.forward()
  expect(popStateCount).toBe(4)
  expect(state).toEqual({b: 2})
  expect(location.href).toBe('https://sub.host.com:8080/test#321')
  history.go(-2)
  expect(popStateCount).toBe(5)
  expect(state).toBe(null)
  expect(location.href).toBe('https://sub.host.com:8080/p/a/t/h?query=string#hash')
  history.go(3)
  expect(popStateCount).toBe(6)
  expect(state).toEqual({cc: 3})
  expect(location.href).toBe('https://sub.host.com:8080/yoyo/qiegenao?cc=aa&dd=xx#/hi/hello')

  // 在栈中间调 replaceState/pushState
  expect(history.length).toBe(6)
  expect(history.state).toEqual({cc: 3})
  expectTitle = 'xxxxx'
  history.replaceState({cc: 4}, expectTitle, '#/bye')
  expect(history.length).toBe(6)
  expect(history.state).toEqual({cc: 4})
  history.pushState({dd: 5}, expectTitle, '#/goodbye')
  expect(history.length).toBe(5)
  expect(history.state).toEqual({dd: 5})
})
