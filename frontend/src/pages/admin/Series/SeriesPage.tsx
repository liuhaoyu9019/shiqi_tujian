import { useState, useEffect } from 'react'
import { useBoxStore } from '@/stores/boxStore'
import { adminCreateSeries, adminUpdateSeries, adminDeleteSeries } from '@/utils/api'
import ImageUploader from '@/components/Common/ImageUploader'
import type { BoxSeries } from '@/types'

const emptyForm = { name: '', description: '', price: 2990, totalItems: 16, isHot: false, isNew: false, coverUrl: '' }

export default function SeriesPage() {
  const { series, loading, error, loadSeries, updateSeries, removeSeries } = useBoxStore()
  const [editing, setEditing] = useState<BoxSeries | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => { loadSeries() }, [loadSeries])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (s: BoxSeries) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description, price: s.price, totalItems: s.totalItems, isHot: s.isHot, isNew: s.isNew, coverUrl: s.coverUrl || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        const updated = await adminUpdateSeries(editing.id, form)
        updateSeries(updated)
      } else {
        const created = await adminCreateSeries(form)
        // 刷新列表获取最新数据
        await loadSeries()
      }
      resetForm()
    } catch (e) {
      alert('保存失败：' + (e as Error).message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定下架该系列？')) return
    try {
      await adminDeleteSeries(id)
      removeSeries(id)
    } catch (e) {
      alert('下架失败：' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">系列管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-primary text-white text-sm rounded-btn btn-press hover:opacity-90"
        >
          + 新增系列
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={resetForm}>
          <div className="bg-card rounded-modal shadow-modal p-6 w-full max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold">{editing ? '编辑系列' : '新增系列'}</h2>
            <div>
              <label className="text-xs text-text-secondary block mb-1">系列名称</label>
              <input className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：星辰幻想" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">描述</label>
              <textarea className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="系列描述文案" />
            </div>
            <ImageUploader value={form.coverUrl} onChange={(url) => setForm({ ...form, coverUrl: url })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">价格 (分)</label>
                <input type="number" className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">藏品总数</label>
                <input type="number" className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={form.totalItems} onChange={(e) => setForm({ ...form, totalItems: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isHot} onChange={(e) => setForm({ ...form, isHot: e.target.checked })} /> 🔥 热门标记
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> ✨ 新品标记
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-2 rounded-btn border border-gray-200 text-sm text-text-secondary hover:bg-bg"
                disabled={saving}>取消</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 rounded-btn bg-primary text-white text-sm btn-press hover:opacity-90 disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-card shadow-card p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
        </div>
      ) : error ? (
        <div className="bg-card rounded-card shadow-card text-center py-10">
          <p className="text-text-disabled text-sm">加载失败：{error}</p>
          <button onClick={loadSeries} className="mt-2 text-sm text-primary hover:underline">重试</button>
        </div>
      ) : (
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          {series.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-text-disabled text-sm">暂无系列，点击上方按钮新增</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">系列</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">描述</th>
                  <th className="text-right px-4 py-3 font-medium">价格</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">藏品数</th>
                  <th className="text-center px-4 py-3 font-medium">标签</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {series.map((s) => (
                  <tr key={s.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell max-w-xs truncate">{s.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary">¥{(s.price / 100).toFixed(1)}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">{s.totalItems}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {s.isHot && <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-tag">🔥</span>}
                        {s.isNew && <span className="text-xs bg-green-50 text-green-500 px-1.5 py-0.5 rounded-tag">✨</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(s)} className="px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded-btn transition-colors">编辑</button>
                        <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded-btn transition-colors">下架</button>
                      </div>
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
