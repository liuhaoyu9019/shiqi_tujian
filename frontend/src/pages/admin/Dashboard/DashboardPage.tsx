import { useState, useEffect } from 'react'
import { useBreedStore } from '@/stores/boxStore'
import { fetchStatsDashboard } from '@/utils/api'

export default function DashboardPage() {
  const breeds = useBreedStore((s) => s.breeds)
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)

  useEffect(() => { fetchStatsDashboard().then(setStats).catch(() => {}) }, [])

  const statCards = [
    { label: '品种数', value: breeds.length, color: '#4F6EF7', icon: '🐾' },
    { label: '今日UV', value: String(stats?.todayUV ?? '--'), color: '#A855F7', icon: '👥' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">数据看板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}
