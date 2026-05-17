var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

async function batchGetUrls(fileIds) {
  var map = {}
  for (var i = 0; i < fileIds.length; i += 50) {
    var chunk = fileIds.slice(i, i + 50)
    var res = await cloud.getTempFileURL({ fileList: chunk })
    for (var j = 0; j < res.fileList.length; j++) {
      if (res.fileList[j].tempFileURL) {
        map[res.fileList[j].fileID] = res.fileList[j].tempFileURL
      }
    }
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

    // 按名称去重
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

    // 只转换当前页的图片URL
    var fileIds = []
    for (var i = 0; i < paged.length; i++) {
      var url = paged[i].thumbnailUrl
      if (url && url.indexOf('cloud://') === 0) fileIds.push(url)
    }

    if (fileIds.length > 0) {
      var map = await batchGetUrls(fileIds)
      for (var k = 0; k < paged.length; k++) {
        if (map[paged[k].thumbnailUrl]) {
          paged[k].thumbnailUrl = map[paged[k].thumbnailUrl]
        }
      }
    }

    return { code: 200, data: { images: paged, total: total, page: page, size: size } }
  } catch (e) {
    return { code: 200, data: { images: [], total: 0, page: 1, size: size } }
  }
}
