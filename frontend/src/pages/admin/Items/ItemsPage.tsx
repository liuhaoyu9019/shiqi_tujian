import { useState, useEffect } from 'react'
import { useBoxStore } from '@/stores/boxStore'
import { RARITY_CONFIG } from '@/types'
import ImageUploader from '@/components/Common/ImageUploader'
import { adminListItems, adminCreateItem, adminUpdateItem, adminDeleteItem } from '@/utils/api'
import type { ItemDef, Rarity } from '@/types'

interface ItemForm {
  seriesId: number
  name: string
  rarity: Rarity
  probability: number
  thumbnailUrl: string
  modelUrl: string
}

const emptyForm: ItemForm = {
  seriesId: 1,
  name: '',
  rarity: 'N',
  probability: 0.05,
  thumbnailUrl: '',
  modelUrl: '',
}

export default function ItemsPage() {
  const series = useBoxStore((s) => s.series)
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null)
  const [items, setItems] = useState<ItemDef[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemDef | null>(null)
  const [form, setForm] = useState<ItemForm>({ ...emptyForm, seriesId: series[0]?.id ?? 1 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadSeries() }, [])
  useEffect(() => { loadItems() }, [selectedSeriesId])

  async function loadSeries() {
    const s = useBoxStore.getState()
    if (s.series.length === 0) await s.loadSeries()
  }

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const result = await adminListItems(selectedSeriesId ?? undefined)
      setItems(result.records)
    } catch (e) {
      setError((e as Error).message)
      setItems([])
    }
    setLoading(false)
  }

  const filteredItems = items

  const resetForm = () => {
    setForm({ ...emptyForm, seriesId: series[0]?.id ?? 1 })
    setEditingItem(null)
    setShowForm(false)
  }

  const handleEdit = (item: ItemDef) => {
    setEditingItem(item)
    setForm({
      seriesId: item.seriesId,
      name: item.name,
      rarity: item.rarity,
      probability: item.probability,
      thumbnailUrl: item.thumbnailUrl || '',
      modelUrl: item.modelUrl || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editingItem) {
        await adminUpdateItem(editingItem.id, form)
      } else {
        await adminCreateItem(form)
      }
      resetForm()
      await loadItems()
    } catch (e) {
      alert('保存失败：' + (e as Error).message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该藏品？')) return
    try {
      await adminDeleteItem(id)
      await loadItems()
    } catch (e) {
      alert('删除失败：' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">藏品管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-primary text-white text-sm rounded-btn btn-press hover:opacity-90"
        >
          + 新增藏品
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedSeriesId(null)}
          className={`px-3 py-1.5 rounded-btn text-sm transition-colors ${
            selectedSeriesId === null ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:text-text-primary'
          }`}
        >
          全部
        </button>
        {series.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSeriesId(s.id)}
            className={`px-3 py-1.5 rounded-btn text-sm transition-colors ${
              selectedSeriesId === s.id ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:text-text-primary'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8" onClick={resetForm}>
          <div className="bg-card rounded-modal shadow-modal p-6 w-full max-w-lg mx-4 space-y-4 my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">{editingItem ? '编辑藏品' : '新增藏品'}</h2>

            <div>
              <label className="text-xs text-text-secondary block mb-1">所属系列</label>
              <select
                className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={form.seriesId}
                onChange={(e) => setForm({ ...form, seriesId: Number(e.target.value) })}
              >
                {series.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-secondary block mb-1">藏品名称</label>
              <input
                className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：星尘独角兽"
              />
            </div>

            <ImageUploader
              value={form.thumbnailUrl}
              onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">稀有度</label>
                <select
                  className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={form.rarity}
                  onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}
                >
                  {(['N', 'R', 'SR', 'SSR', 'UR'] as Rarity[]).map((r) => (
                    <option key={r} value={r}>{RARITY_CONFIG[r].label} ({r})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">掉落概率 (0~1)</label>
                <input
                  type="number" step="0.01" min="0" max="1"
                  className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={form.probability}
                  onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-secondary block mb-1">3D模型文件</label>
              <input
                className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={form.modelUrl}
                onChange={(e) => setForm({ ...form, modelUrl: e.target.value })}
                placeholder="输入 .glb / .gltf 模型文件URL"
              />
              <p className="text-xs text-text-disabled mt-1">支持 glTF/GLB 格式，建议使用 Draco 压缩</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-2.5 rounded-btn border border-gray-200 text-sm text-text-secondary hover:bg-bg transition-colors">取消</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-btn bg-primary text-white text-sm font-medium btn-press hover:opacity-90 transition-opacity">保存</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-card rounded-card shadow-card p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-card rounded-card shadow-card">
          <p className="text-text-disabled text-sm">加载失败：{error}</p>
          <button onClick={loadItems} className="mt-2 text-sm text-primary hover:underline">重试</button>
        </div>
      ) : (
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">💎</div>
              <p className="text-text-disabled text-sm">暂无藏品，点击上方按钮新增</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">藏品</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">系列</th>
                  <th className="text-center px-4 py-3 font-medium">稀有度</th>
                  <th className="text-right px-4 py-3 font-medium">概率</th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">缩略图</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => {
                  const cfg = RARITY_CONFIG[item.rarity]
                  const seriesName = series.find((s) => s.id === item.seriesId)?.name ?? '未知'
                  return (
                    <tr key={item.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.name} className="w-8 h-8 rounded-btn object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          ) : (
                            <span className="text-lg">
                              {item.rarity === 'SSR' ? '💎' : item.rarity === 'SR' ? '🔮' : item.rarity === 'R' ? '💠' : '📦'}
                            </span>
                          )}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{seriesName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-tag" style={{ color: cfg.color, background: cfg.bg }}>
                          {'⭐'.repeat(cfg.stars)} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{(item.probability * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="w-10 h-10 rounded-btn object-cover mx-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        ) : (
                          <span className="text-xs text-text-disabled">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded-btn transition-colors">编辑</button>
                          <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded-btn transition-colors">删除</button>
                        </div>
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
