var api = require('../../utils/api')

Page({
  data: {
    breeds: [],
    loading: true,
    error: '',
  },

  onLoad: function () {
    var that = this
    wx.showLoading({ title: '加载中...' })
    api.fetchSeries().then(function (breeds) {
      wx.hideLoading()
      that.setData({ breeds: breeds, loading: false })
    }).catch(function (e) {
      wx.hideLoading()
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
})
