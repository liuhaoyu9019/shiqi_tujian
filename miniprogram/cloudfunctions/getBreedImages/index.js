var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event, context) {
  var seriesId = Number(event.seriesId)
  if (!seriesId) return { code: 400, message: '品种ID无效' }

  try {
    var result = await db.collection('images').where({ seriesId: seriesId }).get()
    return { code: 200, data: result.data }
  } catch (e) {
    return { code: 200, data: [] }
  }
}
