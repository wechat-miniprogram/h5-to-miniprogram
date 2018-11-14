const adjust = require('../../src/js/adjust')

test('adjust js content: replace global var', async () => {
    const res = await adjust('a = function(b, c) {d(); setTimeout(() => {}, 0); e = new Date();}')
    expect(res).toBe('window[\'a\'] = function (b, c) {\n  window[\'d\']();\n  setTimeout(() => {}, 0);\n  window[\'e\'] = new Date();\n};')
})

test('adjust js content: global function declaration', async () => {
    const res = await adjust('function aa(a, b) {return a;}')
    expect(res).toBe('function aa(a, b) {\n  return a;\n}\n\nwindow[\'aa\'] = aa;')
})

test('adjust js content: global function declaration expression', async () => {
    const res = await adjust('var bb = function aa(a, b) {return a;}')
    expect(res).toBe('var bb = function aa(a, b) {\n  return a;\n};\n\nwindow[\'aa\'] = aa;')
})

test('adjust js content: remove comment', async () => {
    const res = await adjust('var a = /* a */ 12; // a\n/* a\na\na\n */\n// a\nvar b = 21;')
    expect(res).toBe('var a = 12;\nvar b = 21;')
})
