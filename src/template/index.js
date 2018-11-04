const path = require('path')

const _ = require('../utils')
const config = require('../config')
const load = require('../template/adapter')
const ignoreGlobalVar = require('../js/ignore-global-var')
const ignoreRewritelVar = require('../js/ignore-rewrite-var')

const tagMap = load('tagMap')

const fileList = [
  'adapter',
  'components',
  'common',

  'app.js',
  'app.wxss'
]

module.exports = {
  /**
   * 生成项目
   */
  async generate(options) {
    const output = options.output
    const entryKeys = options.entryKeys
    const configPath = options.configPath
    const extendPath = options.extendPath

    // 拷贝模板
    for (const fileName of fileList) {
      const filePath = path.join(__dirname, fileName)
      const distPath = path.join(output, fileName)

      const isDir = await _.isDirectory(filePath)

      if (isDir) {
        await _.copyDirectory(filePath, distPath)
      } else {
        await _.copyFile(filePath, distPath)
      }
    }

    // 写入 element.json 和 element.wxml
    const usingComponents = {
      'plain-text': '../plain-text/plain-text',
    }
    const elementWxmlTmpl = await _.readFile(path.join(__dirname, './element.wxml.tmpl'))
    const insertElement = []

    Object.keys(tagMap).forEach(tagName => {
      const compName = tagMap[tagName]
      if (compName && !usingComponents[compName]) {
        usingComponents[compName] = '../element/element'

        const compTmpl = [
          `<${compName}`,
          `wx:elif="{{item.compName === '${compName}'}}"`,
          'data-private-node-id="{{item.nodeId}}"',
          'data-private-page-id="{{item.pageId}}"',
          'id="{{item.id}}"',
          'class="{{item.class || \'\'}}"',
          'style="{{item.style || \'\'}}"',
          'bindtouchstart="onTouchStart"',
          'bindtouchmove="onTouchMove"',
          'bindtouchend="onTouchEnd"',
          'bindtouchcancel="onTouchCancel"',
          '/>'
        ]
        insertElement.push(compTmpl.filter(item => !!item).join(' '))
      }
    })

    // element.json
    await _.writeFile(path.join(output, './components/element/element.json'), JSON.stringify({
      component: true,
      usingComponents
    }, null, config.indent))

    // element.wxml
    await _.writeFile(path.join(output, './components/element/element.wxml'), elementWxmlTmpl.replace('{{DATA}}', insertElement.join(`\n${config.indent}`)))

    // app.json
    const pages = entryKeys.map(entryKey => `pages/${entryKey}/${entryKey}`)
    pages.push('common/pages/default/default') // 默认页面

    await _.writeFile(path.join(output, './app.json'), JSON.stringify({
      pages,
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '',
        navigationBarTextStyle: 'black'
      }
    }, null, config.indent))

    // project.config.json
    await _.writeFile(path.join(output, './project.config.json'), JSON.stringify({
      description: '项目配置文件。',
      packOptions: {
        ignore: []
      },
      setting: {
        urlCheck: false,
        es6: true,
        postcss: true,
        minified: true,
        newFeature: true,
        nodeModules: false
      },
      compileType: 'miniprogram',
      libVersion: '2.3.1',
      appid: '',
      projectname: 'miniprogram-project',
      isGameTourist: false,
      condition: {
        search: {
          current: -1,
          list: []
        },
        conversation: {
          current: -1,
          list: []
        },
        game: {
          current: -1,
          list: []
        },
        miniprogram: {
          current: -1,
          list: entryKeys.map((entryKey, index) => ({
            id: index + 1,
            name: entryKey,
            pathName: `pages/${entryKey}/${entryKey}`,
            query: '',
          }))
        }
      }
    }, null, config.indent))

    // common/js/init-global-var.js
    const needRewriteVar = ignoreGlobalVar.filter(name => ignoreRewritelVar.indexOf(name) < 0)
    const initGlobalCode = needRewriteVar.map(name => `try{window['${name}'] = ${name};}catch(err){console.log('${name} not suporrt');}`).join('')
    await _.writeFile(path.join(output, './common/js/init-global-var.js'), `module.exports = function(window, document) {${initGlobalCode}};`)

    // 相关配置
    if (typeof configPath === 'string') {
      const isConfigExists = await _.checkFileExists(configPath)
      if (isConfigExists) {
        await _.copyFile(configPath, path.join(output, './config.js'))
      }
    }

    // 扩展实现
    const extendList = []
    let extendPathList = extendPath

    if (!Array.isArray(extendPath)) extendPathList = [extendPath]
    for (let item of extendPathList) {
      if (typeof item === 'string') {
        const isExtendExists = await _.checkFileExists(item)
        if (isExtendExists) {
          item = await _.readFile(item)

          extendList.push(`function(module) {\n\n${item}\n\nreturn module.exports;}`)
        }
      }
    }

    if (extendList.length) {
      const extendContent = extendList.join(', ')
      await _.writeFile(path.join(output, './extend.js'), `module.exports = function(loadModule, moduleName) {[${extendContent}].forEach(function(extend) {const ret = extend({exports: {}});typeof ret === 'function' && ret(loadModule, moduleName);});}`)
    }
  }
}
