const path = require('path')

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
    const dirPath = path.dirname(entry)
    const adjustConfig = {entryKey, ...config}

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
          // 绝对路径或者网络 url
          // TODO
        }

        if (linkContent) {
          // 写入 common 目录
          const extname = path.extname(cssPath)
          const filename = `${path.basename(cssPath, extname)}-${_.hash(linkContent)}.wxss`

          await _.writeFile(path.join(commonOutput, filename), adjust(linkContent, adjustConfig))
          content.push(`/* link style: ${css.src} */\n@import "../../common/wxss/${filename}";`)
        }
      }
    }

    content = content.join('\n\n')

    // 输出到 output 中
    await _.writeFile(output, adjust(content, adjustConfig))
  }
}
