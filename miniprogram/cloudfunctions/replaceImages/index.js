/**
 * replaceImages 云函数 — 批量替换品种图片的云存储路径
 *
 * 前置条件：新 GIF 文件已上传到云存储 breed-images/<品种名>/ 目录下
 *
 * 分批策略：每次调用处理一部分，通过 offset/limit 参数控制
 *   {}             — 默认处理全部（但建议分批）
 *   {"offset":0, "count":50}  — 处理前 50 条
 *   {"offset":50, "count":50} — 处理第 51-100 条
 *   {"action":"preview"}      — 仅预览
 */

var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var mapping = require('./mapping.json')
var ENV_ID = 'cloud1-d5gqwn87z8075a091'
var PREFIX = 'cloud://' + ENV_ID + '.636c-' + ENV_ID + '-1433959373/breed-images/'

exports.main = async function (event, context) {
  var isPreview = (event && event.action) === 'preview'
  var keys = Object.keys(mapping)
  var offset = Number(event && event.offset) || 0
  var count = Number(event && event.count) || keys.length
  var batch = keys.slice(offset, offset + count)

  var updated = 0
  var skipped = 0
  var errors = []

  console.log('=== replaceImages ===')
  console.log('mode:', isPreview ? 'PREVIEW' : 'UPDATE')
  console.log('range:', offset, '-', offset + batch.length, 'of', keys.length)

  for (var i = 0; i < batch.length; i++) {
    var info = mapping[batch[i]]  // [breedName, imageName]
    var breedName = info[0]
    var imageName = info[1]
    var cloudFileId = PREFIX + breedName + '/' + imageName + '.gif'

    if (isPreview) {
      updated++
      if (i < 10) console.log('  [' + breedName + '] ' + imageName + ' -> ' + cloudFileId)
      continue
    }

    try {
      // 直接用 name 匹配更新
      var updateRes = await db.collection('images')
        .where({ name: imageName })
        .update({ data: { thumbnailUrl: cloudFileId, originalUrl: cloudFileId } })

      if (updateRes.stats && updateRes.stats.updated > 0) {
        updated++
      } else {
        skipped++
        console.log('  SKIP: ' + imageName + ' (no match or already updated)')
      }
    } catch (e) {
      errors.push({ name: imageName, error: e.message || String(e) })
      console.log('  ERR: ' + imageName + ' — ' + (e.message || e))
    }

    // 每 10 条输出进度
    if ((i + 1) % 20 === 0) {
      console.log('  progress: ' + (i + 1) + '/' + batch.length + ' updated=' + updated + ' skipped=' + skipped)
    }
  }

  console.log('done: updated=' + updated + ' skipped=' + skipped + ' errors=' + errors.length)

  return {
    code: 200,
    message: isPreview ? 'preview done' : ('updated=' + updated + ' skipped=' + skipped),
    data: { total: batch.length, updated: updated, skipped: skipped, errors: errors.length, offset: offset, nextOffset: offset + count },
  }
}
