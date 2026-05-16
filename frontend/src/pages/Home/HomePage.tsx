import { useState, useEffect } from 'react'
import { useBoxStore } from '@/stores/boxStore'
import BoxCard from '@/components/BoxCard/BoxCard'

export default function HomePage() {
  const { series, loading, error, loadSeries } = useBoxStore()
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'new'>('all')

  useEffect(() => { loadSeries() }, [loadSeries])

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'hot' as const, label: '🔥 热门' },
    { key: 'new' as const, label: '✨ 新品' },
  ]

  const filtered = (() => {
    if (activeTab === 'hot') return series.filter((s) => s.isHot)
    if (activeTab === 'new') return series.filter((s) => s.isNew)
    return series
  })()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="relative bg-gradient-to-r from-primary via-accent to-primary-dark rounded-card overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 text-7xl">🎁</div>
          <div className="absolute bottom-2 right-8 text-7xl">💎</div>
          <div className="absolute top-1/2 left-1/3 text-6xl transform -translate-y-1/2">✨</div>
        </div>
        <div className="relative px-8 py-10 text-white">
          <h1 className="text-2xl font-bold mb-2">探索盲盒世界</h1>
          <p className="text-white/80 text-sm mb-4">打开属于你的神秘惊喜，收集独一无二的虚拟藏品</p>
          <div className="flex gap-3 text-sm">
            <span className="bg-white/20 backdrop-blur rounded-tag px-3 py-1">🎯 全新系列上线</span>
            <span className="bg-white/20 backdrop-blur rounded-tag px-3 py-1">🎉 新人首抽半价</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-btn text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-56" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-text-disabled">加载失败：{error}</p>
          <button onClick={loadSeries} className="mt-3 text-sm text-primary hover:underline">重试</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <BoxCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  )
}
