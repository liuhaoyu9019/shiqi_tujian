import { RARITY_CONFIG } from '@/types'
import type { DrawRecord } from '@/types'

interface Props {
  record: DrawRecord
  onClose: () => void
  onDrawAgain: () => void
}

export default function DrawModal({ record, onClose, onDrawAgain }: Props) {
  const cfg = RARITY_CONFIG[record.rarity]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-enter bg-card rounded-modal shadow-modal p-8 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
        {/* 3D藏品占位 */}
        <div
          className="w-48 h-48 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ background: `radial-gradient(circle, ${cfg.bg} 0%, transparent 70%)` }}
        >
          <div className="text-7xl animate-bounce">
            {record.rarity === 'SSR' || record.rarity === 'UR' ? '💎' :
             record.rarity === 'SR' ? '🔮' :
             record.rarity === 'R' ? '💠' : '📦'}
          </div>
        </div>

        {/* 稀有度标签 */}
        <span
          className="inline-block px-3 py-0.5 rounded-tag text-xs font-medium mb-3"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {'⭐'.repeat(cfg.stars)} {cfg.label}
        </span>

        {/* 藏品名称 */}
        <h2
          className="text-2xl font-bold mb-1"
          style={record.rarity === 'SSR' || record.rarity === 'UR' ? {
            background: 'linear-gradient(90deg, #F0B90B 0%, #FFF7D6 50%, #F0B90B 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 2s ease-in-out infinite',
          } : {}}
        >
          {record.itemName}
        </h2>

        {record.isFirstGet && (
          <p className="text-xs text-green-500 mb-4">🎉 首次获得该藏品!</p>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-btn border border-gray-200 text-sm text-text-secondary hover:bg-bg transition-colors"
          >
            收下
          </button>
          <button
            onClick={onDrawAgain}
            className="flex-1 py-2.5 rounded-btn text-sm text-white font-medium bg-gradient-to-r from-primary to-accent btn-press hover:opacity-90 transition-opacity"
          >
            再开一次
          </button>
        </div>
      </div>
    </div>
  )
}
