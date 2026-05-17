var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function (event, context) {
  var count = 0
  var total = (await db.collection('images').count()).total

  var seen = {}
  for (var i = 0; i < total; i++) {
    var docs = (await db.collection('images').skip(i).limit(1).get()).data
    if (docs.length === 0) break
    var doc = docs[0]
    var key = doc.seriesId + '_' + doc.name
    if (seen[key]) {
      await db.collection('images').doc(doc._id).remove()
      count++
    } else {
      seen[key] = true
    }
  }

  return { code: 200, data: { removed: count } }
}
