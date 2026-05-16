import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/userStore'
import RechargeModal from '@/components/Recharge/RechargeModal'

export default function Header() {
  const location = useLocation()
  const user = useUserStore((s) => s.user)
  const [showRecharge, setShowRecharge] = useState(false)

  const navItems = [
    { path: '/', label: '商城' },
    { path: '/collection', label: '藏馆' },
  ]

  return (
    <>
      <header className="min-h-14 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-4 sm:px-6 py-2 sticky top-0 z-50">
        {/* 左侧 Logo + 导航 */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
            🎁 3D盲盒
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-btn text-xs sm:text-sm whitespace-nowrap transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-bg'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 右侧 余额 + 用户 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 余额 */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-bg rounded-tag pl-2 pr-1 sm:pl-3 sm:pr-1.5 py-1 sm:py-1.5">
            <span className="text-xs text-text-secondary hidden sm:inline">💰</span>
            <span className="text-xs sm:text-sm font-bold text-primary font-mono whitespace-nowrap">
              ¥{((user?.balance ?? 0) / 100).toFixed(2)}
            </span>
            <button
              onClick={() => setShowRecharge(true)}
              className="text-xs text-primary border border-primary rounded-tag px-1.5 sm:px-2 py-0.5 whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
            >
              充值
            </button>
          </div>

          {/* 用户头像 */}
          <Link
            to="/profile"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs sm:text-sm font-medium">
              {(user?.nickname ?? '?')[0]}
            </div>
            <span className="text-xs sm:text-sm text-text-secondary hidden md:block whitespace-nowrap">
              {user?.nickname}
            </span>
          </Link>
        </div>
      </header>

      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </>
  )
}
