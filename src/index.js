const path = require('path')

const _ = require('./utils')
const template = require('./template')
const html = require('./html')
const css = require('./css')
const js = require('./js')
const json = require('./json')

module.exports = async function (options) {
  const configPath = options.config
  const extendPath = options.extend
  let entry = options.entry || {}
  const output = options.output || path.join(process.pwd(), './h5_to_miniprogram_output')
  const compress = options.compress === true ? {
    jsInH5: true,
    cssInH5: true,
  } : (options.compress || {})
  const proxy = options.proxy

  let config = {}
  let indexEntry = '' // 首页

  // 载入配置
  try {
    // eslint-disable-next-line import/no-dynamic-require
    config = require(configPath)
    indexEntry = config.index
  } catch (err) {
    // ignore
  }

  // 参数调整
  if (typeof entry === 'string') entry = {index: entry}

  // 创建 output
  await _.recursiveMkdir(output)

  // 调整首页顺序
  const entryKeys = Object.keys(entry)
  const index = entryKeys.indexOf(indexEntry)

  if (index >= 0) {
    entryKeys.splice(index, 1)
    entryKeys.unshift(indexEntry)
  }

  // 遍历所有页面
  for (const entryKey of entryKeys) {
    const entryPath = entry[entryKey]

    // 检查 entry
    if (!entryPath || typeof entryPath !== 'string') {
      throw new Error('entry path must be a string')
    }

    const isEntryExists = await _.checkFileExists(entryPath)
    if (!isEntryExists) {
      throw new Error('entry path is not a valid path')
    }

    // 读取并解析 entry
    const entryHtml = await _.readFile(entryPath)
    const entryInfo = await html.parse(entryHtml)

    // 生成页面
    await html.generate({
      output: path.join(output, `./pages/${entryKey}/${entryKey}.wxml`),
      body: entryInfo.body,
    })

    // 生成样式
    await css.generate({
      entry: entryPath,
      output: path.join(output, `./pages/${entryKey}/${entryKey}.wxss`),
      commonOutput: path.join(output, './common/wxss'),
      cssList: entryInfo.style,
      config,
      entryKey,
      compress,
      proxy,
    })

    // 生成脚本
    await js.generate({
      entry: entryPath,
      output: path.join(output, `./pages/${entryKey}/${entryKey}.js`),
      commonOutput: path.join(output, './common/js'),
      jsList: entryInfo.script,
      body: entryInfo.body,
      entryKey,
      compress,
      proxy,
    })

    // 生成配置
    await json.generate({
      output: path.join(output, `./pages/${entryKey}/${entryKey}.json`),
    })
  }

  // 生成其他文件
  await template.generate({
    output,
    entryKeys,
    configPath,
    extendPath,
    compress,
  })
}
