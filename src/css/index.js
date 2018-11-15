const path = require('path')

const request = require('request-promise-native')

const _ = require('../utils')
const adjust = require('./adjust')

module.exports = {
  /**
   * 生成样式
   */
  async generate(options) {
    const entry = options.entry
    const output = options.output
    const commonOutput = options.commonOutput
    const cssList = options.cssList
    const config = options.config
    const entryKey = options.entryKey
    const needCompress = !!options.compress.cssInH5
    const proxy = options.proxy
    const dirPath = path.dirname(entry)
    const adjustConfig = {entryKey, needCompress, ...config}

    let content = [
      '/* original user agent stylesheet */\n@import "../../common/wxss/original.wxss";'
    ]

    // 遍历页面中的静态 css
    for (const css of cssList) {
      if (css.type === 'inner') {
        content.push(`/* style tag */\n${css.content}`)
      } else if (css.type === 'outer') {
        let cssPath = css.src
        let linkContent

        if (_.isRelative(cssPath)) {
          // 相对路径
          cssPath = path.join(dirPath, cssPath)
          linkContent = await _.readFile(cssPath)
        } else {
          // 其他
          const isFileExists = await _.checkFileExists(cssPath)

          if (isFileExists) {
            // 绝对路径
            linkContent = await _.readFile(cssPath)
          } else {
            // 网络 url
            linkContent = await request.get({url: cssPath, proxy})
          }
        }

        if (linkContent) {
          // 写入 common 目录
          const extname = path.extname(cssPath)
          const filename = `${path.basename(cssPath, extname)}-${_.hash(linkContent)}.wxss`
          const adjustContent = await adjust(linkContent, adjustConfig)

          await _.writeFile(path.join(commonOutput, filename), adjustContent)
          content.push(`/* link style: ${css.src} */\n@import "../../common/wxss/${filename}";`)
        }
      }
    }

    content = content.join('\n\n')

    // 输出到 output 中
    const adjustContent = await adjust(content, adjustConfig)
    await _.writeFile(output, adjustContent)
  }
}
