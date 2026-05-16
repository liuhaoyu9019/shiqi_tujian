import { useState, useEffect } from 'react'
import { useBoxStore } from '@/stores/boxStore'
import { useDrawStore } from '@/stores/drawStore'
import { useUserStore } from '@/stores/userStore'
import { RARITY_CONFIG } from '@/types'
import { fetchItemsBySeries } from '@/utils/api'
import type { ItemDef, Rarity } from '@/types'

interface UserItemDisplay {
  itemDef: ItemDef
  quantity: number
  seriesName: string
}

const rarityFilters: { key: Rarity | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'SSR', label: 'SSR 传说' },
  { key: 'SR', label: 'SR 史诗' },
  { key: 'R', label: 'R 稀有' },
  { key: 'N', label: 'N 普通' },
]

export default function CollectionPage() {
  const user = useUserStore((s) => s.user)
  const seriesList = useBoxStore((s) => s.series)
  const drawHistory = useDrawStore((s) => s.drawHistory)
  const [activeRarity, setActiveRarity] = useState<Rarity | 'all'>('all')
  const [items, setItems] = useState<UserItemDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // 从开盒记录中提取藏品信息作为用户已拥有的藏品
        const collected = new Map<number, { itemDef: ItemDef; quantity: number }>()
        for (const record of drawHistory) {
          const existing = collected.get(record.itemId)
          if (existing) {
            existing.quantity++
          } else {
            collected.set(record.itemId, {
              itemDef: {
                id: record.itemId,
                seriesId: record.seriesId,
                name: record.itemName,
                rarity: record.rarity,
                modelUrl: '',
                thumbnailUrl: '',
                probability: 0,
              },
              quantity: 1,
            })
          }
        }
        // 如果开盒记录为空，尝试从首个系列加载藏品列表
        if (collected.size === 0 && seriesList.length > 0) {
          const firstSeriesId = seriesList[0].id
          try {
            const allItems = await fetchItemsBySeries(firstSeriesId)
            allItems.forEach((item) => {
              collected.set(item.id, { itemDef: item, quantity: 1 })
            })
          } catch { /* 无后端时静默降级 */ }
        }
        const displayItems: UserItemDisplay[] = Array.from(collected.values()).map((v) => ({
          ...v,
          seriesName: seriesList.find((s) => s.id === v.itemDef.seriesId)?.name ?? '未知系列',
        }))
        setItems(displayItems)
      } catch { /* 静默降级 */ }
      setLoading(false)
    }
    load()
  }, [drawHistory, seriesList])

  const filtered = activeRarity === 'all'
    ? items
    : items.filter((i) => i.itemDef.rarity === activeRarity)

  const stats = {
    total: items.length,
    ssr: items.filter((i) => i.itemDef.rarity === 'SSR').length,
    sr: items.filter((i) => i.itemDef.rarity === 'SR').length,
    r: items.filter((i) => i.itemDef.rarity === 'R').length,
    n: items.filter((i) => i.itemDef.rarity === 'N').length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-card rounded-card shadow-card p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
            {(user?.nickname ?? '?')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">{user?.nickname ?? '未登录'}</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-tag">
                Lv.{user?.level ?? 1}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {user ? `收藏达人 · 已收集 ${stats.total} 件藏品` : '请先登录'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-center">
          {[
            { key: 'all', label: '总计', count: stats.total, color: '#4F6EF7' },
            { key: 'SSR', label: 'SSR', count: stats.ssr, color: '#F0B90B' },
            { key: 'SR', label: 'SR', count: stats.sr, color: '#A855F7' },
            { key: 'R', label: 'R', count: stats.r, color: '#3B82F6' },
            { key: 'N', label: 'N', count: stats.n, color: '#9CA3AF' },
          ].map((s) => (
            <div key={s.key} className="flex-1">
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs text-text-disabled">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {rarityFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveRarity(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-btn text-sm transition-colors ${
              activeRarity === f.key ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-text-disabled">暂无藏品，去商城开盒吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((item) => {
            const cfg = RARITY_CONFIG[item.itemDef.rarity]
            return (
              <div key={item.itemDef.id} className="bg-card rounded-card shadow-card p-3 text-center card-hover">
                <div
                  className="w-full aspect-square rounded-tag flex items-center justify-center mb-2"
                  style={{ background: cfg.bg }}
                >
                  {item.itemDef.thumbnailUrl ? (
                    <img src={item.itemDef.thumbnailUrl} alt={item.itemDef.name} className="w-full h-full object-cover rounded-tag" />
                  ) : (
                    <span className="text-3xl opacity-50">
                      {item.itemDef.rarity === 'SSR' ? '💎' : item.itemDef.rarity === 'SR' ? '🔮' : item.itemDef.rarity === 'R' ? '💠' : '📦'}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{item.itemDef.name}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-xs" style={{ color: cfg.color }}>{'⭐'.repeat(cfg.stars)}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-text-disabled">×{item.quantity}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
