const mock = require('../mock')
const load = require('../../src/template/adapter')
const html = require('../../src/html')

const Window = load('Window')
const Document = load('Document')
const tool = load('tool')
const cache = load('cache')

const nodeIdMap = {}
const pageId = `p-${tool.getId()}`
let document
let window

beforeAll(async () => {
  global.wx.getSystemInfoSync = function() {
    return {
      screenHeight: 300,
      screenWidth: 200,
      windowHeight: 280,
      windowWidth: 190,
    }
  }

  const pageInfo = await html.parse(mock.html)

  document = new Document(pageId, 'index', pageInfo.body, nodeIdMap)
  window = new Window(pageId, 'index')
  cache.init(pageId, {
    document,
    window,
    nodeIdMap,
  })
})

test('window: self', () => {
  expect(window.self).toBe(window)
})

test('window: screen/innerHeight/innerWidth/outerHeight/outerWidth', () => {
  expect(window.screen.height).toBe(300)
  expect(window.screen.width).toBe(200)

  expect(window.outerHeight).toBe(300)
  expect(window.outerWidth).toBe(200)
  expect(window.innerHeight).toBe(280)
  expect(window.innerWidth).toBe(190)
})

test('window: getComputedStyle', async () => {
  const node1 = document.getElementById('bb')
  const node2 = document.querySelector('footer')

  // 设置测试数据
  mock.setSelectorQueryRes([{
    display: 'block',
    dataset: {
      privateNodeId: node1._$nodeId,
      privatePageId: pageId,
    },
  }, {
    position: 'absolute',
    dataset: {
      privateNodeId: node2._$nodeId,
      privatePageId: pageId,
    },
  }])

  await window._$fetchWebviewInfo() // 拉取相关信息
  expect(window.getComputedStyle(node1).display).toBe('block')
  expect(window.getComputedStyle(node1).getPropertyValue('display')).toBe('block')
  expect(window.getComputedStyle(node1).position).toBe('')
  expect(window.getComputedStyle(node1).getPropertyValue('position')).toBe('')
  expect(window.getComputedStyle(node2).position).toBe('absolute')
  expect(window.getComputedStyle(node2).getPropertyValue('position')).toBe('absolute')
  expect(window.getComputedStyle(node2).display).toBe('')
  expect(window.getComputedStyle(node2).getPropertyValue('display')).toBe('')

  // 设置测试数据
  mock.setSelectorQueryRes([{
    display: 'inline',
    dataset: {
      privateNodeId: node1._$nodeId,
      privatePageId: pageId,
    },
  }, {
    position: 'relative',
    dataset: {
      privateNodeId: node2._$nodeId,
      privatePageId: pageId,
    },
  }])

  await window._$fetchWebviewInfo() // 拉取相关信息
  expect(window.getComputedStyle(node1).display).toBe('inline')
  expect(window.getComputedStyle(node1).getPropertyValue('display')).toBe('inline')
  expect(window.getComputedStyle(node1).position).toBe('')
  expect(window.getComputedStyle(node1).getPropertyValue('position')).toBe('')
  expect(window.getComputedStyle(node2).position).toBe('relative')
  expect(window.getComputedStyle(node2).getPropertyValue('position')).toBe('relative')
  expect(window.getComputedStyle(node2).display).toBe('')
  expect(window.getComputedStyle(node2).getPropertyValue('display')).toBe('')
})
