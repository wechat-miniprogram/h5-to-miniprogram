# api

## 可实现，但是会带来副作用

### dom

* 各个元素的滚动事件，使用 scroll-view 会改变元素的嵌套，会影响结构。同时安卓端的 scroll 事件有引起阻塞的风险。
* scrollTop、scrollLeft、scrollHeight、scrollWidth 等的设置和获取。
* drop 和 drag。
* wxss 和 background 无法使用本地图片，必须是网络图片。

## 无法完全按照标准实现

### dom

* input 标签的部分功能，比如 type=file 等，无法完美实现。
* computedStyle、boundingClientRect、clientWidth、clientHeight 等无法获取即时的结果，只能异步获取。（理论上可以在 appService 端实现 renderTree 和 layoutTree，但是开销太大）
* location 中的页面跳转功能。
* XMLHttpRequest。
* WebSocket。
* Worker。

### 样式

* 标签嵌套规则可能会变，导致样式会有差异，如 video 组件等。

### 其他

* canvas、video 等组件未提供的接口无法实现。
* img 标签和小程序 image 组件实现不同，image 组件是使用 backgroundImage 来实现的，在一些样式表现上会有差异。
* 原生组件层级问题，cover-view 和 cover-image 无法完整模拟 dom 节点。
* iframe 可用 web-view 替代，但是 web-view 不允许标准通信，也不允许自定义大小。

## 目前无法实现

### dom

* svg。
* webgl。
* range。
* 事件系统的 preventDefault 接口。
* 事件系统的 beforeunload、scroll 等事件。
* 还有无法手动模拟触发 dom 上的事件。

### 样式

* wxss 不支持属性选择器。
* 因为不支持动态修改 html 的 font-size，wxss 支持 rem 有限制，html 的 font-size 默认是 width / 20。

### 其他

* 动态追加脚本、wxss、JSONP，webpack 中的动态添加 css、js 功能无法使用。
* cookie 操作，请求携带 cookie。
* FileReader。
* 桌面提醒。

## 第三方库

### jQuery

### vue

### react
