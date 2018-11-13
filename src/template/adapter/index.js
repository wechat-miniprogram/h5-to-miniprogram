/**
 * 使用加载器的方式，方便追加插件
 */

const defaultConfig = {}

/**
 * 封装 native 方法的 toString
 */
function wrapNative(clazz) {
  if (typeof clazz === 'function' || typeof clazz === 'object') {
    Object.getOwnPropertyNames(clazz).forEach(key => {
      try {
        const value = clazz[key]
        if (typeof value === 'function') value.toString = () => `function ${value.name} { [native code] }`
      } catch (err) {
        // ignore
      }
    })
  }

  if (typeof clazz.prototype === 'function' || typeof clazz.prototype === 'object') {
    Object.getOwnPropertyNames(clazz.prototype).forEach(key => {
      try {
        const value = clazz.prototype[key]
        if (typeof value === 'function') value.toString = () => `function ${value.name} { [native code] }`
      } catch (err) {
        // ignore
      }
    })
  }

  return clazz
}


const MODULE_MAP = {
  // bom 相关
  Cookie: () => require('./bom/cookie'),
  History: () => require('./bom/history'),
  LocalStorage: () => require('./bom/local-storage'),
  Location: () => require('./bom/location'),
  Navigator: () => require('./bom/navigator'),
  Screen: () => require('./bom/screen'),
  SessionStorage: () => require('./bom/session-storage'),
  XMLHttpRequest: () => require('./bom/xml-http-request'),

  // 事件相关
  CustomEvent: () => require('./event/custom-event'),
  EventTarget: () => require('./event/event-target'),
  Event: () => require('./event/event'),

  // 节点相关
  A: () => require('./node/element/a'),
  Canvas: () => require('./node/element/canvas'),
  Image: () => require('./node/element/image'),
  Input: () => require('./node/element/input'),
  Attribute: () => require('./node/attribute'),
  ClassList: () => require('./node/class-list'),
  Comment: () => require('./node/comment'),
  Element: () => require('./node/element'),
  Node: () => require('./node/node'),
  styleList: () => require('./node/style-list'),
  Style: () => require('./node/style'),
  TextNode: () => require('./node/text-node'),

  // tree 相关
  parser: () => require('./tree/parser'),
  QuerySelector: () => require('./tree/query-selector'),
  tagMap: () => require('./tree/tag-map'),
  Tree: () => require('./tree/tree'),

  // 工具相关
  cache: () => require('./util/cache'),
  tool: () => require('./util/tool'),

  // 其他
  Document: () => require('./document'),
  Window: () => require('./window'),

  // 配置
  config() {
    let config

    try {
      // eslint-disable-next-line import/no-unresolved
      config = require('../config')
    } catch (err) {
      config = defaultConfig
    }

    if (typeof config.urlMap === 'string') {
      config.urlMap = {index: config.urlMap}
    }

    return config
  },

  // 扩展
  extend() {
    try {
      // eslint-disable-next-line import/no-unresolved
      return require('../extend')
    } catch (err) {
      // ignore
    }
  }
}
const MODULE_CACHE = {}

module.exports = function (moduleName) {
  const extend = MODULE_MAP.extend()

  if (!MODULE_CACHE[moduleName]) {
    const loader = MODULE_MAP[moduleName]
    let loadModule = loader ? loader() : null
    loadModule = typeof extend === 'function' ? extend(loadModule, moduleName) || loadModule : loadModule

    MODULE_CACHE[moduleName] = loadModule ? wrapNative(loadModule) : loadModule
  }

  return MODULE_CACHE[moduleName]
}
