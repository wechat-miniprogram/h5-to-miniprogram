# h5-to-miniprogram（此项目不再维护）

> 经过一些探索尝试，发现此方案不适合直接作为一个可长期维护和用于线上环境的项目实施，故后续不再维护此项目。
> 对方案原理有兴趣的朋友们可以尝试转战脱胎于此方案的 [kbone](https://wechat-miniprogram.github.io/kbone/docs/) 解决方案。

这是一个尝试让 h5 页面在微信小程序中运行的构建转换工具。

## 原理简介

将 h5 页面转成微信小程序里的页面，通过适配层代码在微信小程序中维护一棵模拟出来的 dom 树，并模拟出类似浏览器环境的 dom/bom 接口，进而让 h5 页面在微信小程序中运行。

> PS：需要注意的是，因为微信小程序的特殊运行环境，并不能做到完美转换。例如跳转页面授权写 cookie 的方式就暂时无法实现。
> PS：这是一个运行在最底层的适配做法，理论上来说 jQuery、react、vue 等 web 框架/库也能在一定程度上兼容使用。

## 安装

```
npm install --save-dev h5-to-miniprogram
```

## 配置文件

因为 h5 和微信小程序的运行环境有比较大的差异，因为需要引入一份适配相关的配置文件。因为此配置文件需要同时在 nodejs 和微信小程序的环境中运行，请注意**不要依赖其他模块**：

| 参数名 | 类型 | 描述 |
|---|---|---|
| index | String | 传入要作为首页的页面的 pageKey，默认取页面列表中第一个页面 |
| urlMap | String/Object | 每个页面对应的 url，会被解析到 location 对象中和应用于页面跳转，默认每个页面的 url 为空串。当直接传入一个 url 时，则该 url 对应的页面的 pageKey 为 index |
| resFilter | Function | 资源路径过滤，用于调整资源路径。因为 h5 转成小程序，此工具默认不去处理静态资源，资源路径如果是相对路径，则需要开发者手动处理，如果是网络路径则只需将资源域名设置到业务域名中即可 |
| rem | Number | 当屏幕宽度为 375px 时 html 节点应该设置的 font-size 值，因为小程序不支持动态设置 html 的 font-size，所以需要做 rem 数值调整 |

> PS：以上配置字段中每一项都不是必须的，如果不需要使用到亦可以不传。
> PS：微信小程序中的 html 节点的 font-size 值是 20px，这里传入 rem 字段是为了调整样式中的 rem 数值使其在微信小程序中能正常运行。

以下是一个配置文件的范例：

```js
module.exports = {
  index: 'demo1',
  urlMap: {
    demo1: 'https://www.qq.com/demo1?a=1&b=2#hash',
    demo2: 'https://www.qq.com:5566/demo2',
    demo3: 'http://127.0.0.1:8080/demo3',
  },
  resFilter(src, pageKey) {
    // src - 输入资源路径
    // pageKey - 发起资源路径替换的页面的 pageKey

    return pageKey === 'demo2' ? src.replace('/a', '/b') : src // 此处必须返回一个资源路径
  },
  rem: 58.59375,
}
```

> PS：如果配置文件比较复杂，可以通过 webpack/rollup 等构建工具来生成。

## 使用

此工具暴露了一个 async 函数，函数只接收一个参数，类型为对象。此参数各字段描述如下：

| 参数名 | 类型 | 是否必需 | 描述 |
|---|---|---|---|
| entry | String/Object | 是 | 入口，支持多个页面，每个页面都有自己唯一的 pageKey。当直接传入一个路径时，则该路径对应的页面的 pageKey 为 index |
| output | String | 否 | 输出目录，输出的内容是一个完整可运行的小程序项目，默认为当前运行目录下的 h5\_to\_miniprogram\_output 目录中 |
| config | String | 否 | 配置文件路径 |
| extend | String/Array | 否 | 扩展实现文件路径，支持以数组方式传入多个扩展，下面会作详细介绍使用方式 |
| compress | Boolean/Object | 否 | 压缩配置，当传入 true 时，表示所有压缩子项都为 true |
| compress.jsInH5 | Boolean | 否 | 是否压缩原 h5 页面中的 js 和生成的初始抽象语法树代码 |
| compress.cssInH5 | Boolean | 否 | 是否压缩原 h5 页面中的 css 和默认载入的初始 wxss |
| proxy | String | 否 | 当原 h5 页面引用了一些网络 js、css 文件，则构建过程可能存在网络请求，此处可配网络请求的代理 |

以下是一个使用此工具的范例：

```js
const toMiniprogram = require('h5-to-miniprogram')

toMiniprogram({
  // 如下面的 demo1、demo2、demo3 就是对应页面的 pageKey
  entry: {
    demo1: '/demo1/index.html',
    demo2: '/demo2/index.html',
    demo3: '/demo3/index.html',
  },
  output: '/output',
  config: '/config.js',
  extend: '/extend.js',
  compress: {
    jsInH5: true,
    cssInH5: true,
  },
}).then(res => {
  console.log('done')
}).catch(err => {
  console.error(err)
})
```

之后会在 output 指定目录中生成一个微信小程序项目，你可以直接使用开发者工具打开此项目。

## 扩展

此项目目前并不成熟，只实现了常见的部分接口，另外已实现的接口中也并未完全按照标准实现。如果使用过程中遇到想使用的接口此工具未实现或实现不符合预期的情况下，可以通过编写插件来进行扩展。

在使用此工具时，支持传入 extend 字段，其值为扩展实现文件的路径。和配置文件类似，此扩展实现文件会在微信小程序的环境中运行，请注意**不要依赖其他模块**。

下面以给 window 对象添加一个名为 `I\_am\_extend\_function` 的方法作为例子讲解如果编写扩展实现文件：

```js
module.exports = function(loadModule, moduleName) {
  // loadModule - 模块暴露接口
  // moduleName - 模块名称

  if (moduleName === 'Window') {
    loadModule.prototype.I_am_extend_function = function () {
      return 'I am extend function'
    }
  } else {
    return loadModule
  }
}
```

> PS：如果扩展支持文件比较复杂，可以通过 webpack/rollup 等构建工具来生成。

### 目前支持扩展的类/对象：

1. bom 相关

* Cookie
* History
* LocalStorage
* Location
* Navigator
* Screen
* SessionStorage
* XMLHttpRequest

2. 事件相关

* CustomEvent
* EventTarget
* Event

3. 节点相关

* A
* Canvas
* Image
* Input

* Attribute
* ClassList
* Comment
* Element
* Node
* styleList
* Style
* TextNode

4. tree 相关

* parser
* QuerySelector
* tagMap
* Tree

5. 工具相关

* cache
* tool

6. 其他

* Document
* Window

> PS：有兴趣的同学可以参考源码，相关实现在此[ adapter 目录](./src/template/adapter/)中。

## 无法兼容的差异

因为运行环境的不同，存在一些暂时无法兼容的差异，此处仅列出一部分作为例子：

* 动态插入 script 和 style 标签。
* 通过 new Function、eval 动态执行 js 代码。
* svg。
* webgl。
* 样式中的属性选择器。
* ...

## 基础库依赖

*  wxss 的 id 选择器依赖 2.3.2 基础库。

## 其他相关文档

* [一个简单的 demo](https://github.com/wechat-miniprogram/h5-to-miniprogram-demo)
* [更新日志](./UPDATE.md)
