import { useState, useEffect } from 'react'

interface RechargeRecord {
  id: number
  orderNo: string
  userId: number
  nickname: string
  packageId?: number
  amount: number
  bonus: number
  totalAmount: number
  status: number
  paidAt: string | null
  createdAt: string
}

const statusMap: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '待支付', color: '#F59E0B', bg: '#FFFBEB' },
  2: { label: '已支付', color: '#10B981', bg: '#ECFDF5' },
  3: { label: '已取消', color: '#9CA3AF', bg: '#F3F4F6' },
}

export default function RechargesPage() {
  const [orders, setOrders] = useState<RechargeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('@/utils/api').then(({ adminListRecharges }) => {
      adminListRecharges().then(setOrders).catch(() => {}).finally(() => setLoading(false))
    }).catch(() => setLoading(false))
  }, [])

  const totalToday = orders
    .filter((o) => o.status === 2)
    .reduce((s, o) => s + o.amount, 0)
  const uniqueUsers = new Set(orders.filter((o) => o.status === 2).map((o) => o.userId)).size

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">充值管理</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '今日充值', value: `¥${(totalToday / 100).toFixed(2)}`, icon: '💰', color: '#10B981' },
          { label: '充值笔数', value: String(orders.filter((o) => o.status === 2).length), icon: '📝', color: '#4F6EF7' },
          { label: '充值用户', value: String(uniqueUsers), icon: '👥', color: '#A855F7' },
        ].map((card) => (
          <div key={card.label} className="bg-card rounded-card shadow-card p-4">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-lg font-bold" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs text-text-secondary">{card.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-card rounded-card shadow-card p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-9" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-text-disabled text-sm">暂无充值记录</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">订单号</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">用户</th>
                  <th className="text-right px-4 py-3 font-medium">充值金额</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">赠送</th>
                  <th className="text-right px-4 py-3 font-medium">到账</th>
                  <th className="text-center px-4 py-3 font-medium">状态</th>
                  <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const st = statusMap[o.status]
                  return (
                    <tr key={o.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{o.orderNo}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm">{o.nickname}</span>
                        <span className="text-xs text-text-disabled ml-1">ID:{o.userId}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">¥{(o.amount / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono hidden md:table-cell text-green-500">
                        {o.bonus > 0 ? `+¥${(o.bonus / 100).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                        ¥{(o.totalAmount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-tag" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text-secondary hidden lg:table-cell">
                        {o.paidAt ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
