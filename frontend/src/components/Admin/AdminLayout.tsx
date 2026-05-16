import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/admin', label: '📊 数据看板', exact: true },
  { path: '/admin/series', label: '🎁 系列管理' },
  { path: '/admin/items', label: '💎 藏品管理' },
  { path: '/admin/users', label: '👥 用户管理' },
  { path: '/admin/records', label: '📋 开盒记录' },
  { path: '/admin/recharges', label: '💰 充值管理' },
  { path: '/admin/stats', label: '📈 访问统计' },
]

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (item: typeof menuItems[0]) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  return (
    <div className="min-h-screen bg-bg flex">
      {/* 侧边栏 */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <Link to="/admin" className="h-14 flex items-center gap-2 px-5 border-b border-gray-100">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ⚙️ 后台管理
          </span>
        </Link>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-btn text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-text-disabled hover:text-text-secondary transition-colors"
          >
            ← 返回商城
          </Link>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
