var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event, context) {
  var seriesId = Number(event.seriesId)
  if (!seriesId) return { code: 400, message: '品种ID无效' }

  try {
    var result = await db.collection('breeds').where({ id: seriesId }).get()
    if (result.data.length === 0) return { code: 404, message: '品种不存在' }

    var breed = result.data[0]
    var url = breed.coverUrl
    if (url && url.indexOf('cloud://') === 0) {
      var temp = await cloud.getTempFileURL({ fileList: [url] })
      if (temp.fileList[0] && temp.fileList[0].tempFileURL) {
        breed.coverUrl = temp.fileList[0].tempFileURL
      }
    }

    return { code: 200, data: breed }
  } catch (e) {
    return { code: 500, message: e.message }
  }
}
