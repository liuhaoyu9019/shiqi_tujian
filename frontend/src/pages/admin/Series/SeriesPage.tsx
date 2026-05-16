import { useState, useEffect } from 'react'
import { useBreedStore } from '@/stores/boxStore'
import { adminCreateSeries, adminUpdateSeries, adminDeleteSeries } from '@/utils/api'
import ImageUploader from '@/components/Common/ImageUploader'
import type { PetBreed } from '@/types'

const emptyForm = { name: '', description: '', coverUrl: '' }

export default function SeriesPage() {
  const { breeds, loading, error, loadBreeds, updateBreed, removeBreed } = useBreedStore()
  const [editing, setEditing] = useState<PetBreed | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => { loadBreeds() }, [loadBreeds])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (s: PetBreed) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description, coverUrl: s.coverUrl || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        const updated = await adminUpdateSeries(editing.id, form)
        updateBreed(updated)
      } else {
        await adminCreateSeries(form)
        await loadBreeds()
      }
      resetForm()
    } catch (e) {
      alert('保存失败：' + (e as Error).message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该品种？')) return
    try {
      await adminDeleteSeries(id)
      removeBreed(id)
    } catch (e) {
      alert('删除失败：' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">品种管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-primary text-white text-sm rounded-btn btn-press hover:opacity-90"
        >
          + 新增品种
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={resetForm}>
          <div className="bg-card rounded-modal shadow-modal p-6 w-full max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold">{editing ? '编辑品种' : '新增品种'}</h2>
            <div>
              <label className="text-xs text-text-secondary block mb-1">品种名称</label>
              <input className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：金毛寻回犬" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">描述</label>
              <textarea className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="品种描述文案" />
            </div>
            <ImageUploader value={form.coverUrl} onChange={(url) => setForm({ ...form, coverUrl: url })} />
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
          <button onClick={loadBreeds} className="mt-2 text-sm text-primary hover:underline">重试</button>
        </div>
      ) : (
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          {breeds.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">{'🐾'}</div>
              <p className="text-text-disabled text-sm">暂无品种，点击上方按钮新增</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">品种</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">描述</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {breeds.map((s) => (
                  <tr key={s.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell max-w-xs truncate">{s.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(s)} className="px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded-btn transition-colors">编辑</button>
                        <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded-btn transition-colors">删除</button>
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
