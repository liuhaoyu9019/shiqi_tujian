var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var OLD = 'http://localhost:5173'
var NEW = 'cloud://cloud1-d5gqwn87z8075a091.636c-cloud1-d5gqwn87z8075a091-1433959373'

async function fixOne(name, field) {
  var total = (await db.collection(name).count()).total
  var updated = 0
  for (var skip = 0; skip < total; skip++) {
    var docs = (await db.collection(name).skip(skip).limit(1).get()).data
    if (docs.length === 0) break
    var url = docs[0][field]
    if (url && url.indexOf(OLD) === 0) {
      var u = {}
      u[field] = url.replace(OLD, NEW)
      await db.collection(name).doc(docs[0]._id).update({ data: u })
      updated++
    }
  }
  return updated
}

exports.main = async function (event, context) {
  var b = await fixOne('breeds', 'coverUrl')
  var im = await fixOne('images', 'thumbnailUrl')
  return { code: 200, data: { breeds: b, images: im } }
}
