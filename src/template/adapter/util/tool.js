/**
 * 驼峰转连字符
 */
function toDash(str) {
  return str.replace(/[A-Z]/g, all => `-${all.toLowerCase()}`)
}

/**
 * 连字符转驼峰
 */
function toCamel(str) {
  return str.replace(/-([a-zA-Z])/g, (all, $1) => $1.toUpperCase())
}

/**
 * 获取唯一 id
 */
let seed = +new Date()
function getId() {
  return seed++
}

/**
 * 替换样式中的路径
 */
function replaceStyleUrl(value, filter, pageKey) {
  return value.replace(/\burl\((?:["']?)([^"']*)(?:["']?)\)/ig, (all, $1) => `url("${filter($1, pageKey)}")`)
}

/**
 * 替换样式中的 rem
 */
const realRem = 375 / 20
function replaceStyleRem(value, rem) {
  return value.replace(/((?:\d*.\d+)|(?:\d+))rem/ig, (all, $1) => {
    if ($1[0] === '.') $1 = '0' + $1

    return (parseFloat($1, 10) * rem / realRem).toFixed(3) + 'rem'
  })
}

/**
 * 节流，一个同步流中只调用一次该函数
 */
const waitFuncSet = new WeakSet()
function throttle(func, timeout = 0) {
  return () => {
    if (waitFuncSet.has(func)) return

    waitFuncSet.add(func)

    setTimeout(() => {
      waitFuncSet.delete(func)
      func()
    }, timeout)
  }
}

module.exports = {
  toDash,
  toCamel,
  getId,
  replaceStyleUrl,
  replaceStyleRem,
  throttle,
}
