const _ = require('./utils')
const config = require('./config')

module.exports = {
  /**
   * 生成配置
   */
  async generate(options) {
    const output = options.output
    const content = JSON.stringify({
      usingComponents: {
        body: '../../components/element/element',
      }
    }, null, config.indent.length)

    // 输出到 output 中
    await _.writeFile(output, content)
  }
}
