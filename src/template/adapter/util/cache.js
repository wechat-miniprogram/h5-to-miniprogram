const pageMap = {}
const pageKeyMap = {}

/**
 * 初始化
 */
function init(pageId, options) {
  pageMap[pageId] = {
    document: options.document,
    window: options.window,
    nodeIdMap: options.nodeIdMap,
    nodeCompMap: {},
  }
}

/**
 * 销毁
 */
function destroy(pageId) {
  delete pageMap[pageId]
  delete pageKeyMap[pageId]
}

/**
 * 获取 document
 */
function getDocument(pageId) {
  return pageMap[pageId] && pageMap[pageId].document
}

/**
 * 获取 window
 */
function getWindow(pageId) {
  return pageMap[pageId] && pageMap[pageId].window
}

/**
 * 设置页面 key
 */
function setPageKey(pageId, pageKey) {
  pageKeyMap[pageId] = pageKey
}

/**
 * 获取页面 key
 */
function getPageKey(pageId) {
  return pageKeyMap[pageId] || ''
}

/**
 * 存储 domNode 映射
 */
function setNode(pageId, nodeId, domNode = null) {
  const document = pageMap[pageId] && pageMap[pageId].document

  // 运行前调用，不做任何操作
  if (!document) return
  // 相当于删除映射
  if (!domNode) return pageMap[pageId].nodeIdMap[nodeId] = domNode

  let parentNode = domNode.parentNode

  while (parentNode && parentNode !== document.body) {
    parentNode = parentNode.parentNode
  }

  pageMap[pageId].nodeIdMap[nodeId] = parentNode === document.body ? domNode : null
}

/**
 * 根据 nodeId 获取 domNode
 */
function getNode(pageId, nodeId) {
  return pageMap[pageId].nodeIdMap[nodeId]
}

/**
 * 存储 component 实例映射
 */
function setNodeComp(pageId, nodeId, comp) {
  pageMap[pageId].nodeCompMap[nodeId] = comp
}

/**
 * 根据 nodeId 获取 component 实例
 */
function getNodeComp(pageId, nodeId) {
  return pageMap[pageId].nodeCompMap[nodeId]
}

module.exports = {
  init,
  destroy,
  getDocument,
  getWindow,
  setPageKey,
  getPageKey,
  setNode,
  getNode,
  setNodeComp,
  getNodeComp,
}
