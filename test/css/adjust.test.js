const adjust = require('../../src/css/adjust')

test('adjust css content: normal tagname', () => {
    const res = adjust('a, p {width:12px;} #id {height: 100%;}')
    expect(res).toBe('a, p {  width:12px;}#id {  height: 100%;}')
})

test('adjust css content: map tagname', () => {
    const res = adjust('a, p > video {width:12px;}')
    expect(res).toBe('a, p > h5-video {  width:12px;}')
})

test('adjust css content: html tagname', () => {
    const res = adjust('a, html, p {width:12px;}')
    expect(res).toBe('a, page, p {  width:12px;}')
})

test('adjust css content: * tagname', () => {
    const res = adjust('* {background:url(http://a.do);}')
    expect(res).toBe('a, abbr, address, area, article, aside, h5-audio, b, base, bdi, bdo, blockquote, body, br, h5-button, h5-canvas, caption, cite, code, col, colgroup, data, datalist, dd, del, dfn, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, h5-form, h1, h2, h3, h4, h5, h6, header, hr, i, iframe, img, h5-input, ins, kbd, keygen, label, legend, li, main, map, mark, meter, nav, noscript, object, ol, optgroup, option, output, p, param, pre, progress, q, rb, rp, rt, rtc, ruby, s, samp, section, select, small, source, span, strong, sub, sup, table, tbody, td, textarea, tfoot, th, thead, time, tr, track, u, ul, var, h5-video, wbr, html, page {  background:url(\"http://a.do\");}')
})

test('adjust css content: resFilter', () => {
    let count = 0
    const res3 = adjust('#test-image {background: url(\'http://a.b.c/0\');background: url("http://a.b.c/1");background: url(http://a.b.c/2);background-image: url(\'http://a.b.c/3\');background-image: url("http://a.b.c/4");background-image: url(http://a.b.c/5);src: url(\'http://a.b.c/6\');src: url("http://a.b.c/7");src: url(http://a.b.c/8);other: url(\'http://a.b.c/9\');other: url("http://a.b.c/10");other: url(http://a.b.c/11);}', {
        resFilter(src, entry) {
            expect(src).toBe(`http://a.b.c/${count++}`)
            expect(entry).toBe('xxx')

            return src.replace('a.b', 'b.a')
        },
        entryKey: 'xxx',
    })
    expect(count).toBe(9)
    expect(res3).toBe('#test-image {  background: url("http://b.a.c/0");  background: url("http://b.a.c/1");  background: url("http://b.a.c/2");  background-image: url("http://b.a.c/3");  background-image: url("http://b.a.c/4");  background-image: url("http://b.a.c/5");  src: url("http://b.a.c/6");  src: url("http://b.a.c/7");  src: url("http://b.a.c/8");  other: url(\'http://a.b.c/9\');  other: url("http://a.b.c/10");  other: url(http://a.b.c/11);}')
})

test('adjust css content: rem', () => {
    const res = adjust('#a {width: 10rem;height: 5rem;}', {
        rem: 25,
    })
    expect(res).toBe('#a {  width: 13.333rem;  height: 6.667rem;}')
})
