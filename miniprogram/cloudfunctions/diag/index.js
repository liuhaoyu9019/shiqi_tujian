var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event) {
  var name = event && event.name

  var res = await db.collection('images').where(
    name ? { name: name } : { seriesId: Number(event.seriesId) || 6 }
  ).limit(3).get()

  var results = res.data.map(function (r) {
    return {
      _id: r._id,
      id: r.id,
      name: r.name,
      seriesId: r.seriesId,
      thumb: (r.thumbnailUrl || '').substring(0, 100),
      orig: (r.originalUrl || '').substring(0, 100),
    }
  })

  return { code: 200, data: { count: res.data.length, images: results } }
}
