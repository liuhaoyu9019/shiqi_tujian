import { useState, useEffect } from 'react'

interface UserRecord {
  id: number
  nickname: string
  phone: string
  level: number
  balance: number
  drawCount: number
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    import('@/utils/api').then(({ adminListUsers }) => {
      adminListUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false))
    }).catch(() => setLoading(false))
  }, [])

  const filtered = search
    ? users.filter((u) => u.nickname.includes(search) || u.phone.includes(search))
    : users

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">用户管理</h1>
        <input
          className="border border-gray-200 rounded-btn px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bg-card rounded-card shadow-card p-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-text-disabled text-sm">暂无用户数据</p>
              <p className="text-text-disabled text-xs mt-1">用户注册后将在此展示</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">用户</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">手机号</th>
                  <th className="text-center px-4 py-3 font-medium">等级</th>
                  <th className="text-right px-4 py-3 font-medium">余额</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">开盒次数</th>
                  <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">注册日期</th>
                  <th className="text-center px-4 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {u.nickname[0]}
                        </div>
                        <span className="font-medium">{u.nickname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{u.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-tag">Lv.{u.level}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-primary">¥{(u.balance / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">{u.drawCount}次</td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">{u.createdAt}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-green-50 text-green-500 px-2 py-0.5 rounded-tag">正常</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
