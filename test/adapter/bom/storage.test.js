const mock = require('../../mock')
const load = require('../../../src/template/adapter')
const html = require('../../../src/html')

const Window = load('Window')
const Document = load('Document')
const tool = load('tool')
const cache = load('cache')
const Event = load('Event')

const nodeIdMap = {}
const pageId = `p-${tool.getId()}`
let document
let window

beforeAll(async () => {
  const pageInfo = await html.parse(mock.html)

  document = new Document(pageId, 'index', pageInfo.body, nodeIdMap)
  window = new Window(pageId, 'index')
  cache.init(pageId, {
    document,
    window,
    nodeIdMap,
  })
})

test('storage', () => {
  const map = {}
  global.wx.getStorageInfoSync = () => {
    const keys = Object.keys(map)
    const currentSize = keys.length

    return {keys, currentSize}
  }
  global.wx.getStorageSync = key => map[key]
  global.wx.setStorageSync = (key, data) => map[key] = data
  global.wx.removeStorageSync = key => delete map[key]
  global.wx.clearStorageSync = () => Object.keys(map).forEach(key => delete map[key])

  const localStorage = window.localStorage
  const sessionStorage = window.sessionStorage
  let event

  window.addEventListener('storage', evt => {
    expect(evt).toBeInstanceOf(Event)
    event = evt
  })

  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)

  localStorage.setItem('a', '123')
  expect(event).toMatchObject({key: 'a', newValue: '123', oldValue: null})

  localStorage.setItem('a', '1')
  expect(event).toMatchObject({key: 'a', newValue: '1', oldValue: '123'})
  sessionStorage.setItem('b', '2')
  expect(event).toMatchObject({key: 'b', newValue: '2', oldValue: null})
  localStorage.setItem('c', '3')
  expect(event).toMatchObject({key: 'c', newValue: '3', oldValue: null})
  sessionStorage.setItem('d', '4')
  expect(event).toMatchObject({key: 'd', newValue: '4', oldValue: null})
  localStorage.setItem('e', '5')
  expect(event).toMatchObject({key: 'e', newValue: '5', oldValue: null})
  sessionStorage.setItem('f', '6')
  expect(event).toMatchObject({key: 'f', newValue: '6', oldValue: null})
  localStorage.setItem('g', '7')
  expect(event).toMatchObject({key: 'g', newValue: '7', oldValue: null})

  expect(localStorage.length).toBe(4)
  expect(sessionStorage.length).toBe(3)

  expect(localStorage.key(0)).toBe('1')
  expect(localStorage.key(1)).toBe('3')
  expect(localStorage.key(2)).toBe('5')
  expect(localStorage.key(3)).toBe('7')
  expect(localStorage.key(4)).toBe(null)
  expect(sessionStorage.key(0)).toBe('2')
  expect(sessionStorage.key(1)).toBe('4')
  expect(sessionStorage.key(2)).toBe('6')
  expect(sessionStorage.key(3)).toBe(null)

  expect(localStorage.getItem('a')).toBe('1')
  expect(localStorage.getItem('c')).toBe('3')
  expect(localStorage.getItem('e')).toBe('5')
  expect(localStorage.getItem('g')).toBe('7')
  expect(localStorage.getItem('i')).toBe(null)
  expect(sessionStorage.getItem('b')).toBe('2')
  expect(sessionStorage.getItem('d')).toBe('4')
  expect(sessionStorage.getItem('f')).toBe('6')
  expect(sessionStorage.getItem('h')).toBe(null)

  localStorage.removeItem('c')
  expect(event).toMatchObject({key: 'c', newValue: null, oldValue: '3'})
  sessionStorage.removeItem('d')
  expect(event).toMatchObject({key: 'd', newValue: null, oldValue: '4'})

  expect(localStorage.length).toBe(3)
  expect(sessionStorage.length).toBe(2)

  expect(localStorage.key(0)).toBe('1')
  expect(localStorage.key(1)).toBe('5')
  expect(localStorage.key(2)).toBe('7')
  expect(localStorage.key(3)).toBe(null)
  expect(localStorage.key(4)).toBe(null)
  expect(sessionStorage.key(0)).toBe('2')
  expect(sessionStorage.key(1)).toBe('6')
  expect(sessionStorage.key(2)).toBe(null)
  expect(sessionStorage.key(3)).toBe(null)

  expect(localStorage.getItem('a')).toBe('1')
  expect(localStorage.getItem('c')).toBe(null)
  expect(localStorage.getItem('e')).toBe('5')
  expect(localStorage.getItem('g')).toBe('7')
  expect(localStorage.getItem('i')).toBe(null)
  expect(sessionStorage.getItem('b')).toBe('2')
  expect(sessionStorage.getItem('d')).toBe(null)
  expect(sessionStorage.getItem('f')).toBe('6')
  expect(sessionStorage.getItem('h')).toBe(null)

  localStorage.clear()
  expect(event).toMatchObject({key: null, newValue: null, oldValue: null})
  sessionStorage.clear()
  expect(event).toMatchObject({key: null, newValue: null, oldValue: null})

  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)

  expect(localStorage.key(0)).toBe(null)
  expect(localStorage.key(1)).toBe(null)
  expect(localStorage.key(2)).toBe(null)
  expect(localStorage.key(3)).toBe(null)
  expect(localStorage.key(4)).toBe(null)
  expect(sessionStorage.key(0)).toBe(null)
  expect(sessionStorage.key(1)).toBe(null)
  expect(sessionStorage.key(2)).toBe(null)
  expect(sessionStorage.key(3)).toBe(null)

  expect(localStorage.getItem('a')).toBe(null)
  expect(localStorage.getItem('c')).toBe(null)
  expect(localStorage.getItem('e')).toBe(null)
  expect(localStorage.getItem('g')).toBe(null)
  expect(localStorage.getItem('i')).toBe(null)
  expect(sessionStorage.getItem('b')).toBe(null)
  expect(sessionStorage.getItem('d')).toBe(null)
  expect(sessionStorage.getItem('f')).toBe(null)
  expect(sessionStorage.getItem('h')).toBe(null)
})
