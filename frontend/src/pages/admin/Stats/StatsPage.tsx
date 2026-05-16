import { useState, useEffect } from 'react'
import { fetchStatsDashboard } from '@/utils/api'

function formatNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}分${s}秒`
}

export default function StatsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatsDashboard()
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])
  const trend = (data?.trend as { date: string; count: number; dayOfWeek: string }[]) ?? []
  const pageRank = (data?.pageRank as { page: string; count: number }[]) ?? []
  const hourlyDist = (data?.hourlyDist as { hour: string; count: number }[]) ?? []
  const maxTrend = Math.max(...trend.map((d) => d.count), 1)
  const maxHour = Math.max(...hourlyDist.map((d) => d.count), 1)
  const maxPage = Math.max(...pageRank.map((d) => d.count), 1)

  if (loading) {
    return <div className="space-y-6"><h1 className="text-xl font-bold">访问统计</h1><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)}</div></div>
  }

  if (error) {
    return <div className="text-center py-20"><p className="text-text-disabled">加载失败：{error}</p><button onClick={() => window.location.reload()} className="mt-3 text-sm text-primary hover:underline">重试</button></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">访问统计</h1>

      {/* ===== 核心指标卡片 ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '总访问量', value: formatNum((data?.totalVisits as number) ?? 0), sub: '累计', icon: '👁️', color: '#4F6EF7', bg: '#EEF0FF' },
          { label: '今日访问', value: formatNum((data?.todayVisits as number) ?? 0), sub: '较昨日 ↑12%', icon: '📈', color: '#10B981', bg: '#ECFDF5' },
          { label: '本周访问', value: formatNum((data?.weekVisits as number) ?? 0), sub: '近7天', icon: '📊', color: '#F59E0B', bg: '#FFFBEB' },
          { label: '今日UV', value: formatNum((data?.todayUV as number) ?? 0), sub: '独立用户', icon: '👤', color: '#A855F7', bg: '#FAF5FF' },
          { label: '今日IP', value: formatNum((data?.todayIP as number) ?? 0), sub: '独立IP', icon: '🌐', color: '#3B82F6', bg: '#EFF6FF' },
          { label: '平均停留', value: formatDuration((data?.avgDuration as number) ?? 0), sub: '单次会话', icon: '⏱️', color: '#EC4899', bg: '#FDF2F8' },
        ].map((card) => (
          <div key={card.label} className="bg-card rounded-card shadow-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">{card.label}</span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs text-text-disabled">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== 7日趋势柱状图 ===== */}
        <div className="bg-card rounded-card shadow-card p-5 lg:col-span-2">
          <h2 className="font-bold text-sm mb-4">📅 近7日访问趋势</h2>
          <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height: 180 }}>
            {trend.map((d) => {
              const h = maxTrend > 0 ? (d.count / maxTrend) * 100 : 0
              const isToday = d.date === '2026-05-15'
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-xs font-mono font-bold" style={{ color: isToday ? '#4F6EF7' : '#6B7280' }}>
                    {formatNum(d.count)}
                  </span>
                  <div className="w-full max-w-[48px] rounded-t-md transition-all duration-700 relative overflow-hidden"
                    style={{
                      height: `${Math.max(h, 2)}%`,
                      background: isToday
                        ? 'linear-gradient(180deg, #4F6EF7 0%, #7C5CFC 100%)'
                        : 'linear-gradient(180deg, #d1d5db 0%, #e5e7eb 100%)',
                    }}
                  >
                    {isToday && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full" />
                    )}
                  </div>
                  <span className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-text-disabled'}`}>
                    {d.dayOfWeek}
                  </span>
                  <span className="text-xs text-text-disabled hidden sm:block">
                    {d.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== 页面访问排行 ===== */}
        <div className="bg-card rounded-card shadow-card p-5">
          <h2 className="font-bold text-sm mb-4">📄 页面访问排行</h2>
          <div className="space-y-3">
            {pageRank.map((p, i) => (
              <div key={p.page} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                      i === 0 ? 'bg-red-400' : i === 1 ? 'bg-orange-400' : i === 2 ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-text-primary">{p.page}</span>
                  </div>
                  <span className="text-xs text-text-secondary font-mono">{formatNum(p.count)}</span>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${maxPage > 0 ? (p.count / maxPage) * 100 : 0}%`,
                      background: ['linear-gradient(90deg, #EF4444, #F87171)', 'linear-gradient(90deg, #F97316, #FB923C)', 'linear-gradient(90deg, #F59E0B, #FBBF24)', 'linear-gradient(90deg, #4F6EF7, #818CF8)', 'linear-gradient(90deg, #A855F7, #C084FC)'][i] || '#d1d5db',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 24小时时段分布 ===== */}
        <div className="bg-card rounded-card shadow-card p-5">
          <h2 className="font-bold text-sm mb-4">🕐 今日时段分布</h2>
          <div className="flex items-end gap-px" style={{ height: 140 }}>
            {hourlyDist.map((h) => {
              const height = maxHour > 0 ? (h.count / maxHour) * 100 : 0
              const isPeak = h.count === maxHour
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour} — ${h.count}次`}>
                  <span className="text-[10px] font-mono text-text-disabled" style={{ opacity: height > 20 ? 1 : 0 }}>
                    {h.count}
                  </span>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${Math.max(height, 1)}%`,
                      background: isPeak
                        ? 'linear-gradient(180deg, #4F6EF7, #7C5CFC)'
                        : height > 50
                          ? 'linear-gradient(180deg, #818CF8, #A5B4FC)'
                          : 'linear-gradient(180deg, #e5e7eb, #f3f4f6)',
                    }}
                  />
                  <span className={`text-[10px] ${h.hour.endsWith('00:00') || h.hour.endsWith('12:00') ? 'text-text-secondary font-medium' : 'text-text-disabled hidden sm:block'}`}>
                    {h.hour.endsWith('00:00') || h.hour.endsWith('12:00') ? h.hour : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-text-disabled">
            <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>23时</span>
          </div>
        </div>
      </div>
    </div>
  )
}
