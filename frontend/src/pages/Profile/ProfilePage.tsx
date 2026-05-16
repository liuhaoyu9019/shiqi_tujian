import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/userStore'
import { useDrawStore } from '@/stores/drawStore'
import { RARITY_CONFIG } from '@/types'
import RechargeModal from '@/components/Recharge/RechargeModal'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const drawHistory = useDrawStore((s) => s.drawHistory)
  const [showRecharge, setShowRecharge] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 个人信息卡片 */}
      <div className="bg-card rounded-card shadow-card p-6 mb-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold mb-3">
          {(user?.nickname ?? '?')[0]}
        </div>
        <h2 className="text-lg font-bold">{user?.nickname}</h2>
        <p className="text-xs text-text-secondary mt-1">Lv.{user?.level} · 经验 {user?.exp}/10000</p>

        <div className="mt-4 bg-bg rounded-card p-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-text-secondary">💰 我的余额</span>
            <span className="text-xl font-bold text-primary font-mono">
              ¥{((user?.balance ?? 0) / 100).toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => setShowRecharge(true)}
            className="mt-2 px-6 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-sm rounded-btn btn-press"
          >
            充值
          </button>
        </div>
      </div>

      {/* 开盒历史 */}
      <div className="bg-card rounded-card shadow-card p-5">
        <h3 className="font-bold text-base mb-4">开盒记录</h3>

        {drawHistory.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-sm text-text-disabled mb-3">还没有开盒记录</p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary font-medium hover:underline"
            >
              去商城开盒 →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {drawHistory.map((record) => {
              const cfg = RARITY_CONFIG[record.rarity]
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-card hover:bg-bg transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-tag flex items-center justify-center text-lg shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    {record.rarity === 'SSR' ? '💎' : record.rarity === 'SR' ? '🔮' : record.rarity === 'R' ? '💠' : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{record.itemName}</p>
                    <p className="text-xs text-text-disabled">
                      {new Date(record.createdAt).toLocaleString('zh-CN')} · ¥{(record.price / 100).toFixed(1)}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-tag shrink-0"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  )
}
