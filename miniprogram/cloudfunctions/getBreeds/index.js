var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var CACHE_TTL = 100 * 60 * 1000 // temp URL 有效期 2 小时，缓存 100 分钟留余量
var CACHE_COL = 'img_cache'

/* 将 cloud fileID 转为合法的文档 _id */
function cacheKey(fileId) {
  return fileId.replace(/[^a-zA-Z0-9一-鿿]/g, '_')
}

/* 批量查缓存，返回 { hits: { fileId: tempUrl }, misses: [fileId] } */
async function readCache(fileIds) {
  if (fileIds.length === 0) return { hits: {}, misses: [] }
  try {
    var ids = fileIds.map(cacheKey)
    var res = await db.collection(CACHE_COL)
      .where({ _id: db.command.in(ids) })
      .get()
    var hits = {}
    var now = Date.now()
    var valid = {}
    for (var i = 0; i < res.data.length; i++) {
      if (res.data[i].expireAt > now) valid[res.data[i].fileId] = res.data[i].tempUrl
    }
    var misses = []
    for (var j = 0; j < fileIds.length; j++) {
      if (valid[fileIds[j]]) hits[fileIds[j]] = valid[fileIds[j]]
      else misses.push(fileIds[j])
    }
    return { hits: hits, misses: misses }
  } catch (e) { return { hits: {}, misses: fileIds.slice() } }
}

/* 批量写缓存 */
async function writeCache(map) {
  var expireAt = Date.now() + CACHE_TTL
  for (var fileId in map) {
    if (!map[fileId]) continue
    db.collection(CACHE_COL).doc(cacheKey(fileId)).set({
      data: { fileId: fileId, tempUrl: map[fileId], expireAt: expireAt }
    }).catch(function () {})
  }
}

/* 仅对未缓存项调 getTempFileURL */
async function batchGetUrls(fileIds) {
  var cache = await readCache(fileIds)
  var map = cache.hits

  if (cache.misses.length > 0) {
    var fresh = {}
    for (var i = 0; i < cache.misses.length; i += 50) {
      var chunk = cache.misses.slice(i, i + 50)
      var res = await cloud.getTempFileURL({ fileList: chunk })
      for (var j = 0; j < res.fileList.length; j++) {
        if (res.fileList[j].tempFileURL) {
          fresh[res.fileList[j].fileID] = res.fileList[j].tempFileURL
        }
      }
    }
    for (var k in fresh) { map[k] = fresh[k] }
    writeCache(fresh) // 异步写缓存，不阻塞
  }

  return map
}

exports.main = async function (event, context) {
  try {
    var result = await db.collection('breeds')
      .where({ status: 1 })
      .orderBy('sortOrder', 'desc')
      .get()

    var fileIds = []
    for (var i = 0; i < result.data.length; i++) {
      var url = result.data[i].coverUrl
      if (url && url.indexOf('cloud://') === 0) fileIds.push(url)
    }

    if (fileIds.length > 0) {
      var map = await batchGetUrls(fileIds)
      for (var k = 0; k < result.data.length; k++) {
        var rawUrl = result.data[k].coverUrl
        if (map[rawUrl]) {
          result.data[k].coverUrl = map[rawUrl] + '&imageMogr2/thumbnail/400x/cgif/1'
        }
      }
    }

    return { code: 200, data: result.data }
  } catch (e) {
    return { code: 200, data: [] }
  }
}
