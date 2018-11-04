const mock = require('../../mock')
const load = require('../../../src/template/adapter')
const html = require('../../../src/html')

const Window = load('Window')
const Document = load('Document')
const Element = load('Element')
const TextNode = load('TextNode')
const Node = load('Node')
const ClassList = load('ClassList')
const Style = load('Style')
const event = load('event')
const tool = load('tool')
const cache = load('cache')

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

test('node: id/tagName', () => {
    const node1 = document.querySelector('.bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.id).toBe('bb')

    const node2 = document.querySelector('header')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('HEADER')
    expect(node2.id).toBe('')

    node2.id = 'header'
    expect(node2.id).toBe('header')
    expect(document.getElementById('header').id).toBe('header')
    expect(document.querySelector('#header').id).toBe('header')

    node2.id = ''
    expect(node2.id).toBe('')
    expect(document.getElementById('header')).toBe(null)
    expect(document.querySelector('#header')).toBe(null)
})

test('node: className/classList', () => {
    const node1 = document.querySelector('#bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.className).toBe('bb')
    expect(node1.classList).toBeInstanceOf(ClassList)

    const node2 = document.querySelector('header')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('HEADER')
    expect(node2.className).toBe('')
    expect(node2.classList).toBeInstanceOf(ClassList)

    node2.className = 'header1 header2'
    expect(node2.className).toBe('header1 header2')
    expect(node2.classList.contains('header1')).toBe(true)
    expect(node2.classList.contains('header2')).toBe(true)
    expect(document.querySelector('.header1').className).toBe('header1 header2')
    expect(document.querySelector('.header2').className).toBe('header1 header2')

    node2.className = ''
    expect(node2.className).toBe('')
    expect(node2.classList.contains('header1')).toBe(false)
    expect(node2.classList.contains('header2')).toBe(false)
    expect(document.querySelector('.header1')).toBe(null)
    expect(document.querySelector('.header2')).toBe(null)

    node2.classList.add('header3')
    expect(node2.classList.contains('header3')).toBe(true)
    expect(document.querySelector('.header3').className).toBe('header3')

    node2.classList.remove('header3')
    expect(node2.classList.contains('header3')).toBe(false)
    expect(document.querySelector('.header3')).toBe(null)
})

test('node: dataset', () => {
    const node1 = document.createElement('div')
    node1.innerHTML = '<div data-a="abc" data-bc-d-efg="efg" data-hi-j=123></div>'

    const node2 = node1.childNodes[0]

    expect(node2.dataset).toEqual({
        'a': 'abc',
        'bcDEfg': 'efg',
        'hiJ': '123',
    })

    node2.dataset.bcDEfg = 'hij'
    node2.dataset.kLmNOpQr = 'klm'

    expect(node2.dataset).toEqual({
        'a': 'abc',
        'bcDEfg': 'hij',
        'hiJ': '123',
        'kLmNOpQr': 'klm'
    })
    expect(node1.innerHTML).toEqual('<div data-a="abc" data-bc-d-efg="hij" data-hi-j="123" data-k-lm-n-op-qr="klm"></div>')
    expect(node2.outerHTML).toEqual('<div data-a="abc" data-bc-d-efg="hij" data-hi-j="123" data-k-lm-n-op-qr="klm"></div>')

    const node3 = node2.cloneNode()
    node3.dataset.hiJ = '321'
    expect(node3.dataset).toEqual({
        'a': 'abc',
        'bcDEfg': 'hij',
        'hiJ': '321',
        'kLmNOpQr': 'klm'
    })
    expect(node3.outerHTML).toEqual('<div data-a="abc" data-bc-d-efg="hij" data-hi-j="321" data-k-lm-n-op-qr="klm"></div>')
})

test('node: ownerDocument', () => {
    const node1 = document.createElement('div')
    const node2 = document.createElement('span')
    const node3 = document.createTextNode('hahaha')
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)

    document.body.appendChild(node1)
    node2.appendChild(node3)
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)

    node1.appendChild(node2)
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)

    node2.removeChild(node3)
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)

    node1.removeChild(node2)
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)

    document.body.removeChild(node1)
    expect(node1.ownerDocument).toBe(document)
    expect(node2.ownerDocument).toBe(document)
    expect(node3.ownerDocument).toBe(document)
})

test('node: childNodes/children/firstChild/lastChild', () => {
    const node1 = document.querySelector('.bb1')
    expect(node1.childNodes.length).toBe(1)
    expect(node1.children.length).toBe(0)
    expect(node1.childNodes[0]).toBeInstanceOf(TextNode)
    expect(node1.childNodes[0].textContent).toBe('123')

    const node2 = document.querySelector('header')
    expect(node2.childNodes.length).toBe(2)
    expect(node2.children.length).toBe(2)
    expect(node2.childNodes[0].className).toBe('bb1')
    expect(node2.childNodes[1].className).toBe('bb2')
    expect(node2.childNodes[0]).toBe(node2.children[0])
    expect(node2.childNodes[1]).toBe(node2.children[1])

    expect(node2.firstChild).toBe(node2.childNodes[0])
    expect(node2.lastChild).toBe(node2.childNodes[1])
})

test('node: innerHTML/outerHTML', () => {
    const a = document.createElement('article')
    const b = document.createElement('span')
    const c = document.createElement('div')
    const d = document.createTextNode('123')
    const e = document.createElement('span')
    const f = document.createTextNode('321')
    const g = document.createTextNode('555')
    const h = document.createElement('br')
    e.appendChild(g)
    c.appendChild(d)
    c.appendChild(e)
    c.appendChild(f)
    a.appendChild(b)
    a.appendChild(c)
    a.appendChild(h)
    document.body.appendChild(a)
    expect(a.childNodes).toEqual([b, c, h])

    let pUpdateCount = 0
    let aUpdateCount = 0
    const onPUpdate = function () {
        pUpdateCount++
    }
    const onAUpdate = function () {
        aUpdateCount++
    }
    a.parentNode.addEventListener('_childNodesUpdate', onPUpdate)
    a.addEventListener('_childNodesUpdate', onAUpdate)

    a.id = 'outer'
    b.id = 'abc'
    e.id = 'cba'
    c.id = 'cc'
    c.className = 'a b c'
    c.style.position = 'absolute'
    c.style.top = '10px'
    c.style.left = '20px'
    expect(pUpdateCount).toBe(1)
    expect(aUpdateCount).toBe(6)
    expect(a.tagName).toBe('ARTICLE')
    expect(a.id).toBe('outer')
    expect(a.innerHTML).toEqual('<span id="abc"></span><div id="cc" class="a b c" style="position:absolute;top:10px;left:20px;">123<span id="cba">555</span>321</div><br />')
    expect(a.outerHTML).toEqual('<article id="outer"><span id="abc"></span><div id="cc" class="a b c" style="position:absolute;top:10px;left:20px;">123<span id="cba">555</span>321</div><br /></article>')
    
    a.innerHTML = '<div id="a">321<span id="inner" b="inner">765</span>123</div><div id="c">555</div><p style="color: green; text-align: center;">I am content</p>'
    expect(a.childNodes.length).toBe(3)
    expect(a.childNodes[0].id).toBe('a')
    expect(a.childNodes[0].childNodes.length).toBe(3)
    expect(a.childNodes[0].childNodes[0].textContent).toBe('321')
    expect(a.childNodes[0].childNodes[1].id).toBe('inner')
    expect(a.childNodes[0].childNodes[1].tagName).toBe('SPAN')
    expect(a.childNodes[0].childNodes[1].childNodes.length).toBe(1)
    expect(a.childNodes[0].childNodes[1].childNodes[0].textContent).toBe('765')
    expect(a.childNodes[0].childNodes[2].textContent).toBe('123')
    expect(a.childNodes[1].id).toBe('c')
    expect(a.childNodes[1].childNodes.length).toBe(1)
    expect(a.childNodes[1].childNodes[0].textContent).toBe('555')
    expect(a.childNodes[2].tagName).toBe('P')
    expect(a.childNodes[2].style.color).toBe('green')
    expect(a.childNodes[2].style.textAlign).toBe('center')
    expect(a.childNodes[2].childNodes.length).toBe(1)
    expect(a.childNodes[2].childNodes[0].textContent).toBe('I am content')
    expect(pUpdateCount).toBe(1)
    expect(aUpdateCount).toBe(7)

    a.outerHTML = '<header id="outer2"><div id="a">321<span id="inner" b="inner">765</span>123</div><div id="c">555</div><p style="color: green; text-align: center;">I am content</p></header>'
    expect(a.tagName).toBe('HEADER')
    expect(a.id).toBe('outer2')
    expect(a.childNodes.length).toBe(3)
    expect(a.childNodes[0].id).toBe('a')
    expect(a.childNodes[0].childNodes.length).toBe(3)
    expect(a.childNodes[0].childNodes[0].textContent).toBe('321')
    expect(a.childNodes[0].childNodes[1].id).toBe('inner')
    expect(a.childNodes[0].childNodes[1].tagName).toBe('SPAN')
    expect(a.childNodes[0].childNodes[1].childNodes.length).toBe(1)
    expect(a.childNodes[0].childNodes[1].childNodes[0].textContent).toBe('765')
    expect(a.childNodes[0].childNodes[2].textContent).toBe('123')
    expect(a.childNodes[1].id).toBe('c')
    expect(a.childNodes[1].childNodes.length).toBe(1)
    expect(a.childNodes[1].childNodes[0].textContent).toBe('555')
    expect(a.childNodes[2].tagName).toBe('P')
    expect(a.childNodes[2].style.color).toBe('green')
    expect(a.childNodes[2].style.textAlign).toBe('center')
    expect(a.childNodes[2].childNodes.length).toBe(1)
    expect(a.childNodes[2].childNodes[0].textContent).toBe('I am content')
    expect(pUpdateCount).toBe(2)
    expect(aUpdateCount).toBe(7)

    a.parentNode.addEventListener('_childNodesUpdate', onPUpdate)
    a.addEventListener('_childNodesUpdate', onAUpdate)
    document.body.removeChild(a)
})

test('node: innerText/textContent/nodeValue', () => {
    const a = document.createElement('div')
    const b = document.createTextNode('haha')
    a.innerHTML = 'a<div>bc<span>de</span>f<div><span>g</span>h</div>ij</div>k'
    document.body.appendChild(a)

    let updateCount = 0
    const onUpdate = function () {
        updateCount++
    }
    a.addEventListener('_childNodesUpdate', onUpdate)

    expect(a.innerText).toBe('abcdefghijk')
    expect(a.textContent).toBe('abcdefghijk')

    a.innerText = '<div>123</div>'
    expect(a.childNodes.length).toBe(1)
    expect(a.childNodes[0]).toBeInstanceOf(TextNode)
    expect(a.innerHTML).toBe('<div>123</div>')
    expect(a.textContent).toBe('<div>123</div>')
    expect(updateCount).toBe(1)

    a.textContent = '<span>321</span>'
    expect(a.childNodes.length).toBe(1)
    expect(a.childNodes[0]).toBeInstanceOf(TextNode)
    expect(a.innerHTML).toBe('<span>321</span>')
    expect(a.innerText).toBe('<span>321</span>')
    expect(updateCount).toBe(2)

    a.appendChild(b)
    expect(b.textContent).toBe('haha')
    expect(b.nodeValue).toBe('haha')
    expect(updateCount).toBe(3)

    b.textContent = 'hehe'
    expect(b.textContent).toBe('hehe')
    expect(b.nodeValue).toBe('hehe')
    expect(updateCount).toBe(4)

    b.nodeValue = 'hoho'
    expect(b.textContent).toBe('hoho')
    expect(b.nodeValue).toBe('hoho')
    expect(updateCount).toBe(5)

    a.removeEventListener('_childNodesUpdate', onUpdate)
    document.body.removeChild(a)
})

test('node: nodeType/parentNode/nodeName', () => {
    const node = document.querySelector('.bb1')
    const parent = document.querySelector('header')
    expect(node.nodeType).toBe(Node.ELEMENT_NODE)
    expect(node.childNodes[0].nodeType).toBe(Node.TEXT_NODE)

    expect(node.parentNode).toBe(parent)

    expect(node.nodeName).toBe('DIV')
    expect(parent.nodeName).toBe('HEADER')
    expect(document.nodeName).toBe('#document')
    expect(node.childNodes[0].nodeName).toBe('#text')
    expect(document.documentElement.nodeName).toBe('HTML')
})

test('node: parentNode', () => {
    const node1 = document.querySelector('.bb1')
    const node2 = document.createElement('div')
    const node3 = document.createElement('span')
    const node4 = document.createTextNode('123')

    expect(node1.parentNode).toBe(document.querySelector('header'))
    expect(node1.childNodes[0].parentNode).toBe(node1)
    expect(node2.parentNode).toBe(null)
    expect(node3.parentNode).toBe(null)
    expect(node4.parentNode).toBe(null)

    node2.appendChild(node3)
    node2.appendChild(node4)
    expect(node2.parentNode).toBe(null)
    expect(node3.parentNode).toBe(node2)
    expect(node4.parentNode).toBe(node2)

    node3.appendChild(node4)
    expect(node2.parentNode).toBe(null)
    expect(node3.parentNode).toBe(node2)
    expect(node4.parentNode).toBe(node3)
})

test('node: style', () => {
    const node = document.querySelector('.bb1')
    expect(node.style).toBeInstanceOf(Style)
})

test('node: textContent', () => {
    const node = document.createTextNode('abc')
    expect(node.textContent).toBe('abc')
    node.textContent = 'cba'
    expect(node.textContent).toBe('cba')
    node.textContent = 123
    expect(node.textContent).toBe('123')
})

test('node: cloneNode', () => {
    const node1 = document.createElement('div')
    node1.id = 'a'
    node1.className = 'a b c'
    node1.style.display = 'block'
    node1.style.background = 'red'
    const node2 = document.createElement('article')
    const node3 = document.createElement('span')
    const node4 = document.createElement('nav')
    const node5 = document.createTextNode('123')
    const node6 = document.createTextNode('321')
    node1.appendChild(node2)
    node1.appendChild(node3)
    node1.appendChild(node5)
    node2.appendChild(node4)
    node4.appendChild(node6)

    const node7 = node1.cloneNode()
    expect(node7).not.toBe(node1)
    expect(node7._$nodeId).not.toBe(node1._$nodeId)
    expect(node7._$pageId).toBe(node1._$pageId)
    expect(node7.id).toBe(node1.id)
    expect(node7.className).toBe(node1.className)
    expect(node7.style.cssText).toBe(node1.style.cssText)
    expect(node7.childNodes.length).toBe(0)

    const node8 = node1.cloneNode(true)
    expect(node8).not.toBe(node1)
    expect(node7._$nodeId).not.toBe(node1._$nodeId)
    expect(node7._$pageId).toBe(node1._$pageId)
    expect(node8.id).toBe(node1.id)
    expect(node8.className).toBe(node1.className)
    expect(node8.style.cssText).toBe(node1.style.cssText)
    expect(node8.childNodes.length).toBe(node1.childNodes.length)
    expect(node8.childNodes[0]).not.toBe(node1.childNodes[0])
    expect(node8.childNodes[0].tagName).toBe(node1.childNodes[0].tagName)
    expect(node8.childNodes[0].childNodes.length).toBe(node1.childNodes[0].childNodes.length)
    expect(node8.childNodes[0].childNodes[0]).not.toBe(node1.childNodes[0].childNodes[0])
    expect(node8.childNodes[0].childNodes[0].tagName).toBe(node1.childNodes[0].childNodes[0].tagName)
    expect(node8.childNodes[0].childNodes[0].childNodes.length).toBe(node1.childNodes[0].childNodes[0].childNodes.length)
    expect(node8.childNodes[0].childNodes[0].childNodes[0]).not.toBe(node1.childNodes[0].childNodes[0].childNodes[0])
    expect(node8.childNodes[0].childNodes[0].childNodes[0].textContent).toBe(node1.childNodes[0].childNodes[0].childNodes[0].textContent)
    expect(node8.childNodes[1]).not.toBe(node1.childNodes[1])
    expect(node8.childNodes[1].tagName).toBe(node1.childNodes[1].tagName)
    expect(node8.childNodes[2]).not.toBe(node1.childNodes[2])
    expect(node8.childNodes[2].textContent).toBe(node1.childNodes[2].textContent)
    
    const node9 = document.createTextNode('abc')
    const node10 = node9.cloneNode()
    expect(node10).not.toBe(node9)
    expect(node10._$nodeId).not.toBe(node9._$nodeId)
    expect(node10._$pageId).toBe(node9._$pageId)
    expect(node10.textContent).toBe(node9.textContent)
    expect(node10.nodeType).toBe(Node.TEXT_NODE)
})

test('node: appendChild/removeChild/insertBefore/replaceChild', () => {
    const p = document.createElement('div')
    document.body.appendChild(p)
    expect(p.childNodes).toEqual([])

    let updateCount = 0
    const onUpdate = function () {
        updateCount++
    }
    p.addEventListener('_childNodesUpdate', onUpdate)

    const a = document.createElement('div')
    const b = document.createTextNode('123')
    const c = document.createElement('div')
    const d = document.createElement('div')
    d.id = 'abc'
    c.appendChild(d)
    a.appendChild(c)
    p.appendChild(p) // 插入自己，不做任何改变
    expect(c.parentNode).toBe(a)
    const appendRes1 = p.appendChild(c)
    const appendRes2 = p.appendChild(b)
    const appendRes3 = p.appendChild(a)
    const appendRes4 = p.appendChild(b) // 先从父节点删除，再添加，会触发两次 _childNodesUpdate
    expect(p.childNodes).toEqual([c, a, b])
    expect(appendRes1).toBe(p)
    expect(appendRes2).toBe(p)
    expect(appendRes3).toBe(p)
    expect(appendRes4).toBe(p)
    expect(a.parentNode).toBe(p)
    expect(b.parentNode).toBe(p)
    expect(c.parentNode).toBe(p)
    expect(p.parentNode).toBe(document.body)
    expect(cache.getNode(pageId, a._$nodeId)).toBe(a)
    expect(cache.getNode(pageId, b._$nodeId)).toBe(b)
    expect(cache.getNode(pageId, c._$nodeId)).toBe(c)
    expect(cache.getNode(pageId, d._$nodeId)).toBe(d)
    expect(document.getElementById('abc')).toBe(d)
    expect(updateCount).toBe(5)

    p.removeChild(d) // 删除非子节点，不做任何反应
    p.removeChild(p) // 删除自己，不做任何反应
    expect(p.childNodes).toEqual([c, a, b])
    const removeRes1 = p.removeChild(a)
    expect(p.childNodes).toEqual([c, b])
    const removeRes2 = p.removeChild(b)
    expect(p.childNodes).toEqual([c])
    const removeRes3 = p.removeChild(c)
    expect(p.childNodes.length).toEqual(0)
    expect(removeRes1).toBe(a)
    expect(removeRes2).toBe(b)
    expect(removeRes3).toBe(c)
    expect(cache.getNode(pageId, a._$nodeId)).toBe(null)
    expect(cache.getNode(pageId, b._$nodeId)).toBe(null)
    expect(cache.getNode(pageId, c._$nodeId)).toBe(null)
    expect(cache.getNode(pageId, d._$nodeId)).toBe(null)
    expect(document.getElementById('abc')).toBe(null)
    expect(updateCount).toBe(8)

    const insertRes1 = p.insertBefore(a)
    expect(p.childNodes).toEqual([a])
    const insertRes2 = p.insertBefore(b, a)
    expect(p.childNodes).toEqual([b, a])
    const insertRes3 = p.insertBefore(c)
    expect(p.childNodes).toEqual([b, a, c])
    const insertRes4 = p.insertBefore(b, c) // 先从父节点删除，再添加，会触发两次 _childNodesUpdate
    expect(p.childNodes).toEqual([a, b, c])
    p.insertBefore(p, c) // 插入自己，不做任何改变
    expect(p.childNodes).toEqual([a, b, c])
    expect(insertRes1).toBe(a)
    expect(insertRes2).toBe(b)
    expect(insertRes3).toBe(c)
    expect(insertRes4).toBe(b)
    expect(cache.getNode(pageId, a._$nodeId)).toBe(a)
    expect(cache.getNode(pageId, b._$nodeId)).toBe(b)
    expect(cache.getNode(pageId, c._$nodeId)).toBe(c)
    expect(cache.getNode(pageId, d._$nodeId)).toBe(d)
    expect(document.getElementById('abc')).toBe(d)
    expect(updateCount).toBe(13)

    const e = document.createElement('span')
    const replaceRes1 = p.replaceChild(e, b)
    expect(p.childNodes).toEqual([a, e, c])
    const replaceRes2 = p.replaceChild(e, c) // 先从父节点删除，再添加，会触发两次 _childNodesUpdate
    expect(p.childNodes).toEqual([a, e])
    expect(cache.getNode(pageId, d._$nodeId)).toBe(null)
    expect(document.getElementById('abc')).toBe(null)
    const replaceRes3 = p.replaceChild(c, a)
    expect(p.childNodes).toEqual([c, e])
    p.replaceChild(p, a) // 插入自己，不做任何改变
    expect(p.childNodes).toEqual([c, e])
    expect(replaceRes1).toBe(b)
    expect(replaceRes2).toBe(c)
    expect(replaceRes3).toBe(a)
    expect(cache.getNode(pageId, a._$nodeId)).toBe(null)
    expect(cache.getNode(pageId, b._$nodeId)).toBe(null)
    expect(cache.getNode(pageId, c._$nodeId)).toBe(c)
    expect(cache.getNode(pageId, e._$nodeId)).toBe(e)
    expect(cache.getNode(pageId, d._$nodeId)).toBe(d)
    expect(document.getElementById('abc')).toBe(d)
    expect(updateCount).toBe(17)

    p.removeEventListener('_childNodesUpdate', onUpdate)
    document.body.removeChild(p)
})

test('node: getElementsByTagName', () => {
    const a = document.querySelector('footer')
    const nodes = a.getElementsByTagName('span')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')

    expect(document.getElementsByTagName('header').length).toBe(1)
    expect(a.getElementsByTagName('header').length).toBe(0)
})

test('node: getElementsByClassName', () => {
    const a = document.querySelector('footer')
    const nodes = a.getElementsByClassName('bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')

    expect(document.getElementsByClassName('bb1').length).toBe(1)
    expect(a.getElementsByClassName('bb1').length).toBe(0)
})

test('node: querySelector', () => {
    const a = document.querySelector('.aa')
    const node1 = a.querySelector('#bb')
    expect(node1).toBeInstanceOf(Element)
    expect(node1.tagName).toBe('DIV')
    expect(node1.id).toBe('bb')

    const node2 = a.querySelector('#bb .bb4')
    expect(node2).toBeInstanceOf(Element)
    expect(node2.tagName).toBe('SPAN')
    expect(node2.id).toBe('bb4')

    expect(a.querySelector('#aa')).toBe(null)
})

test('node: querySelectorAll', () => {
    const a = document.querySelector('.aa')
    const nodes = a.querySelectorAll('#bb .bb4')
    expect(nodes.length).toBe(3)
    expect(nodes[0]).toBeInstanceOf(Element)
    expect(nodes[0].tagName).toBe('SPAN')
    expect(nodes[0].id).toBe('bb4')
    expect(nodes[1]).toBeInstanceOf(Element)
    expect(nodes[1].tagName).toBe('SPAN')
    expect(nodes[2]).toBeInstanceOf(Element)
    expect(nodes[2].tagName).toBe('SPAN')

    expect(a.querySelectorAll('#aa').length).toBe(0)
})

test('node: attributes/setAttribute/getAttribute/hasAttribute/removeAttribute', () => {
    const a = document.createElement('div')
    document.body.appendChild(a)
    const attributes = a.attributes

    let updateCount = 0
    const onUpdate = function () {
        updateCount++
    }
    a.parentNode.addEventListener('_childNodesUpdate', onUpdate)

    expect(a.getAttribute('id')).toBe('')
    expect(a.getAttribute('class')).toBe('')
    expect(a.getAttribute('style')).toBe('')
    expect(a.getAttribute('src')).toBe('')
    expect(a.hasAttribute('id')).toBe(false)
    expect(a.hasAttribute('class')).toBe(false)
    expect(a.hasAttribute('style')).toBe(false)
    expect(a.hasAttribute('src')).toBe(false)
    expect(attributes).toEqual([])
    expect(attributes.id).toBe(undefined)
    expect(attributes.class).toBe(undefined)
    expect(attributes.style).toBe(undefined)
    expect(attributes.src).toBe(undefined)
    expect(updateCount).toBe(0)

    a.id = 'abc'
    a.className = 'a b'
    a.style.display = 'block'
    a.src = 'javascript: void(0);'
    expect(a.getAttribute('id')).toBe('abc')
    expect(a.getAttribute('class')).toBe('a b')
    expect(a.getAttribute('style')).toBe('display:block;')
    expect(a.getAttribute('src')).toBe('javascript: void(0);')
    expect(a.hasAttribute('id')).toBe(true)
    expect(a.hasAttribute('class')).toBe(true)
    expect(a.hasAttribute('style')).toBe(true)
    expect(a.hasAttribute('src')).toBe(true)
    expect(attributes.length).toBe(4)
    expect(attributes.id).toBe(attributes[1])
    expect(attributes.id).toEqual({name: 'id', value: 'abc'})
    expect(attributes.class).toBe(attributes[2])
    expect(attributes.class).toEqual({name: 'class', value: 'a b'})
    expect(attributes.style).toBe(attributes[3])
    expect(attributes.style).toEqual({name: 'style', value: 'display:block;'})
    expect(attributes.src).toBe(attributes[0])
    expect(attributes.src).toEqual({name: 'src', value: 'javascript: void(0);'})
    expect(updateCount).toBe(4)

    a.setAttribute('id', 'cba')
    a.setAttribute('class', 'c b a')
    a.setAttribute('style', 'display:inline;')
    a.setAttribute('src', 'moc.haha.www')
    expect(a.id).toBe('cba')
    expect(a.className).toBe('c b a')
    expect(a.style.cssText).toBe('display:inline;')
    expect(a.src).toBe('moc.haha.www')
    expect(a.hasAttribute('id')).toBe(true)
    expect(a.hasAttribute('class')).toBe(true)
    expect(a.hasAttribute('style')).toBe(true)
    expect(a.hasAttribute('src')).toBe(true)
    expect(attributes.length).toEqual(4)
    expect(attributes.id).toBe(attributes[1])
    expect(attributes.id).toEqual({name: 'id', value: 'cba'})
    expect(attributes.class).toBe(attributes[2])
    expect(attributes.class).toEqual({name: 'class', value: 'c b a'})
    expect(attributes.style).toBe(attributes[3])
    expect(attributes.style).toEqual({name: 'style', value: 'display:inline;'})
    expect(attributes.src).toBe(attributes[0])
    expect(attributes.src).toEqual({name: 'src', value: 'moc.haha.www'})
    expect(updateCount).toBe(8)

    a.removeAttribute('id')
    a.removeAttribute('class')
    a.removeAttribute('style')
    a.removeAttribute('src')
    expect(a.id).toBe('')
    expect(a.className).toBe('')
    expect(a.style.cssText).toBe('')
    expect(a.src).toBe('')
    expect(a.getAttribute('id')).toBe('')
    expect(a.getAttribute('class')).toBe('')
    expect(a.getAttribute('style')).toBe('')
    expect(a.getAttribute('src')).toBe('')
    expect(a.hasAttribute('id')).toBe(false)
    expect(a.hasAttribute('class')).toBe(false)
    expect(a.hasAttribute('style')).toBe(false)
    expect(a.hasAttribute('src')).toBe(false)
    expect(attributes).toEqual([])
    expect(attributes.id).toBe(undefined)
    expect(attributes.class).toBe(undefined)
    expect(attributes.style).toBe(undefined)
    expect(attributes.src).toBe(undefined)
    expect(updateCount).toBe(12)

    a.parentNode.removeEventListener('_childNodesUpdate', onUpdate)
    document.body.removeChild(a)
})

test('node: getBoundingClientRect/clientWidth/clientHeight', async () => {
    const node1 = document.getElementById('bb')
    const node2 = document.querySelector('footer')

    // 设置测试数据
    mock.setSelectorQueryRes([{
        left: 5,
        width: 12,
        height: 32,
        dataset: {
            privateNodeId: node1._$nodeId,
            privatePageId: pageId,
        },
        }, {
        top: 10,
        dataset: {
            privateNodeId: node2._$nodeId,
            privatePageId: pageId,
        },
    }])

    await window._$fetchWebviewInfo() // 拉取相关信息
    expect(node1.getBoundingClientRect().left).toBe(5)
    expect(node1.getBoundingClientRect().top).toBe(undefined)
    expect(node2.getBoundingClientRect().top).toBe(10)
    expect(node2.getBoundingClientRect().left).toBe(undefined)
    expect(node1.clientWidth).toBe(12)
    expect(node1.clientHeight).toBe(32)
    expect(node2.clientWidth).toBe(0)
    expect(node2.clientHeight).toBe(0)

    // 设置测试数据
    mock.setSelectorQueryRes([{
        left: 15,
        dataset: {
            privateNodeId: node1._$nodeId,
            privatePageId: pageId,
        },
        }, {
        top: 30,
        dataset: {
            privateNodeId: node2._$nodeId,
            privatePageId: pageId,
        },
    }])

    await window._$fetchWebviewInfo() // 拉取相关信息
    expect(node1.getBoundingClientRect().left).toBe(15)
    expect(node1.getBoundingClientRect().top).toBe(undefined)
    expect(node2.getBoundingClientRect().top).toBe(30)
    expect(node2.getBoundingClientRect().left).toBe(undefined)
})

test('node: previousSibling/previousElementSibling', () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    const c = document.createTextNode('haha')
    const d = document.createElement('div')

    a.appendChild(b)
    a.appendChild(c)
    a.appendChild(d)

    expect(b.previousSibling).toBe(null)
    expect(b.previousElementSibling).toBe(null)
    expect(c.previousSibling).toBe(b)
    expect(c.previousElementSibling).toBe(b)
    expect(d.previousSibling).toBe(c)
    expect(d.previousElementSibling).toBe(b)
})
