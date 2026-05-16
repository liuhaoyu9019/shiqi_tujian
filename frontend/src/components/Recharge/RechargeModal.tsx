import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { fetchRechargePackages, createRechargeOrder, payOrder } from '@/utils/api'

interface RechargePackage {
  id: number; amount: number; bonus: number; label: string; desc: string
}

interface Props {
  onClose: () => void
}

export default function RechargeModal({ onClose }: Props) {
  const user = useUserStore((s) => s.user)
  const addBalance = useUserStore((s) => s.addBalance)
  const [packages, setPackages] = useState<RechargePackage[]>([])
  const [loadingPkgs, setLoadingPkgs] = useState(true)

  useEffect(() => {
    fetchRechargePackages()
      .then((pkgs) => { setPackages(pkgs); setLoadingPkgs(false) })
      .catch(() => setLoadingPkgs(false))
  }, [])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [step, setStep] = useState<'select' | 'pay' | 'done'>('select')
  const [orderNo, setOrderNo] = useState('')

  const selected = packages.find((p) => p.id === selectedId)
  const balance = user?.balance ?? 0

  const handleRecharge = async () => {
    if (!selected || !user) return
    try {
      const order = await createRechargeOrder(user.id, selected.id)
      setOrderNo(order.orderNo)
      setStep('pay')
    } catch (e) {
      alert('创建订单失败：' + (e as Error).message)
    }
  }

  const handlePay = async () => {
    if (!selected || !user) return
    try {
      await payOrder(orderNo)
      const totalAdd = selected.amount + selected.bonus
      addBalance(totalAdd)
      setStep('done')
    } catch (e) {
      alert('支付失败：' + (e as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-modal shadow-modal p-6 w-full max-w-sm mx-4 modal-enter" onClick={(e) => e.stopPropagation()}>

        {step === 'select' && (
          <>
            <h2 className="font-bold text-lg mb-1">充值</h2>
            <p className="text-xs text-text-secondary mb-4">
              当前余额 <span className="font-mono text-primary font-bold">¥{(balance / 100).toFixed(2)}</span>
            </p>
            {loadingPkgs ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-card" />)}
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedId(pkg.id)}
                  className={`p-3 rounded-card border-2 text-left transition-colors ${
                    selectedId === pkg.id
                      ? 'border-primary bg-primary/[0.04]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="font-bold text-sm">{pkg.label}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{pkg.desc}</div>
                  {pkg.bonus > 0 && (
                    <div className="text-xs text-green-500 mt-0.5">+送 ¥{(pkg.bonus / 100).toFixed(0)}</div>
                  )}
                </button>
              ))}
            </div>
            )}
            <button
              onClick={handleRecharge}
              disabled={!selectedId}
              className={`w-full py-2.5 rounded-btn text-sm font-medium text-white transition-all ${
                selectedId
                  ? 'bg-gradient-to-r from-primary to-accent btn-press hover:opacity-90'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              确认充值
            </button>
          </>
        )}

        {step === 'pay' && selected && (
          <div className="text-center">
            <h2 className="font-bold text-lg mb-3">确认支付</h2>
            <div className="bg-bg rounded-card p-4 mb-4">
              <div className="text-sm text-text-secondary">充值金额</div>
              <div className="text-2xl font-bold text-primary font-mono mt-1">
                ¥{(selected.amount / 100).toFixed(2)}
              </div>
              {selected.bonus > 0 && (
                <div className="text-sm text-green-500 mt-1">
                  + 赠送 ¥{(selected.bonus / 100).toFixed(2)}
                </div>
              )}
              <div className="border-t border-gray-200 mt-3 pt-3 text-sm">
                到账金额：<span className="font-bold text-primary">
                  ¥{((selected.amount + selected.bonus) / 100).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-text-disabled mb-4">订单号：{orderNo}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-2.5 rounded-btn border border-gray-200 text-sm text-text-secondary hover:bg-bg"
              >
                返回
              </button>
              <button
                onClick={handlePay}
                className="flex-1 py-2.5 rounded-btn bg-gradient-to-r from-primary to-accent text-white text-sm font-medium btn-press"
              >
                立即支付
              </button>
            </div>
          </div>
        )}

        {step === 'done' && selected && (
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="font-bold text-lg mb-2">充值成功</h2>
            <p className="text-sm text-text-secondary mb-1">
              到账 ¥{((selected.amount + selected.bonus) / 100).toFixed(2)}
            </p>
            {selected.bonus > 0 && (
              <p className="text-xs text-green-500">含赠送 ¥{(selected.bonus / 100).toFixed(2)}</p>
            )}
            <p className="text-xs text-text-secondary mt-2">
              余额 ¥{((user?.balance ?? 0) / 100).toFixed(2)}
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 rounded-btn bg-primary text-white text-sm font-medium btn-press"
            >
              完成
            </button>
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-disabled hover:text-text-secondary text-lg leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
