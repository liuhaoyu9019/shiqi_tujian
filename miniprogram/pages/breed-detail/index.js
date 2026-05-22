var api = require('../../utils/api')

Page({
  data: {
    breed: null,
    images: [],
    loading: true,
    loadingMore: false,
    error: '',
    detailImg: null,
    detailImgSrc: '',
    detailDesc: '',
    page: 1,
    total: 0,
    hasMore: false,
    // 首屏图片进度
    showProgress: false,
    imgProgress: 0,
    imgTotal: 0,
    imgLoaded: 0,
    imgReady: false,
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

  loadBreed: function () {
    var that = this
    api.fetchSeriesById(this.seriesId).then(function (breed) {
      that.setData({ breed: breed, loading: false })
      that.loadImages()
    }).catch(function (e) {
      that.setData({ error: e.message || '加载失败', loading: false })
    })
  },

  loadImages: function () {
    var that = this
    api.fetchItemsBySeries(that.seriesId, 1, 20).then(function (result) {
      var images = result.images || result
      var total = result.total || images.length

      // 只统计首屏有缩略图的图片数
      var imgCount = 0
      for (var i = 0; i < images.length; i++) {
        if (images[i].thumbnailUrl) imgCount++
      }

      that.setData({
        images: images,
        page: 1,
        total: total,
        hasMore: images.length < total,
        showProgress: imgCount > 0,
        imgReady: false,
        imgTotal: imgCount,
        imgProgress: 0,
        imgLoaded: 0,
      })

      if (imgCount === 0) that.setData({ imgReady: true })
    }).catch(function () {
      that.setData({ loading: false })
    })
  },

  onImgLoad: function () {
    var loaded = this.data.imgLoaded + 1
    var total = this.data.imgTotal
    var progress = total > 0 ? Math.round((loaded / total) * 100) : 100
    this.setData({ imgLoaded: loaded, imgProgress: progress })
    if (loaded >= total) this.finishFirstLoad()
  },

  onImgError: function () {
    var loaded = this.data.imgLoaded + 1
    var total = this.data.imgTotal
    var progress = total > 0 ? Math.round((loaded / total) * 100) : 100
    this.setData({ imgLoaded: loaded, imgProgress: progress })
    if (loaded >= total) this.finishFirstLoad()
  },

  finishFirstLoad: function () {
    var that = this
    this.setData({ imgProgress: 100 })
    setTimeout(function () {
      that.setData({ showProgress: false, imgReady: true })
    }, 400)
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
    if (item) {
      this.setData({
        detailImg: item,
        detailImgSrc: item.originalUrl || item.thumbnailUrl || '',
        detailDesc: item.name || '',
      })
    }
  },

  onCloseDetail: function () {
    this.setData({ detailImg: null, detailImgSrc: '', detailDesc: '' })
  },

  onShareAppMessage: function () {
    var breed = this.data.breed
    return {
      title: breed ? breed.name + ' — 石器怀旧宠物图鉴' : '石器怀旧宠物图鉴',
      path: '/pages/breed-detail/index?seriesId=' + this.seriesId,
    }
  },

  onShareTimeline: function () {
    var breed = this.data.breed
    return {
      title: breed ? breed.name + ' — 石器怀旧宠物图鉴' : '石器怀旧宠物图鉴',
    }
  },
})
