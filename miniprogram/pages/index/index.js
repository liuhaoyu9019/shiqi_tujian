var api = require('../../utils/api')

Page({
  data: {
    breeds: [],
    loading: true,
    error: '',
    imgProgress: 0,
    imgTotal: 0,
    imgLoaded: 0,
    showProgress: false,
    imgReady: false,
    banners: [
      '/image/banben_img/0.webp',
      '/image/banben_img/1.webp',
      '/image/banben_img/2.webp',
      '/image/banben_img/3.webp',
      '/image/banben_img/4.webp',
      '/image/banben_img/5.webp',
      '/image/banben_img/6.webp',
      '/image/banben_img/7.webp',
      '/image/banben_img/8.webp',
      '/image/banben_img/9.webp',
    ],
    currentBanner: 0,
  },

  onLoad: function () {
    var that = this
    api.fetchSeries().then(function (breeds) {
      // 过滤掉呼拔拔系
      breeds = breeds.filter(function (b) { return b.name !== '呼拔拔系' })
      // 只统计有封面图的品种
      var total = 0
      for (var i = 0; i < breeds.length; i++) {
        if (breeds[i].coverUrl) total++
      }

      that.setData({
        breeds: breeds,
        loading: false,
        showProgress: total > 0,
        imgReady: false,
        imgTotal: total,
        imgProgress: 0,
        imgLoaded: 0,
      })

      if (total === 0) that.setData({ imgReady: true })
    }).catch(function (e) {
      that.setData({ error: e.message || '加载失败', loading: false })
    })
  },

  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },

  onBreedTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/breed-detail/index?seriesId=' + id })
  },

  onImgLoad: function () {
    var loaded = this.data.imgLoaded + 1
    var total = this.data.imgTotal
    var progress = total > 0 ? Math.round((loaded / total) * 100) : 100
    this.setData({ imgLoaded: loaded, imgProgress: progress })
    if (loaded >= total) {
      this.finishLoading()
    }
  },

  onImgError: function () {
    var loaded = this.data.imgLoaded + 1
    var total = this.data.imgTotal
    var progress = total > 0 ? Math.round((loaded / total) * 100) : 100
    this.setData({ imgLoaded: loaded, imgProgress: progress })
    if (loaded >= total) {
      this.finishLoading()
    }
  },

  finishLoading: function () {
    var that = this
    // 100% 后延迟 400ms，让用户看清完成状态，再展示图片
    this.setData({ imgProgress: 100 })
    setTimeout(function () {
      that.setData({ showProgress: false, imgReady: true })
    }, 400)
  },

  onShareAppMessage: function () {
    return {
      title: '石器怀旧宠物图鉴 — 重温经典宠物',
      path: '/pages/index/index',
    }
  },

  onShareTimeline: function () {
    return {
      title: '石器怀旧宠物图鉴',
    }
  },
})
