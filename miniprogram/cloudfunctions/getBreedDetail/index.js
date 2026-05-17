var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event, context) {
  var seriesId = Number(event.seriesId)
  if (!seriesId) return { code: 400, message: '品种ID无效' }

  try {
    var result = await db.collection('breeds').where({ id: seriesId }).get()
    if (result.data.length === 0) return { code: 404, message: '品种不存在' }
    return { code: 200, data: result.data[0] }
  } catch (e) {
    return { code: 500, message: e.message }
  }
}
