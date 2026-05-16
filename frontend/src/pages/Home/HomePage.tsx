import { useEffect } from 'react'
import { useBreedStore } from '@/stores/boxStore'
import BoxCard from '@/components/BoxCard/BoxCard'

export default function HomePage() {
  const { breeds, loading, error, loadBreeds } = useBreedStore()

  useEffect(() => { loadBreeds() }, [loadBreeds])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="relative bg-gradient-to-r from-primary via-accent to-primary-dark rounded-card overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 text-7xl">{'🦕'}</div>
          <div className="absolute bottom-2 right-8 text-7xl">{'🦕'}</div>
          <div className="absolute top-1/2 left-1/3 text-6xl transform -translate-y-1/2">{'🦕'}</div>
        </div>
        <div className="relative px-8 py-10 text-white">
          <h1 className="text-2xl font-bold mb-2">{'🦕'} 石器怀旧宠物图鉴</h1>
          <p className="text-white/80 text-sm mb-4">探索丰富的宠物品种，了解每一个独特生命</p>
          <div className="flex gap-3 text-sm">
            <span className="bg-white/20 backdrop-blur rounded-tag px-3 py-1">官方图鉴 纯公益</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button
          className="px-4 py-2 rounded-btn text-sm font-medium bg-primary text-white"
        >
          全部品种
        </button>
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
          <button onClick={loadBreeds} className="mt-3 text-sm text-primary hover:underline">重试</button>
        </div>
      ) : breeds.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">{'🦕'}</div>
          <p className="text-text-disabled">暂无品种数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {breeds.map((s) => (
            <BoxCard key={s.id} series={s} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="text-center py-6 px-4">
          <p className="text-xs text-gray-400 leading-relaxed">本工具为玩家自制，非官方，素材仅供怀旧参考，版权归原方所有，侵权请联系删除。</p>
        </div>
      )}
    </div>
  )
}
