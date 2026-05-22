var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var CACHE_TTL = 100 * 60 * 1000
var CACHE_COL = 'img_cache'

function cacheKey(fileId) {
  return fileId.replace(/[^a-zA-Z0-9一-鿿]/g, '_')
}

async function getCachedUrl(fileId) {
  // 先查缓存
  try {
    var res = await db.collection(CACHE_COL).doc(cacheKey(fileId)).get()
    if (res.data && res.data.expireAt > Date.now()) return res.data.tempUrl
  } catch (e) { /* 缓存未命中 */ }

  // 调 API 获取
  var temp = await cloud.getTempFileURL({ fileList: [fileId] })
  var url = (temp.fileList[0] && temp.fileList[0].tempFileURL) || ''

  // 写入缓存
  if (url) {
    db.collection(CACHE_COL).doc(cacheKey(fileId)).set({
      data: { fileId: fileId, tempUrl: url, expireAt: Date.now() + CACHE_TTL }
    }).catch(function () {})
  }

  return url
}

exports.main = async function (event, context) {
  var seriesId = Number(event.seriesId)
  if (!seriesId) return { code: 400, message: '品种ID无效' }

  try {
    var result = await db.collection('breeds').where({ id: seriesId }).get()
    if (result.data.length === 0) return { code: 404, message: '品种不存在' }

    var breed = result.data[0]
    var url = breed.coverUrl
    if (url && url.indexOf('cloud://') === 0) {
      var tempUrl = await getCachedUrl(url)
      if (tempUrl) breed.coverUrl = tempUrl + '&imageMogr2/thumbnail/400x/cgif/1'
    }

    return { code: 200, data: breed }
  } catch (e) {
    return { code: 500, message: e.message }
  }
}
