const mock = require('../mock')
const load = require('../../src/template/adapter')
const html = require('../../src/html')

const Document = load('Document')
const Window = load('Window')
const Element = load('Element')
const TextNode = load('TextNode')
const Comment = load('Comment')
const Node = load('Node')
const tool = load('tool')
const cache = load('cache')
const config = load('config')

config.urlMap = {
  'index': 'https://sub.host.com:8080/p/a/t/h?query=string#hash',
}

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

test('document: nodeType/URL', () => {
    expect(document.nodeType).toBe(Node.DOCUMENT_NODE)
    expect(document.URL).toBe(window.location.href)
})

test('document: documentElement', () => {
    expect(document.documentElement).toBeInstanceOf(Element)
    expect(document.documentElement.tagName).toBe('HTML')
    expect(document.documentElement.parentNode).toBe(document)
})

test('document: head', () => {
    expect(document.head).toBeInstanceOf(Element)
    expect(document.head.tagName).toBe('HEAD')
})

test('document: body', () => {
    expect(document.body).toBeInstanceOf(Element)
    expect(document.body.tagName).toBe('BODY')
})

test('document: defaultView', () => {
    expect(document.defaultView).toBe(window)
})

test('document: getElementById', () => {
    const node1 = document.getElementById('bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')
    expect(node1.id).toBe('bb')

    const node2 = document.getElementById('bb4')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
    expect(node2.id).toBe('bb4')

    expect(document.getElementById('aa')).toBe(null)
})

test('document: getElementsByTagName', () => {
    const nodes = document.getElementsByTagName('span')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')
})

test('document: getElementsByClassName', () => {
    const nodes = document.getElementsByClassName('bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')
})

test('document: querySelector', () => {
    const node1 = document.querySelector('#bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')
    expect(node1.id).toBe('bb')

    const node2 = document.querySelector('#bb .bb4')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
    expect(node2.id).toBe('bb4')

    expect(document.querySelector('#aa')).toBe(null)
})

test('document: querySelectorAll', () => {
    const nodes = document.querySelectorAll('#bb .bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[0].id).toBe('bb4')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')

    expect(document.querySelectorAll('#aa').length).toBe(0)
})

test('document: createElement', () => {
    const node1 = document.createElement('div')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')

    const node2 = document.createElement('span')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
})

test('document: createTextNode', () => {
    const node1 = document.createTextNode('123')
    expect(node1).toBeInstanceOf(TextNode)
    expect(node1.textContent).toBe('123')

    const node2 = document.createTextNode('321')
    expect(node2).toBeInstanceOf(TextNode)
    expect(node2.textContent).toBe('321')
})

test('document: createComment', () => {
    const node1 = document.createComment('123')
    expect(node1).toBeInstanceOf(Comment)

    const node2 = document.createComment('321')
    expect(node2).toBeInstanceOf(Comment)

    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.appendChild(child)
    expect(parent.childNodes).toEqual([child])
    parent.appendChild(node1)
    expect(parent.childNodes).toEqual([child, node1])
    parent.insertBefore(node1, child)
    expect(parent.childNodes).toEqual([node1, child])
    parent.replaceChild(node2, child)
    expect(parent.childNodes).toEqual([node1, node2])
})

test('document: createDocumentFragment', () => {
    const parent = document.createElement('div')
    const a = document.createElement('div')
    const b = document.createElement('span')
    const c = document.createElement('div')
    const d = document.createElement('span')

    expect(parent.children).toEqual([])

    const fragment1 = document.createDocumentFragment()
    fragment1.appendChild(a)
    fragment1.appendChild(b)
    fragment1.appendChild(c)
    parent.appendChild(fragment1)
    expect(fragment1.nodeType).toEqual(Node.DOCUMENT_FRAGMENT_NODE)
    expect(parent.children).toEqual([a, b, c])

    const fragment2 = document.createDocumentFragment()
    fragment2.appendChild(c)
    fragment2.appendChild(d)
    parent.replaceChild(fragment2, b)
    expect(parent.children).toEqual([a, c, d])

    const fragment3 = document.createDocumentFragment()
    fragment3.appendChild(b)
    fragment3.appendChild(d)
    parent.insertBefore(fragment3, c)
    expect(parent.children).toEqual([a, b, d, c])
})

test('document: createEvent', () => {
    const evt = document.createEvent('EVENT')

    expect(evt).toBeInstanceOf(window.CustomEvent)

    evt.initEvent('test1')
    expect(evt.type).toBe('test1')
    expect(evt.bubbles).toBe(false)

    evt.initEvent('test2', true)
    expect(evt.type).toBe('test2')
    expect(evt.bubbles).toBe(true)
})
