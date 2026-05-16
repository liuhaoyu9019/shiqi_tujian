import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '图鉴' },
  ]

  return (
    <header className="min-h-14 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-4 sm:px-6 py-2 sticky top-0 z-50">
      {/* 左侧 Logo + 导航 */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
          石器怀旧宠物图鉴
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

      {/* 右侧占位 */}
      <div className="shrink-0" />
    </header>
  )
}
