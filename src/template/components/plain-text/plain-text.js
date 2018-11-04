const load = require('../../adapter/index')

const cache = load('cache')

Component({
  properties: {
    // 文本内容
    content: {
      type: String,
      default: '',
      public: true,
    },
  },
  options: {
    addGlobalClass: true, // 开启全局样式
  },
  attached() {
    const nodeId = this.dataset.privateNodeId
    const pageId = this.dataset.privatePageId

    this.nodeId = nodeId
    this.pageId = pageId

    // 存储 nodeId 到 component 实例的映射
    cache.setNodeComp(pageId, nodeId, this)

    // 记录 dom
    this.domNode = cache.getNode(pageId, nodeId)
  },
})
