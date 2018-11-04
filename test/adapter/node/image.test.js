const mock = require('../../mock')
const load = require('../../../src/template/adapter')
const html = require('../../../src/html')

const Window = load('Window')
const Document = load('Document')
const cache = load('cache')
const tool = load('tool')

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

test('image', async () => {
    let isSuccess = false
    global.wx.getImageInfo = function(options) {
        setTimeout(() => {
            if (isSuccess) {
                options.success({
                    width: 100,
                    height: 88,
                })
            } else {
                options.fail()
            }
        }, 10)
    }

    const Image = window.Image

    // 带宽高
    const image1 = new Image(50, 60)
    let image1Count = 0
    let expectImage1Count = 0
    image1.onload = function() {
        expect(image1.width).toBe(50)
        expect(image1.height).toBe(60)
        expect(image1.naturalWidth).toBe(100)
        expect(image1.naturalHeight).toBe(88)
        expect(image1.src).toBe('https://c.b.a')
        expect(image1Count).toBe(expectImage1Count)
    }
    image1.onerror = function() {
        expect(image1.width).toBe(50)
        expect(image1.height).toBe(60)
        expect(image1.naturalWidth).toBe(0)
        expect(image1.naturalHeight).toBe(0)
        expect(image1.src).toBe('https://a.b.c')
        expect(image1Count).toBe(expectImage1Count)
    }
    expect(image1.width).toBe(50)
    expect(image1.height).toBe(60)
    expect(image1.naturalWidth).toBe(0)
    expect(image1.naturalHeight).toBe(0)
    expect(image1.src).toBe('')
    image1Count++
    expectImage1Count = 1
    image1.src = 'https://a.b.c'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })
    isSuccess = true // 下一次请求为成功
    image1Count++
    expectImage1Count = 2
    image1.src = 'https://c.b.a'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })
    image1Count++
    expectImage1Count = 3
    image1.src = 'https://c.b.a'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })

    // 不带宽高
    isSuccess = false
    const image2 = new Image()
    let image2Count = 0
    let expectImage2Count = 0
    image2.onload = function() {
        expect(image2.width).toBe(100)
        expect(image2.height).toBe(88)
        expect(image2.naturalWidth).toBe(100)
        expect(image2.naturalHeight).toBe(88)
        expect(image2.src).toBe('https://f.e.d')
        expect(image2Count).toBe(expectImage2Count)
    }
    image2.onerror = function() {
        expect(image2.width).toBe(0)
        expect(image2.height).toBe(0)
        expect(image2.naturalWidth).toBe(0)
        expect(image2.naturalHeight).toBe(0)
        expect(image2.src).toBe('https://d.e.f')
        expect(image2Count).toBe(expectImage2Count)
    }
    expect(image2.width).toBe(0)
    expect(image2.height).toBe(0)
    expect(image2.naturalWidth).toBe(0)
    expect(image2.naturalHeight).toBe(0)
    expect(image2.src).toBe('')
    image2Count++
    expectImage2Count = 1
    image2.src = 'https://d.e.f'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })
    isSuccess = true // 下一次请求为成功
    image2Count++
    expectImage2Count = 2
    image2.src = 'https://f.e.d'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })
    image2Count++
    expectImage2Count = 3
    image2.src = 'https://f.e.d'
    await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 20)
    })
})
