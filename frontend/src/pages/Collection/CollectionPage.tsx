import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchItemsBySeries, fetchSeriesById } from '@/utils/api'
import type { PetBreed, PetImage } from '@/types'

export default function CollectionPage() {
  const [searchParams] = useSearchParams()
  const seriesId = searchParams.get('seriesId')
  const [breed, setBreed] = useState<PetBreed | null>(null)
  const [images, setImages] = useState<PetImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!seriesId) {
      setLoading(false)
      setError('未指定品种')
      return
    }
    const id = Number(seriesId)
    setLoading(true)
    setError(null)
    Promise.all([fetchSeriesById(id), fetchItemsBySeries(id)])
      .then(([breedData, imagesData]) => {
        setBreed(breedData)
        setImages(imagesData)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [seriesId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (error || !breed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-gray-400 text-lg">{error || '品种不存在'}</div>
        <Link to="/" className="text-blue-500 hover:underline">返回图鉴首页</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 品种信息头 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/" className="text-blue-500 hover:underline text-sm mb-4 inline-block">返回图鉴首页</Link>
          <div className="flex items-start gap-6 mt-4">
            {breed.coverUrl && (
              <img
                src={breed.coverUrl}
                alt={breed.name}
                className="w-32 h-32 rounded-xl object-contain bg-gray-100"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{breed.name}</h1>
              {breed.description && (
                <p className="text-gray-500 mt-2 max-w-2xl">{breed.description}</p>
              )}
              <p className="text-gray-400 text-sm mt-3">共 {images.length} 张图片</p>
            </div>
          </div>
        </div>
      </div>

      {/* 图片网格 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {images.length === 0 ? (
          <div className="text-center text-gray-400 py-20">暂无品种图片</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {img.thumbnailUrl ? (
                  <img
                    src={img.thumbnailUrl}
                    alt={img.name}
                    className="w-full aspect-square object-contain bg-gray-50 p-2"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                    {'🐾'}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-700 truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
