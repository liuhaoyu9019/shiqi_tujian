var api = require('../../utils/api')

Page({
  data: {
    breed: null,
    images: [],
    loading: true,
    error: '',
    detailImg: null,
    detailDesc: '',
  },

  onBack: function () {
    wx.navigateBack()
  },

  onLoad: function (options) {
    var seriesId = Number(options.seriesId)
    if (!seriesId) {
      this.setData({ error: '品种ID无效', loading: false })
      return
    }
    this.loadData(seriesId)
  },

  loadData: function (seriesId) {
    var that = this
    that.setData({ loading: true, error: '' })

    Promise.all([
      api.fetchSeriesById(seriesId),
      api.fetchItemsBySeries(seriesId),
    ]).then(function (results) {
      that.setData({ breed: results[0], images: results[1], loading: false })
    }).catch(function (e) {
      that.setData({ error: e.message || '加载失败', loading: false })
    })
  },

  onImageTap: function (e) {
    var id = e.currentTarget.dataset.id
    var item = null
    for (var i = 0; i < this.data.images.length; i++) {
      if (this.data.images[i].id === id) { item = this.data.images[i]; break }
    }
    if (item) this.setData({ detailImg: item, detailDesc: item.name || '' })
  },

  onCloseDetail: function () {
    this.setData({ detailImg: null, detailDesc: '' })
  },
})
