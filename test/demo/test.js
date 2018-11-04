const path = require('path')
const rimraf = require('rimraf')

const toMiniprogram = require('../../index')

rimraf.sync(path.join(__dirname, './output/common'))
toMiniprogram({
  // 入口
  entry: {
    demo1: path.join(__dirname, './demo1/index.html'),
    demo2: path.join(__dirname, './demo2/index.html'),
    demo3: path.join(__dirname, './demo3/index.html'),
    demo4: path.join(__dirname, './demo4/index.html'),
    demo5: path.join(__dirname, './demo5/index.html'), // canvas
    // demo6: path.join(__dirname, './demo6/index.html'),
    demo7: path.join(__dirname, './demo7/index.html'), // webpack + vue
    demo8: path.join(__dirname, './demo8/index.html'), // webpack + react
  },
  // 输出目录
  output: path.join(__dirname, './output'),
  // 相关配置文件
  config: path.join(__dirname, './config.js'),
  // 扩展实现文件
  extend: [path.join(__dirname, './extend1.js'), path.join(__dirname, './extend2.js')],
}).then(res => {
  console.log('done')
}).catch(err => {
  console.error(err)
})
