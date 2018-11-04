const mock = require('../../mock')
const load = require('../../../src/template/adapter')
const html = require('../../../src/html')

const Document = load('Document')
const tool = load('tool')
const cache = load('cache')
const Style = load('Style')

const nodeIdMap = {}
const pageId = `p-${tool.getId()}`
let document

beforeAll(async () => {
    const pageInfo = await html.parse(mock.html)

    document = new Document(pageId, 'index', pageInfo.body, nodeIdMap)
    cache.init(pageId, {
        document,
        nodeIdMap,
    })
})

test('style', () => {
  let updateCount = 0
  const element = document.createElement('div')
  const style = new Style(element, 'position: absolute; top: 0; left: 0;', () => {
    updateCount++
  })

  expect(style.position).toBe('absolute')
  expect(style.top).toBe('0')
  expect(style.top).toBe('0')
  expect(style.width).toBe('')

  style.width = '100%'
  expect(style.width).toBe('100%')
  style.height = '13px'
  expect(style.height).toBe('13px')
  expect(updateCount).toBe(2)

  expect(style.cssText).toBe('position:absolute;top:0;left:0;width:100%;height:13px;')

  style.cssText = 'position: relative; display: block;'
  expect(style.position).toBe('relative')
  expect(style.top).toBe('')
  expect(style.left).toBe('')
  expect(style.display).toBe('block')
  expect(updateCount).toBe(3)

  expect(style.cssText).toBe('position:relative;display:block;')
})
