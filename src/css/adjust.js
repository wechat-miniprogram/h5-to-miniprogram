/**
 * 调整 css
 */

const postcss = require('postcss')
const cssnano = require('cssnano')

const load = require('../template/adapter')
const config = require('../config')

const tagMap = load('tagMap')
const tool = load('tool')

const tagList = Object.keys(tagMap)
const replaceRegexp = new RegExp(`(\\W|\\b)(${tagList.join('|')})(\\W|\\b)`, 'ig')
const prefixRegexp = /[a-zA-Z0-9.#_-]/
const suffixRegexp = /[a-zA-Z0-9_-]/
const indentSpaceRegexp = /[ ]*$/

/**
 * 替换标签名
 */
const replaceTagNamePlugin = postcss.plugin('replaceTagName', () => root => {
  root.walk(child => {
    if (child.type === 'rule') {
      const selectors = []

      child.selectors.forEach(selector => {
        // 处理标签名选择器
        selector = selector.replace(replaceRegexp, (all, $1, tagName, $2) => {
          if (prefixRegexp.test($1) || suffixRegexp.test($2)) {
            // 非标签选择器
            return all
          }

          tagName = tagName.toLowerCase()
          const compName = tagMap[tagName]

          if (tagName === 'html') {
            // 页面单独处理
            return `${$1}page${$2}`
          } else if (compName && compName !== 'element') {
            // 使用组件名的节点
            return `${$1}${compName}${$2}`
          } else {
            // 其他用原本的标签名
            return `${$1}${tagName}${$2}`
          }
        })

        // 处理 * 号选择器
        selector = selector.replace(/(.*)\*(.*)/g, (all, $1, $2) => {
          tagList.forEach(tagName => {
            const compName = tagMap[tagName]

            if (!compName) return
            if (compName !== 'element') {
              selectors.push(`${$1}${compName}${$2}`)
            } else {
              selectors.push(`${$1}${tagName}${$2}`)
            }
          })

          selectors.push(`${$1}html${$2}`)
          selectors.push(`${$1}page${$2}`)

          return ''
        })

        if (selector.trim()) selectors.push(selector)
      })

      child.selectors = selectors
    }
  })
})

/**
 * 处理缩进
 */
const formatPlugin = postcss.plugin('formatPlugin', () => root => {
  root.walk(child => {
    if (child.raws.before !== undefined) {
      // 处理缩进
      child.raws.before = child.raws.before.replace(indentSpaceRegexp, () => {
        const parent = child.parent

        if (parent && parent.raws.before !== undefined) {
          return `${parent.raws.before.match(indentSpaceRegexp)[0]}${config.indent}`
        }

        return ''
      })

      if (child.raws.after !== undefined) {
        child.raws.after = child.raws.after.replace(indentSpaceRegexp, () => child.raws.before.match(indentSpaceRegexp)[0])
      }
    }
  })
})

/**
 * 调整图片链接
 */
const replaceImagePlugin = function (resFilter, entryKey) {
  return postcss.plugin('replaceImagePlugin', () => root => {
    root.walk(child => {
      if (child.type === 'decl' && (child.prop === 'background' || child.prop === 'background-image' || child.prop === 'src')) {
        child.value = tool.replaceStyleUrl(child.value, resFilter, entryKey)
      }
    })
  })
}

/**
 * 调整 rem
 */
const adjustRemPlugin = function (rem) {
  return postcss.plugin('adjustRemPlugin', () => root => {
    root.walk(child => {
      if (child.type === 'decl' && rem) {
        child.value = tool.replaceStyleRem(child.value, rem)
      }
    })
  })
}

module.exports = async function (code, config = {}) {
  const resFilter = typeof config.resFilter === 'function' ? config.resFilter : (src => src)
  const rem = typeof config.rem === 'number' && isFinite(config.rem) ? config.rem : 0
  const entryKey = config.entryKey
  const needCompress = config.needCompress
  const pluginList = [replaceTagNamePlugin, formatPlugin, replaceImagePlugin(resFilter, entryKey), adjustRemPlugin(rem)]

  if (needCompress) {
    // 压缩
    pluginList.push(cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }]
    }))
  }

  code = await postcss(pluginList).process(code, {
    from: undefined, // 主要是不想看到那个 warning
    map: null,
  })

  return code.css
}
