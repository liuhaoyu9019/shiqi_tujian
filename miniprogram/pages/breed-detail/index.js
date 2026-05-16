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
    var BASE = 'http://localhost:5173'
    that.setData({ loading: true, error: '' })

    function fixUrl(url) {
      if (!url) return ''
      if (url.indexOf('data:') === 0 || url.indexOf('http') === 0) return url
      return BASE + url
    }

    var count = 0
    var breedData = null
    var imageData = []

    function done() {
      count++
      if (count === 2) {
        if (breedData) breedData.coverUrl = fixUrl(breedData.coverUrl)
        for (var i = 0; i < imageData.length; i++) {
          imageData[i].thumbnailUrl = fixUrl(imageData[i].thumbnailUrl)
        }
        that.setData({ breed: breedData, images: imageData, loading: false })
      }
    }

    wx.request({
      url: BASE + '/api/box/series/' + seriesId,
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          breedData = res.data.data
        }
        done()
      },
      fail: function () { done() },
    })

    wx.request({
      url: BASE + '/api/box/series/' + seriesId + '/items',
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          imageData = res.data.data || []
        }
        done()
      },
      fail: function () { done() },
    })
  },

  onImageTap: function (e) {
    var id = e.currentTarget.dataset.id
    var item = null
    for (var i = 0; i < this.data.images.length; i++) {
      if (this.data.images[i].id === id) {
        item = this.data.images[i]
        break
      }
    }
    if (item) {
      this.setData({ detailImg: item, detailDesc: item.description || item.name || '' })
    }
  },

  onCloseDetail: function () {
    this.setData({ detailImg: null, detailDesc: '' })
  },

  onDetailDescInput: function (e) {
    this.setData({ detailDesc: e.detail.value })
  },
})
