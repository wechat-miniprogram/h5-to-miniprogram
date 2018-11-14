const path = require('path')
const rimraf = require('rimraf')

const toMiniprogram = require('../../index')

rimraf.sync(path.join(__dirname, './output/common'))
toMiniprogram({
  // 入口
  entry: {
    demo01: path.join(__dirname, './demo01/index.html'),
    demo02: path.join(__dirname, './demo02/index.html'), // jquery + 表单 + 异步请求
    demo03: path.join(__dirname, './demo03/index.html'),
    // demo04: path.join(__dirname, './demo04/index.html'), // jquery
    // demo05: path.join(__dirname, './demo05/index.html'), // canvas
    // demo06: path.join(__dirname, './demo06/index.html'),
    // demo07: path.join(__dirname, './demo07/index.html'), // webpack + vue
    // demo08: path.join(__dirname, './demo08/index.html'), // webpack + react
    demo09: path.join(__dirname, './demo09/index.html'), // webpack + vue + vue-router(hash)
    demo10: path.join(__dirname, './demo10/index.html'), // webpack + vue + vue-router(history)
    demo11: path.join(__dirname, './demo11/index.html'), // webpack + react + react-router(hash)
    demo12: path.join(__dirname, './demo12/index.html'), // webpack + react + react-router(history)
  },
  // 输出目录
  output: path.join(__dirname, './output'),
  // 相关配置文件
  config: path.join(__dirname, './config.js'),
  // 扩展实现文件
  extend: [path.join(__dirname, './extend1.js'), path.join(__dirname, './extend2.js')],
  // 压缩配置
  compress: {
    jsInH5: true, // 原 h5 页面中的 js
    cssInH5: true, // 原 h5 页面中的 css
  },
}).then(res => {
  console.log('done')
}).catch(err => {
  console.error(err)
})
