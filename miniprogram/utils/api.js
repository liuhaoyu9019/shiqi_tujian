// API 客户端 — wx.request 封装

var BASE_URL = 'http://localhost:5173'

/** 修复图片路径：相对路径补全为绝对URL */
function fixImageUrl(url) {
  if (!url) return ''
  if (url.indexOf('data:') === 0 || url.indexOf('http') === 0) return url
  return BASE_URL + url
}

/** 修复品种数据中的图片路径 */
function fixBreed(b) {
  return Object.assign({}, b, { coverUrl: fixImageUrl(b.coverUrl) })
}

/** 修复图片数据中的缩略图路径 */
function fixImage(img) {
  return Object.assign({}, img, { thumbnailUrl: fixImageUrl(img.thumbnailUrl) })
}

/** 通用请求方法 */
function request(url, method, data) {
  method = method || 'GET'
  return new Promise(function (resolve, reject) {
    var token = wx.getStorageSync('admin_token') || ''
    wx.request({
      url: BASE_URL + '/api' + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      success: function (res) {
        if (res.statusCode === 200) {
          var json = res.data
          if (json.code === 200) {
            resolve(json.data)
          } else if (json.code === 401) {
            wx.removeStorageSync('admin_token')
            reject(new Error('未授权访问'))
          } else {
            reject(new Error(json.message || '请求失败'))
          }
        } else {
          reject(new Error('HTTP ' + res.statusCode))
        }
      },
      fail: function (err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

// ==================== 品种接口 ====================

function fetchSeries() {
  return request('/box/series').then(function (data) { return data.map(fixBreed) })
}

function fetchSeriesById(id) {
  return request('/box/series/' + id).then(function (data) { return fixBreed(data) })
}

function fetchItemsBySeries(seriesId) {
  return request('/box/series/' + seriesId + '/items').then(function (data) { return data.map(fixImage) })
}

// ==================== 统计接口 ====================

function fetchStatsDashboard() {
  return request('/admin/stats/dashboard')
}

// ==================== 后台品种管理 ====================

function adminListSeries() {
  return request('/box/series').then(function (data) { return data.map(fixBreed) })
}

function adminCreateSeries(data) {
  return request('/admin/series', 'POST', data).then(function (result) { return fixBreed(result) })
}

function adminUpdateSeries(id, data) {
  return request('/admin/series/' + id, 'PUT', data).then(function (result) { return fixBreed(result) })
}

function adminDeleteSeries(id) {
  return request('/admin/series/' + id, 'DELETE')
}

// ==================== 后台图片管理 ====================

function adminListItems(seriesId, page, size) {
  page = page || 1
  size = size || 50
  var parts = []
  if (seriesId) parts.push('seriesId=' + seriesId)
  parts.push('page=' + page)
  parts.push('size=' + size)
  var query = '?' + parts.join('&')
  return request('/admin/items' + query).then(function (data) {
    return Object.assign({}, data, { records: data.records.map(fixImage) })
  })
}

function adminCreateItem(data) {
  return request('/admin/items', 'POST', data).then(function (result) { return fixImage(result) })
}

function adminUpdateItem(id, data) {
  return request('/admin/items/' + id, 'PUT', data).then(function (result) { return fixImage(result) })
}

function adminDeleteItem(id) {
  return request('/admin/items/' + id, 'DELETE')
}

module.exports = {
  fetchSeries: fetchSeries,
  fetchSeriesById: fetchSeriesById,
  fetchItemsBySeries: fetchItemsBySeries,
  fetchStatsDashboard: fetchStatsDashboard,
  adminListSeries: adminListSeries,
  adminCreateSeries: adminCreateSeries,
  adminUpdateSeries: adminUpdateSeries,
  adminDeleteSeries: adminDeleteSeries,
  adminListItems: adminListItems,
  adminCreateItem: adminCreateItem,
  adminUpdateItem: adminUpdateItem,
  adminDeleteItem: adminDeleteItem,
}
