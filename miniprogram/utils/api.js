// API 客户端 — 双模式（dev-server / 云函数）封装
//
// 切换方式：修改 MODE 变量
//   'dev'   → 走本地 dev-server（http://localhost:5173），使用 wx.request
//   'cloud' → 走微信云函数，使用 wx.cloud.callFunction
//
// 云函数模式下图片处理：
//   云函数 getBreedImages 返回 thumbnailUrl（JPEG缩略图） + originalUrl（GIF原图）
//   thumbnailUrl 用于网格列表快速展示，originalUrl 用于弹窗查看动图。
//   封面图 coverUrl 已由云函数处理为 JPEG 缩略图。

var MODE = 'cloud' // 'dev' | 'cloud' — 生产环境改为 'cloud'

// ==================== 配置 ====================
var DEV_BASE_URL = 'http://localhost:5173'
var CLOUD_ENV_ID = 'cloud1-d5gqwn87z8075a091' // 与 app.js 中 wx.cloud.init 的 env 一致

// ==================== 云文件 ID 构建 ====================

/** 将相对路径拼成云存储 fileID */
function buildCloudFileId(relativePath) {
  if (!relativePath) return ''
  // 去掉路径开头的 /
  var path = relativePath.indexOf('/') === 0 ? relativePath.slice(1) : relativePath
  // cloud:// 格式：cloud://env-id.636c-env-id-1433959373/path
  return 'cloud://' + CLOUD_ENV_ID + '.636c-' + CLOUD_ENV_ID + '-1433959373/' + path
}

// ==================== 图片 URL 修复 ====================

/** 单张图片 URL 修复 */
function fixImageUrl(url) {
  if (!url) return ''
  if (url.indexOf('data:') === 0 || url.indexOf('http') === 0) return url
  if (url.indexOf('cloud://') === 0) return url // 云文件 ID，后续批量转临时链接
  if (MODE === 'dev') return DEV_BASE_URL + url
  // cloud 模式：相对路径 → 云存储 fileID
  return buildCloudFileId(url)
}

/** 修复品种数据中的 coverUrl */
function fixBreed(b) {
  return Object.assign({}, b, { coverUrl: fixImageUrl(b.coverUrl) })
}

/** 修复图片数据中的 thumbnailUrl / originalUrl */
function fixImage(img) {
  var result = { thumbnailUrl: fixImageUrl(img.thumbnailUrl) }
  result.originalUrl = fixImageUrl(img.originalUrl || img.thumbnailUrl)
  return Object.assign({}, img, result)
}

// ==================== 云存储批量临时链接 ====================

/**
 * 批量将云文件 ID 转为临时 HTTPS 链接
 * @param {string[]} fileIds - 云文件 ID 列表
 * @returns {Promise<Object>} { [fileId]: tempUrl }
 */
function batchGetTempFileURL(fileIds) {
  return new Promise(function (resolve, reject) {
    if (!fileIds || fileIds.length === 0) {
      resolve({})
      return
    }
    if (!wx.cloud || !wx.cloud.getTempFileURL) {
      resolve({})
      return
    }
    wx.cloud.getTempFileURL({
      fileList: fileIds,
      success: function (res) {
        var map = {}
        var list = res.fileList || []
        for (var i = 0; i < list.length; i++) {
          if (list[i].tempFileURL) {
            map[list[i].fileID] = list[i].tempFileURL
          }
        }
        resolve(map)
      },
      fail: function () {
        resolve({})
      },
    })
  })
}

/**
 * 对品种列表应用临时链接
 */
function resolveBreedImages(breeds) {
  // 收集所有 cloud:// 开头的 coverUrl
  var fileIds = []
  for (var i = 0; i < breeds.length; i++) {
    var url = breeds[i].coverUrl
    if (url && url.indexOf('cloud://') === 0) {
      fileIds.push(url)
    }
  }
  if (fileIds.length === 0) return Promise.resolve(breeds)

  return batchGetTempFileURL(fileIds).then(function (map) {
    for (var i = 0; i < breeds.length; i++) {
      var url = breeds[i].coverUrl
      if (map[url]) {
        breeds[i].coverUrl = map[url]
      }
    }
    return breeds
  })
}

/**
 * 对图片列表应用临时链接：
 *   thumbnailUrl → 新静态文件 + cgif/1 缩略图优化
 *   originalUrl  → 旧动图文件（从 series-images/ 路径重建）
 */
function resolveItemImages(items, oldPrefix) {
  oldPrefix = oldPrefix || ''

  // 第一步：从图片路径中提取品种名
  var breedName = ''
  for (var i = 0; i < items.length; i++) {
    var u = items[i].thumbnailUrl || ''
    var parts = u.split('/')
    // cloud:// → parts[0]='cloud:', parts[1]='', parts[2]=envId, parts[3]=baseDir, parts[4]=folder
    if (u.indexOf('breed-images/') !== -1 && parts.length >= 5) {
      breedName = parts[4]
      break
    }
    if (u.indexOf('series-images/') !== -1 && parts.length >= 5) {
      var folder = parts[4]
      var idx = folder.indexOf('_')
      if (idx !== -1) {
        breedName = folder.substring(idx + 1)
        oldPrefix = oldPrefix || folder.substring(0, idx + 1)
      }
      break
    }
  }

  console.log('[api] breedName:', breedName, 'oldPrefix:', oldPrefix)

  // 第二步：收集 cloud:// URL，对已替换图片重建旧路径
  var thumbIds = []
  var origIds = []
  var oldOrigMap = {}

  for (var i = 0; i < items.length; i++) {
    var thumb = items[i].thumbnailUrl || ''
    var orig = items[i].originalUrl || ''

    if (thumb.indexOf('cloud://') === 0) thumbIds.push(thumb)

    if (orig.indexOf('breed-images/') !== -1 && oldPrefix && breedName) {
      var imgId = items[i].id || ''
      var imgName = items[i].name || ''
      var oldId = thumb.replace(
        /breed-images\/[^/]+\/[^/]+$/,
        'series-images/' + oldPrefix + breedName + '/' + imgId + '_' + imgName + '.gif'
      )
      oldOrigMap[i] = oldId
      origIds.push(oldId)
    } else if (orig.indexOf('cloud://') === 0) {
      origIds.push(orig)
    }
  }

  console.log('[api] thumbIds:', thumbIds.length, 'origIds:', origIds.length, 'reconstructed:', Object.keys(oldOrigMap).length)

  if (thumbIds.length === 0 && origIds.length === 0) return Promise.resolve(items)

  // 第三步：批量转换成临时链接
  var tasks = []
  if (thumbIds.length > 0) tasks.push(batchGetTempFileURL(thumbIds))
  if (origIds.length > 0) tasks.push(batchGetTempFileURL(origIds))

  return Promise.all(tasks).then(function (results) {
    var thumbMap = results[0] || {}
    var origMap = results[1] || {}

    for (var i = 0; i < items.length; i++) {
      // 缩略图：新文件 + 强制第一帧
      if (thumbMap[items[i].thumbnailUrl]) {
        items[i].thumbnailUrl = thumbMap[items[i].thumbnailUrl] + '&imageMogr2/thumbnail/300x/cgif/1'
      }

      // 弹窗原图：取旧动图链接
      if (oldOrigMap[i] && origMap[oldOrigMap[i]]) {
        items[i].originalUrl = origMap[oldOrigMap[i]]
      } else if (origMap[items[i].originalUrl]) {
        items[i].originalUrl = origMap[items[i].originalUrl]
      } else if (thumbMap[items[i].thumbnailUrl]) {
        // 兜底
        items[i].originalUrl = thumbMap[items[i].thumbnailUrl]
      }
    }

    return items
  })
}

// ==================== HTTP 请求（DEV 模式） ====================

function httpRequest(url, method, data) {
  method = method || 'GET'
  return new Promise(function (resolve, reject) {
    var token = wx.getStorageSync('admin_token') || ''
    wx.request({
      url: DEV_BASE_URL + '/api' + url,
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

// ==================== 云函数调用（CLOUD 模式） ====================

function cloudCall(name, data) {
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: name,
      data: data || {},
      success: function (res) {
        if (res.result && res.result.code === 200) {
          resolve(res.result.data)
        } else {
          var msg = (res.result && res.result.message) || '云函数调用失败'
          reject(new Error(msg))
        }
      },
      fail: function (err) {
        reject(new Error(err.errMsg || '云函数调用失败'))
      },
    })
  })
}

// ==================== 品种接口（双模式） ====================

function fetchSeries() {
  if (MODE === 'cloud') {
    return cloudCall('getBreeds')
  }
  return httpRequest('/box/series').then(function (data) {
    return data.map(fixBreed)
  })
}

function fetchSeriesById(id) {
  if (MODE === 'cloud') {
    return cloudCall('getBreedDetail', { seriesId: id })
  }
  return httpRequest('/box/series/' + id).then(function (data) {
    return fixBreed(data)
  })
}

function fetchItemsBySeries(seriesId, page, size) {
  page = page || 1
  size = size || 20
  if (MODE === 'cloud') {
    return cloudCall('getBreedImages', { seriesId: seriesId, page: page, size: size })
  }
  return httpRequest('/box/series/' + seriesId + '/items').then(function (data) {
    return data.map(fixImage)
  })
}

// ==================== 统计接口 ====================

function fetchStatsDashboard() {
  return httpRequest('/admin/stats/dashboard')
}

// ==================== 后台品种管理 ====================

function adminListSeries() {
  return httpRequest('/box/series').then(function (data) {
    return data.map(fixBreed)
  })
}

function adminCreateSeries(data) {
  return httpRequest('/admin/series', 'POST', data).then(function (result) {
    return fixBreed(result)
  })
}

function adminUpdateSeries(id, data) {
  return httpRequest('/admin/series/' + id, 'PUT', data).then(function (result) {
    return fixBreed(result)
  })
}

function adminDeleteSeries(id) {
  return httpRequest('/admin/series/' + id, 'DELETE')
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
  return httpRequest('/admin/items' + query).then(function (data) {
    return Object.assign({}, data, { records: data.records.map(fixImage) })
  })
}

function adminCreateItem(data) {
  return httpRequest('/admin/items', 'POST', data).then(function (result) {
    return fixImage(result)
  })
}

function adminUpdateItem(id, data) {
  return httpRequest('/admin/items/' + id, 'PUT', data).then(function (result) {
    return fixImage(result)
  })
}

function adminDeleteItem(id) {
  return httpRequest('/admin/items/' + id, 'DELETE')
}

module.exports = {
  // 核心查询接口（双模式自动切换）
  fetchSeries: fetchSeries,
  fetchSeriesById: fetchSeriesById,
  fetchItemsBySeries: fetchItemsBySeries,

  // 统计
  fetchStatsDashboard: fetchStatsDashboard,

  // 后台品种管理
  adminListSeries: adminListSeries,
  adminCreateSeries: adminCreateSeries,
  adminUpdateSeries: adminUpdateSeries,
  adminDeleteSeries: adminDeleteSeries,

  // 后台图片管理
  adminListItems: adminListItems,
  adminCreateItem: adminCreateItem,
  adminUpdateItem: adminUpdateItem,
  adminDeleteItem: adminDeleteItem,

  // 工具
  batchGetTempFileURL: batchGetTempFileURL,
  buildCloudFileId: buildCloudFileId,
  fixImageUrl: fixImageUrl,
}
