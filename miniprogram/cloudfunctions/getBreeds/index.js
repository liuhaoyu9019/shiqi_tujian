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
        if (map[result.data[k].coverUrl]) {
          result.data[k].coverUrl = map[result.data[k].coverUrl]
        }
      }
    }

    return { code: 200, data: result.data }
  } catch (e) {
    return { code: 200, data: [] }
  }
}
