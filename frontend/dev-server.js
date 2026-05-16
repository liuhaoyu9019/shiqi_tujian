// 轻量开发API服务器 — 内嵌于Vite，无需Java/MySQL/Redis
import fs from 'fs'
import path from 'path'

const DB_FILE = path.resolve('./dev-db.json')

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  } catch {
    const initial = {
      series: [
        { id: 1, name: '星辰幻想', coverUrl: '', description: '穿越星河，探寻宇宙深处的神秘生物', price: 2990, totalItems: 8, status: 1, sortOrder: 1, isHot: true, isNew: false, createdAt: '2026-05-01', updatedAt: '2026-05-01' },
        { id: 2, name: '幻兽觉醒', coverUrl: '', description: '上古神兽苏醒，十二幻兽等你唤醒', price: 3990, totalItems: 12, status: 1, sortOrder: 2, isHot: true, isNew: true, createdAt: '2026-05-05', updatedAt: '2026-05-05' },
        { id: 3, name: '机甲纪元', coverUrl: '', description: '未来科技机甲，钢铁与灵魂的碰撞', price: 4990, totalItems: 10, status: 1, sortOrder: 3, isHot: false, isNew: true, createdAt: '2026-05-10', updatedAt: '2026-05-10' },
      ],
      items: [
        { id: 1, seriesId: 1, name: '星尘独角兽', modelUrl: '', thumbnailUrl: '', rarity: 'SSR', probability: 0.03, status: 1, createdAt: '2026-05-01' },
        { id: 2, seriesId: 1, name: '银河幼龙', modelUrl: '', thumbnailUrl: '', rarity: 'SR', probability: 0.08, status: 1, createdAt: '2026-05-01' },
        { id: 3, seriesId: 1, name: '月光精灵', modelUrl: '', thumbnailUrl: '', rarity: 'SR', probability: 0.08, status: 1, createdAt: '2026-05-01' },
        { id: 4, seriesId: 1, name: '星屑蝶', modelUrl: '', thumbnailUrl: '', rarity: 'R', probability: 0.20, status: 1, createdAt: '2026-05-01' },
        { id: 5, seriesId: 1, name: '彗星猫', modelUrl: '', thumbnailUrl: '', rarity: 'R', probability: 0.20, status: 1, createdAt: '2026-05-01' },
        { id: 6, seriesId: 2, name: '炽焰凤凰', modelUrl: '', thumbnailUrl: '', rarity: 'SSR', probability: 0.03, status: 1, createdAt: '2026-05-05' },
        { id: 7, seriesId: 2, name: '冰霜狼王', modelUrl: '', thumbnailUrl: '', rarity: 'SR', probability: 0.09, status: 1, createdAt: '2026-05-05' },
        { id: 8, seriesId: 2, name: '雷霆飞龙', modelUrl: '', thumbnailUrl: '', rarity: 'SR', probability: 0.09, status: 1, createdAt: '2026-05-05' },
      ],
      nextId: { series: 4, items: 9 },
    }
    saveDB(initial)
    return initial
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function ok(data) {
  return { code: 200, message: 'success', data, timestamp: Date.now() }
}

function fail(code, message) {
  return { code, message, data: null, timestamp: Date.now() }
}

export default function devServerPlugin() {
  return {
    name: 'dev-api-server',
    configureServer(server) {
      // 解析JSON body
      server.middlewares.use('/api', (req, res, next) => {
        if (['POST', 'PUT'].includes(req.method)) {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try { req.body = JSON.parse(body) } catch { req.body = {} }
            next()
          })
        } else {
          next()
        }
      })

      server.middlewares.use('/api', (req, res, next) => {
        const db = loadDB()
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')
        const seg = url.pathname.split('/').filter(Boolean)

        try {
          // GET /api/box/series
          if (req.method === 'GET' && seg[0] === 'box' && seg[1] === 'series' && !seg[2]) {
            const active = db.series.filter((s) => s.status === 1)
            return res.end(JSON.stringify(ok(active)))
          }
          // GET /api/box/series/:id/items
          if (req.method === 'GET' && seg[0] === 'box' && seg[1] === 'series' && seg[3] === 'items') {
            const items = db.items.filter((i) => i.seriesId === +seg[2] && i.status === 1)
            return res.end(JSON.stringify(ok(items)))
          }
          // GET /api/box/series/:id
          if (req.method === 'GET' && seg[0] === 'box' && seg[1] === 'series' && seg[2]) {
            const s = db.series.find((s) => s.id === +seg[2])
            return s ? res.end(JSON.stringify(ok(s))) : res.end(JSON.stringify(fail(404, '系列不存在')))
          }

          // ===== Admin =====
          // POST /api/admin/series
          if (req.method === 'POST' && seg[0] === 'admin' && seg[1] === 'series') {
            const id = db.nextId.series++
            const s = { id, ...req.body, coverUrl: req.body.coverUrl || '', status: 1, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) }
            db.series.push(s)
            saveDB(db)
            return res.end(JSON.stringify(ok(s)))
          }
          // PUT /api/admin/series/:id
          if (req.method === 'PUT' && seg[0] === 'admin' && seg[1] === 'series') {
            const idx = db.series.findIndex((s) => s.id === +seg[2])
            if (idx === -1) return res.end(JSON.stringify(fail(404, '系列不存在')))
            db.series[idx] = { ...db.series[idx], ...req.body, id: +seg[2], updatedAt: new Date().toISOString().slice(0, 10) }
            saveDB(db)
            return res.end(JSON.stringify(ok(db.series[idx])))
          }
          // DELETE /api/admin/series/:id
          if (req.method === 'DELETE' && seg[0] === 'admin' && seg[1] === 'series') {
            const idx = db.series.findIndex((s) => s.id === +seg[2])
            if (idx === -1) return res.end(JSON.stringify(fail(404, '系列不存在')))
            db.series[idx].status = 0
            saveDB(db)
            return res.end(JSON.stringify(ok(null)))
          }

          // GET /api/admin/items
          if (req.method === 'GET' && seg[0] === 'admin' && seg[1] === 'items') {
            let items = db.items.filter((i) => i.status !== 0)
            if (url.searchParams.get('seriesId')) {
              items = items.filter((i) => i.seriesId === +url.searchParams.get('seriesId'))
            }
            const page = +url.searchParams.get('page') || 1
            const size = +url.searchParams.get('size') || 20
            const start = (page - 1) * size
            return res.end(JSON.stringify(ok({ records: items.slice(start, start + size), total: items.length, size, current: page })))
          }
          // POST /api/admin/items
          if (req.method === 'POST' && seg[0] === 'admin' && seg[1] === 'items') {
            const id = db.nextId.items++
            const item = { id, ...req.body, status: 1, createdAt: new Date().toISOString().slice(0, 10) }
            db.items.push(item)
            saveDB(db)
            return res.end(JSON.stringify(ok(item)))
          }
          // PUT /api/admin/items/:id
          if (req.method === 'PUT' && seg[0] === 'admin' && seg[1] === 'items') {
            const idx = db.items.findIndex((i) => i.id === +seg[2])
            if (idx === -1) return res.end(JSON.stringify(fail(404, '藏品不存在')))
            db.items[idx] = { ...db.items[idx], ...req.body, id: +seg[2] }
            saveDB(db)
            return res.end(JSON.stringify(ok(db.items[idx])))
          }
          // DELETE /api/admin/items/:id
          if (req.method === 'DELETE' && seg[0] === 'admin' && seg[1] === 'items') {
            const idx = db.items.findIndex((i) => i.id === +seg[2])
            if (idx === -1) return res.end(JSON.stringify(fail(404, '藏品不存在')))
            db.items[idx].status = 0
            saveDB(db)
            return res.end(JSON.stringify(ok(null)))
          }

          // GET /api/admin/stats/dashboard
          if (req.method === 'GET' && seg[0] === 'admin' && seg[1] === 'stats' && seg[2] === 'dashboard') {
            const trend = []
            for (let i = 6; i >= 0; i--) {
              const d = new Date(); d.setDate(d.getDate() - i)
              const ds = d.toISOString().slice(0, 10)
              trend.push({ date: ds, count: Math.floor(Math.random() * 2000) + 1000, dayOfWeek: ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()] })
            }
            return res.end(JSON.stringify(ok({
              totalVisits: 12450 + Math.floor(Math.random() * 1000),
              todayVisits: Math.floor(Math.random() * 500) + 200,
              weekVisits: Math.floor(Math.random() * 3000) + 2000,
              todayUV: Math.floor(Math.random() * 200) + 100,
              todayIP: Math.floor(Math.random() * 150) + 80,
              avgDuration: Math.floor(Math.random() * 120) + 60,
              trend,
              pageRank: [
                { page: '品种图鉴首页', count: 4520 }, { page: '品种详情页', count: 3230 },
                { page: '品种详情页', count: 1890 }, { page: '关于页面', count: 920 },
                { page: '关于页面', count: 450 },
              ],
              hourlyDist: Array.from({ length: 24 }, (_, i) => ({
                hour: `${String(i).padStart(2, '0')}:00`,
                count: [12, 8, 5, 3, 2, 2, 3, 8, 15, 28, 45, 62, 58, 42, 38, 45, 52, 68, 85, 92, 78, 55, 35, 20][i],
              })),
            })))
          }


          // Fallback: 未匹配的路由
          res.statusCode = 404
          return res.end(JSON.stringify(fail(404, 'Not Found')))
        } catch (e) {
          res.statusCode = 500
          return res.end(JSON.stringify(fail(500, e.message)))
        }
      })
    },
  }
}
