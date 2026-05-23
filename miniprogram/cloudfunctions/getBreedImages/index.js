var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var CACHE_TTL = 100 * 60 * 1000
var CACHE_COL = 'img_cache'

function cacheKey(fileId) {
  return fileId.replace(/[^a-zA-Z0-9一-鿿]/g, '_')
}

async function readCache(fileIds) {
  if (fileIds.length === 0) return { hits: {}, misses: [] }
  try {
    var ids = fileIds.map(cacheKey)
    var res = await db.collection(CACHE_COL).where({ _id: db.command.in(ids) }).get()
    var hits = {}
    var now = Date.now()
    for (var i = 0; i < res.data.length; i++) {
      if (res.data[i].expireAt > now) hits[res.data[i].fileId] = res.data[i].tempUrl
    }
    var misses = []
    for (var j = 0; j < fileIds.length; j++) {
      if (!hits[fileIds[j]]) misses.push(fileIds[j])
    }
    return { hits: hits, misses: misses }
  } catch (e) { return { hits: {}, misses: fileIds.slice() } }
}

async function writeCache(map) {
  var expireAt = Date.now() + CACHE_TTL
  for (var fileId in map) {
    if (!map[fileId]) continue
    db.collection(CACHE_COL).doc(cacheKey(fileId)).set({
      data: { fileId: fileId, tempUrl: map[fileId], expireAt: expireAt }
    }).catch(function () {})
  }
}

async function batchGetUrls(fileIds) {
  var cache = await readCache(fileIds)
  var map = cache.hits
  if (cache.misses.length > 0) {
    var fresh = {}
    for (var i = 0; i < cache.misses.length; i += 50) {
      var chunk = cache.misses.slice(i, i + 50)
      var res = await cloud.getTempFileURL({ fileList: chunk })
      for (var j = 0; j < res.fileList.length; j++) {
        if (res.fileList[j].tempFileURL) fresh[res.fileList[j].fileID] = res.fileList[j].tempFileURL
      }
    }
    for (var k in fresh) { map[k] = fresh[k] }
    writeCache(fresh)
  }
  return map
}

exports.main = async function (event, context) {
  var seriesId = Number(event.seriesId)
  if (!seriesId) return { code: 400, message: '品种ID无效' }

  var page = Number(event.page) || 1
  var size = Math.min(Number(event.size) || 20, 20)

  try {
    var result = await db.collection('images').where({ seriesId: seriesId }).get()

    var seen = {}
    var deduped = []
    for (var d = 0; d < result.data.length; d++) {
      if (!seen[result.data[d].name]) {
        seen[result.data[d].name] = true
        deduped.push(result.data[d])
      }
    }

    var total = deduped.length
    var start = (page - 1) * size
    var paged = deduped.slice(start, start + size)

    // 收集所有 cloud:// URL
    var fileIds = []
    for (var i = 0; i < paged.length; i++) {
      var t = paged[i].thumbnailUrl || ''
      var o = paged[i].originalUrl || ''
      if (t.indexOf('cloud://') === 0) fileIds.push(t)
      if (o.indexOf('cloud://') === 0 && o !== t) fileIds.push(o)
    }

    var urlMap = {}
    if (fileIds.length > 0) urlMap = await batchGetUrls(fileIds)

    for (var k = 0; k < paged.length; k++) {
      var tUrl = paged[k].thumbnailUrl || ''
      var oUrl = paged[k].originalUrl || ''

      // 缩略图：cgif/1 只取第一帧（静态，加载快）
      paged[k].isGif = (tUrl.indexOf('.gif') !== -1 || oUrl.indexOf('.gif') !== -1)

      if (urlMap[tUrl]) {
        paged[k].thumbnailUrl = urlMap[tUrl] + '&imageMogr2/thumbnail/300x/cgif/1'
        // 原图：同一文件，不限制帧数（动图）
        paged[k].originalUrl = urlMap[tUrl]
      }
      if (urlMap[oUrl] && oUrl !== tUrl) {
        paged[k].originalUrl = urlMap[oUrl]
      }
    }

    return { code: 200, data: { images: paged, total: total, page: page, size: size } }
  } catch (e) {
    return { code: 200, data: { images: [], total: 0, page: 1, size: size } }
  }
}
