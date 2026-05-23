/**
 * restoreOrigUrl — 从 img_cache 表中恢复 originalUrl 的旧路径
 * 调用方式：云端测试传入 {} 即可
 */
var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = async function () {
  // 查询所有 img_cache 记录（旧文件的 temp URL 缓存可能还在）
  var allCache = []
  var offset = 0
  while (true) {
    var res = await db.collection('img_cache').skip(offset).limit(100).get()
    if (res.data.length === 0) break
    allCache = allCache.concat(res.data)
    if (res.data.length < 100) break
    offset += 100
  }

  console.log('cache entries:', allCache.length)

  // 筛选 series-images/ 的缓存条目，按文件名中的图片名建立索引
  // fileId 格式: cloud://env/series-images/XX_品种名/ID_名称.gif
  var oldPathByName = {}
  for (var i = 0; i < allCache.length; i++) {
    var fid = allCache[i].fileId || ''
    if (fid.indexOf('series-images/') === -1) continue
    var parts = fid.split('/')
    var filename = parts[parts.length - 1] || '' // "101545_华雷斯.gif"
    // 去掉文件 ID 前缀和下划线，提取图片名
    var underscoreIdx = filename.indexOf('_')
    if (underscoreIdx === -1) continue
    var nameWithExt = filename.substring(underscoreIdx + 1) // "华雷斯.gif"
    var name = nameWithExt.replace(/\.gif$/i, '')
    if (name) oldPathByName[name] = fid
  }

  console.log('old paths by name:', Object.keys(oldPathByName).length)

  // 查询所有 images 记录
  var allImages = []
  offset = 0
  while (true) {
    var res2 = await db.collection('images').skip(offset).limit(100).get()
    if (res2.data.length === 0) break
    allImages = allImages.concat(res2.data)
    if (res2.data.length < 100) break
    offset += 100
  }

  console.log('images:', allImages.length)

  // 更新 originalUrl
  var restored = 0
  var skipped = 0
  for (var j = 0; j < allImages.length; j++) {
    var img = allImages[j]
    var oldPath = oldPathByName[img.name]
    if (oldPath && img.originalUrl !== oldPath) {
      try {
        await db.collection('images').doc(img._id).update({
          data: { originalUrl: oldPath }
        })
        restored++
      } catch (e) {
        skipped++
      }
    } else {
      skipped++
    }
  }

  console.log('restored:', restored, 'skipped:', skipped)
  return { code: 200, data: { restored: restored, skipped: skipped } }
}
