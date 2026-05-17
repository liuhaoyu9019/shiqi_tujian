var api = require('../../utils/api')

Page({
  data: {
    breed: null,
    images: [],
    loading: true,
    imagesLoading: false,
    loadingMore: false,
    error: '',
    detailImg: null,
    detailDesc: '',
    page: 1,
    total: 0,
    hasMore: false,
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
    this.seriesId = seriesId
    this.loadBreed()
  },

  // 第一步：秒加载品种信息
  loadBreed: function () {
    var that = this
    api.fetchSeriesById(this.seriesId).then(function (breed) {
      that.setData({ breed: breed, loading: false, imagesLoading: true })
      that.loadImages()
    }).catch(function (e) {
      that.setData({ error: e.message || '加载失败', loading: false })
    })
  },

  // 第二步：加载图片（带骨架屏）
  loadImages: function () {
    var that = this
    that.setData({ imagesLoading: true })

    api.fetchItemsBySeries(that.seriesId, 1, 20).then(function (result) {
      var images = result.images || result
      var total = result.total || images.length
      that.setData({
        images: images,
        imagesLoading: false,
        page: 1,
        total: total,
        hasMore: images.length < total,
      })
    }).catch(function () {
      that.setData({ imagesLoading: false })
    })
  },

  onReachBottom: function () {
    var that = this
    if (that.data.loadingMore || !that.data.hasMore) return
    that.setData({ loadingMore: true })

    var nextPage = that.data.page + 1
    api.fetchItemsBySeries(that.seriesId, nextPage, 20).then(function (result) {
      var newImages = result.images || result
      var allImages = that.data.images.concat(newImages)
      that.setData({
        images: allImages,
        page: nextPage,
        loadingMore: false,
        hasMore: allImages.length < (result.total || that.data.total),
      })
    }).catch(function () {
      that.setData({ loadingMore: false })
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
