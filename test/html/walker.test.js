const mock = require('../mock')
const walker = require('../../src/html/walker')
const load = require('../../src/template/adapter')

const parser = load('parser')

test('walk html ast', () => {
  const parsed = parser.parse(mock.html)
  const res = walker.walk(parsed[0])

  expect(res.title).toBe('test')
  expect(res.style).toEqual([
    {src: './css/a.css', type: 'outer'},
    {src: './css/b.css', type: 'outer'},
    {content: '.a {\n                        color: green;\n                    }', type: 'inner'}
  ])
  expect(res.script).toEqual([
    {src: './js/a.js', type: 'outer'},
    {src: './js/b.js', type: 'outer'},
    {content: 'console.log(\'hello\');', type: 'inner'}
  ])
  expect(res.body.tagName).toBe('body')
})
