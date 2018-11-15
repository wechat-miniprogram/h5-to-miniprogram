# dom

* [x] 调整节点：appendChild、insertBefore、removeChild、replcaeChild
* [x] 亲戚节点：parentNode、childNodes、children、firstChild、lastChild、previousSibling、previousElementSibling
* [x] 创建节点：createElement、createTextNode、createDocumentFragment、cloneNode
* [x] 选择节点：getElementById、getElementsByTagName、getElementsByClassName、querySelector、querySelectorAll
* [x] 基础属性：classList、style、id、className、nodeType、dataset
* [x] 调整属性：attributes、setAttribute、getAttribute、removeAttribute
* [x] 布局属性：getComputedStyle、getBoundingClientRect、clientWidth、clientHeight（异步拉取）
* [x] 调整内容：innerHTML、outerHTML、textContent、innerText、nodeValue
* [x] 事件：addEventListener、removeEventListener、捕获冒泡模型，stopPropagation、onXXX、dispatchEvent、CustomEvent
* [x] 基础标签：img、table 相关、a、canvas(2d)、input(type=text/password/number)
* [x] 其他：Image

* [ ] 内容调整：insertAdjacentHTML
* [ ] 基础标签：video
* [ ] 基础标签：audio
* [ ] 基础标签：表单相关

# 样式

* [x] 基础选择器：id 选择器、类选择器、标签选择器
* [x] 亲属选择器：后代选择器、子选择器、兄弟选择器

* [ ] 其他选择器：伪类选择器、伪元素选择器 

# bom

* [x] 请求：XMLHttpRequest
* [x] 存储：localStorage、sessionStorage、cookie
* [x] 设备：screen、innerHeight/innerWidth、outerHeight/outerWidth、navigator
* [x] 路由：location、页面跳转、window.open、history

* [ ] 路由：锚跳转
* [ ] 请求：上传、websocket

# 其他

* [x] 插件扩展
* [x] 压缩配置

* [ ] sourceMap

# 依赖基础库支持

* 2.3.2 开放 writeIdToDom，支持 wxss 的 id 选择器。

# trick

* 小程序没有正经的全局对象（如 window、global），需要找出 js 中用到的所有全局变量并修改成 window['xxx'] 的方式来访问，同时所有全局函数的声明也需要找出并挂在 window 下。
* getComputedStyle、getBoundingClientRect 无法同步获取，因此在页面初始化的时候拉取一次，后续但凡遇到更新则再进行一次异步拉取。
* 并不是所有标签名都支持，有一些 h5 标签会用统一替换成 element 标签，所以需要修改 wxss 里的标签选择器。
* wxss 不支持 * 选择器，需要替换成标签选择器。
* 为了保证 wxss 中的兄弟、子节点选择器可以使用，element 自定义组件中不使用任何额外的标签嵌套，video、img 等特殊标签除外。
* 小程序中部分资源相关字段（如 background-image）只支持网络资源，因此需要提供 imageFilter 字段来过滤图片资源，替换资源路径为对应的网络路径。
* 小程序页面的 route 和网页的 url 实现不一致，因此需要提供 urlMap 来提供每个页面对应的 url，用于页面跳转和 location 接口。
* 小程序不支持动态修改样式，因此不支持动态设置 font-size。小程序根节点的 font-size 默认为`屏幕宽度 / 20 px`，因此开发者可以直接按照这个数值来进行开发，或者提供 375px 的屏幕宽度时根节点的 font-size 值，由框架进行换算。
* 去掉了大部分的异常。

# 性能

* iphoneX 初次渲染，1000 个节点，160 ms 左右。
* 小米 5s 初次渲染，1000 个节点，1250 ms 左右。
