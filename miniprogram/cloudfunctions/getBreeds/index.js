var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event, context) {
  try {
    var result = await db.collection('breeds')
      .where({ status: 1 })
      .orderBy('sortOrder', 'desc')
      .get()
    return { code: 200, data: result.data }
  } catch (e) {
    return { code: 200, data: [] }
  }
}
