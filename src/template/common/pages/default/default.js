Page({
  data: {
    src: '',
  },

  onLoad({url}) {
    if (url) {
      this.setData({
        src: decodeURIComponent(url),
      })
    }
  },
})
