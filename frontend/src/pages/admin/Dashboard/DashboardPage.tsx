import { useState, useEffect } from 'react'
import { useBoxStore } from '@/stores/boxStore'
import { useDrawStore } from '@/stores/drawStore'
import { fetchStatsDashboard } from '@/utils/api'

export default function DashboardPage() {
  const series = useBoxStore((s) => s.series)
  const drawHistory = useDrawStore((s) => s.drawHistory)
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)

  useEffect(() => { fetchStatsDashboard().then(setStats).catch(() => {}) }, [])

  const todayDraws = (stats?.todayVisits as number) ?? drawHistory.length
  const totalRevenue = drawHistory.reduce((sum, r) => sum + r.price, 0)

  // 各系列开盒统计
  const seriesStats = series.map((s) => {
    const count = drawHistory.filter((r) => r.seriesId === s.id).length
    return { ...s, count }
  }).sort((a, b) => b.count - a.count)

  // 稀有度分布
  const rarityDist = { SSR: 0, SR: 0, R: 0, N: 0 } as Record<string, number>
  drawHistory.forEach((r) => { rarityDist[r.rarity]++ })

  const statCards = [
    { label: '盲盒系列', value: series.length, color: '#4F6EF7', icon: '🎁' },
    { label: '今日开盒', value: todayDraws, color: '#10B981', icon: '📦' },
    { label: '总收入', value: `¥${(totalRevenue / 100).toFixed(2)}`, color: '#F59E0B', icon: '💰' },
    { label: '今日UV', value: String(stats?.todayUV ?? '--'), color: '#A855F7', icon: '👥' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">数据看板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs text-text-secondary mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系列开盒排行 */}
        <div className="bg-card rounded-card shadow-card p-5">
          <h2 className="font-bold text-sm mb-4">系列开盒排行</h2>
          <div className="space-y-2">
            {seriesStats.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-text-disabled">#{i + 1}</span>
                <div className="flex-1 h-7 bg-bg rounded-btn overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-btn transition-all duration-500 flex items-center px-3"
                    style={{ width: `${Math.max(5, s.count > 0 ? (s.count / Math.max(1, seriesStats[0].count)) * 100 : 0)}%` }}
                  >
                    <span className="text-xs text-white font-medium truncate">{s.name}</span>
                  </div>
                </div>
                <span className="w-10 text-right text-xs text-text-secondary">{s.count}次</span>
              </div>
            ))}
          </div>
        </div>

        {/* 稀有度分布 */}
        <div className="bg-card rounded-card shadow-card p-5">
          <h2 className="font-bold text-sm mb-4">稀有度分布</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'SSR', label: 'SSR 传说', color: '#F0B90B', bg: '#FFFBEB' },
              { key: 'SR', label: 'SR 史诗', color: '#A855F7', bg: '#FAF5FF' },
              { key: 'R', label: 'R 稀有', color: '#3B82F6', bg: '#EFF6FF' },
              { key: 'N', label: 'N 普通', color: '#9CA3AF', bg: '#F3F4F6' },
            ].map((item) => (
              <div key={item.key} className="p-4 rounded-card text-center" style={{ background: item.bg }}>
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {rarityDist[item.key] ?? 0}
                </div>
                <div className="text-xs text-text-secondary mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
