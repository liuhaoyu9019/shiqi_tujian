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
          // GET /api/box/series/:id
          if (req.method === 'GET' && seg[0] === 'box' && seg[1] === 'series' && seg[2]) {
            const s = db.series.find((s) => s.id === +seg[2])
            return s ? res.end(JSON.stringify(ok(s))) : res.end(JSON.stringify(fail(404, '系列不存在')))
          }
          // GET /api/box/series/:id/items
          if (req.method === 'GET' && seg[0] === 'box' && seg[1] === 'series' && seg[3] === 'items') {
            const items = db.items.filter((i) => i.seriesId === +seg[2] && i.status === 1)
            return res.end(JSON.stringify(ok(items)))
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

          // POST /api/draw/open
          if (req.method === 'POST' && seg[0] === 'draw' && seg[1] === 'open') {
            const { seriesId } = req.body
            const pool = db.items.filter((i) => i.seriesId === seriesId && i.status === 1)
            if (pool.length === 0) return res.end(JSON.stringify(fail(400, '无可抽藏品')))
            const rand = Math.random()
            let rarity = 'N'
            if (rand < 0.03) rarity = 'SSR'
            else if (rand < 0.12) rarity = 'SR'
            else if (rand < 0.35) rarity = 'R'
            const candidates = pool.filter((i) => i.rarity === rarity)
            const pick = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : pool[0]
            const record = {
              id: Date.now(), drawNo: 'DB' + Date.now().toString(36).toUpperCase(),
              seriesId, itemId: pick.id, itemName: pick.name, rarity: pick.rarity,
              price: db.series.find((s) => s.id === seriesId)?.price ?? 2990,
              isFirstGet: Math.random() > 0.5, createdAt: new Date().toISOString(),
            }
            return res.end(JSON.stringify(ok(record)))
          }

          // GET /api/wallet/packages
          if (req.method === 'GET' && seg[0] === 'wallet' && seg[1] === 'packages') {
            return res.end(JSON.stringify(ok([
              { id: 1, amount: 1000, bonus: 0, label: '¥10.00', desc: '10元套餐' },
              { id: 2, amount: 3000, bonus: 300, label: '¥30.00', desc: '加赠3元' },
              { id: 3, amount: 5000, bonus: 800, label: '¥50.00', desc: '加赠8元' },
              { id: 4, amount: 10000, bonus: 2000, label: '¥100.00', desc: '加赠20元' },
              { id: 5, amount: 30000, bonus: 9000, label: '¥300.00', desc: '加赠90元' },
              { id: 6, amount: 50000, bonus: 20000, label: '¥500.00', desc: '加赠200元' },
            ])))
          }

          // POST /api/wallet/recharge
          if (req.method === 'POST' && seg[0] === 'wallet' && seg[1] === 'recharge') {
            const packages = [
              { id: 1, amount: 1000, bonus: 0 }, { id: 2, amount: 3000, bonus: 300 },
              { id: 3, amount: 5000, bonus: 800 }, { id: 4, amount: 10000, bonus: 2000 },
              { id: 5, amount: 30000, bonus: 9000 }, { id: 6, amount: 50000, bonus: 20000 },
            ]
            const pkg = packages.find((p) => p.id === req.body.packageId)
            if (!pkg) return res.end(JSON.stringify(fail(400, '套餐不存在')))
            const order = {
              orderNo: 'RC' + Date.now().toString(36).toUpperCase(),
              amount: pkg.amount, bonus: pkg.bonus, totalAmount: pkg.amount + pkg.bonus,
            }
            return res.end(JSON.stringify(ok(order)))
          }

          // POST /api/wallet/pay/:orderNo
          if (req.method === 'POST' && seg[0] === 'wallet' && seg[1] === 'pay') {
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
                { page: '首页商城', count: 4520 }, { page: '3D开盒页', count: 3230 },
                { page: '藏品馆', count: 1890 }, { page: '个人中心', count: 920 },
                { page: '充值页面', count: 450 },
              ],
              hourlyDist: Array.from({ length: 24 }, (_, i) => ({
                hour: `${String(i).padStart(2, '0')}:00`,
                count: [12, 8, 5, 3, 2, 2, 3, 8, 15, 28, 45, 62, 58, 42, 38, 45, 52, 68, 85, 92, 78, 55, 35, 20][i],
              })),
            })))
          }

          // GET /api/user/:id
          if (req.method === 'GET' && seg[0] === 'user') {
            return res.end(JSON.stringify(ok({
              id: +seg[1], nickname: '盲盒猎人', avatarUrl: '', level: 12, exp: 8560, balance: 29990,
            })))
          }

          // GET /api/admin/draws
          if (req.method === 'GET' && seg[0] === 'admin' && seg[1] === 'draws') {
            const page = +url.searchParams.get('page') || 1
            const size = +url.searchParams.get('size') || 20
            const records = [] // 生产环境从DB读取
            return res.end(JSON.stringify(ok({ records, total: 0, size, current: page })))
          }

          // GET /api/admin/users (简化版)
          if (req.method === 'GET' && seg[0] === 'admin' && seg[1] === 'users') {
            return res.end(JSON.stringify(ok([
              { id: 1, nickname: '盲盒猎人', phone: '138****8888', level: 12, balance: 29990, drawCount: 47, createdAt: '2026-03-15' },
              { id: 2, nickname: '开盒达人', phone: '139****6666', level: 8, balance: 15000, drawCount: 23, createdAt: '2026-04-01' },
              { id: 3, nickname: '收藏控', phone: '136****9999', level: 15, balance: 5200, drawCount: 89, createdAt: '2026-02-20' },
            ])))
          }

          // GET /api/admin/recharges (简化版)
          if (req.method === 'GET' && seg[0] === 'admin' && seg[1] === 'recharges') {
            return res.end(JSON.stringify(ok([
              { id: 1, orderNo: 'RC001', userId: 1, nickname: '盲盒猎人', packageId: 4, amount: 10000, bonus: 2000, totalAmount: 12000, status: 2, paidAt: '2026-05-15 14:30', createdAt: '2026-05-15 14:29' },
              { id: 2, orderNo: 'RC002', userId: 2, nickname: '开盒达人', packageId: 2, amount: 3000, bonus: 300, totalAmount: 3300, status: 2, paidAt: '2026-05-15 13:15', createdAt: '2026-05-15 13:14' },
            ])))
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
