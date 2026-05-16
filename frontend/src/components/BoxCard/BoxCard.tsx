import { Link } from 'react-router-dom'
import type { PetBreed } from '@/types'

interface Props {
  series: PetBreed
}

export default function BoxCard({ series }: Props) {
  return (
    <Link
      to={`/collection?seriesId=${series.id}`}
      className="card-hover bg-card rounded-card shadow-card overflow-hidden group"
    >
      {/* 封面图 */}
      <div className="relative h-40 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center overflow-hidden p-4">
        {series.coverUrl ? (
          <img src={series.coverUrl} alt={series.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">

          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-3 space-y-1.5">
        <h3 className="font-medium text-sm text-text-primary">{series.name}</h3>
        <p className="text-xs text-text-secondary line-clamp-2">{series.description}</p>
      </div>
    </Link>
  )
}
