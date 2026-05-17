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

  try {
    var result = await db.collection('images').where({ seriesId: seriesId }).get()

    // 按名称去重（保留第一个）
    var seen = {}
    var deduped = []
    for (var d = 0; d < result.data.length; d++) {
      if (!seen[result.data[d].name]) {
        seen[result.data[d].name] = true
        deduped.push(result.data[d])
      }
    }
    result.data = deduped

    var fileIds = []
    for (var i = 0; i < result.data.length; i++) {
      var url = result.data[i].thumbnailUrl
      if (url && url.indexOf('cloud://') === 0) fileIds.push(url)
    }

    if (fileIds.length > 0) {
      var map = await batchGetUrls(fileIds)
      for (var k = 0; k < result.data.length; k++) {
        if (map[result.data[k].thumbnailUrl]) {
          result.data[k].thumbnailUrl = map[result.data[k].thumbnailUrl]
        }
      }
    }

    return { code: 200, data: result.data }
  } catch (e) {
    return { code: 200, data: [] }
  }
}
