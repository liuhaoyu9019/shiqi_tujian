import { Link } from 'react-router-dom'
import type { BoxSeries } from '@/types'

interface Props {
  series: BoxSeries
}

export default function BoxCard({ series }: Props) {
  return (
    <Link
      to={`/draw/${series.id}`}
      className="card-hover bg-card rounded-card shadow-card overflow-hidden group"
    >
      {/* 封面图 */}
      <div className="relative h-40 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center overflow-hidden p-4">
        {series.coverUrl ? (
          <img src={series.coverUrl} alt={series.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">
            🎁
          </div>
        )}
        {series.isHot && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-tag">
            🔥 热门
          </span>
        )}
        {series.isNew && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-tag">
            ✨ 新品
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-3 space-y-1.5">
        <h3 className="font-medium text-sm text-text-primary">{series.name}</h3>
        <p className="text-xs text-text-secondary line-clamp-1">{series.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary font-mono">
            ¥{(series.price / 100).toFixed(1)}
          </span>
          <span className="text-xs text-text-disabled">{series.totalItems}款</span>
        </div>
      </div>
    </Link>
  )
}
