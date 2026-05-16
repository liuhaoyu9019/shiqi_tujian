import { useState, useEffect } from 'react'
import { useDrawStore } from '@/stores/drawStore'
import { adminListDraws } from '@/utils/api'
import { RARITY_CONFIG } from '@/types'
import type { DrawRecord, Rarity } from '@/types'

export default function RecordsPage() {
  const localHistory = useDrawStore((s) => s.drawHistory)
  const [serverRecords, setServerRecords] = useState<DrawRecord[]>([])
  const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all')

  useEffect(() => {
    adminListDraws().then((r) => setServerRecords(r.records)).catch(() => {})
  }, [])

  const drawHistory = serverRecords.length > 0 ? serverRecords : localHistory
  const filtered = rarityFilter === 'all'
    ? drawHistory
    : drawHistory.filter((r) => r.rarity === rarityFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">开盒记录</h1>
      </div>

      {/* 稀有度筛选 */}
      <div className="flex items-center gap-2">
        {([
          { key: 'all', label: '全部', color: '#4F6EF7', bg: '#F5F6FA' },
          { key: 'SSR', label: 'SSR', color: '#F0B90B', bg: '#FFFBEB' },
          { key: 'SR', label: 'SR', color: '#A855F7', bg: '#FAF5FF' },
          { key: 'R', label: 'R', color: '#3B82F6', bg: '#EFF6FF' },
          { key: 'N', label: 'N', color: '#9CA3AF', bg: '#F3F4F6' },
        ] as { key: 'all' | Rarity; label: string; color: string; bg: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setRarityFilter(f.key)}
            className={`px-3 py-1.5 rounded-btn text-sm transition-colors ${
              rarityFilter === f.key ? 'text-white font-medium' : 'text-text-secondary'
            }`}
            style={rarityFilter === f.key ? { background: f.color } : { background: f.bg }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 记录列表 */}
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-text-disabled text-sm">暂无开盒记录</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg text-text-secondary text-xs">
                <th className="text-left px-4 py-3 font-medium">流水号</th>
                <th className="text-left px-4 py-3 font-medium">藏品</th>
                <th className="text-center px-4 py-3 font-medium">稀有度</th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">金额</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => {
                const cfg = RARITY_CONFIG[r.rarity]
                return (
                  <tr key={r.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{r.drawNo}</td>
                    <td className="px-4 py-3 font-medium">{r.itemName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-tag" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">¥{(r.price / 100).toFixed(1)}</td>
                    <td className="px-4 py-3 text-right text-text-secondary text-xs hidden md:table-cell">
                      {new Date(r.createdAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
