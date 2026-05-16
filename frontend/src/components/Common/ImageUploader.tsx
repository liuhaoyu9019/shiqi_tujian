import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function ImageUploader({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragover, setDragover] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('仅支持图片格式：PNG、JPG、WebP、GIF')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      setUploading(false)
    }
    reader.onerror = () => {
      alert('图片读取失败')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleRemove = () => {
    onChange('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-secondary block">缩略图</label>

      {value ? (
        <div className="relative inline-block group">
          <img
            src={value}
            alt="缩略图"
            className="w-32 h-32 object-cover rounded-card border border-gray-200"
            onError={(e) => { (e.target as HTMLImageElement).src = '' }}
          />
          <div className="absolute inset-0 bg-black/50 rounded-card opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white text-xs text-primary rounded-btn hover:bg-gray-50"
            >
              替换
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-btn hover:bg-red-600"
            >
              删除
            </button>
          </div>
        </div>
      ) : uploading ? (
        <div className="w-full h-32 border-2 border-dashed border-primary/30 rounded-card bg-primary/[0.02] flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-disabled">读取中...</span>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`w-full h-32 border-2 border-dashed rounded-card flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragover ? 'border-primary bg-primary/[0.06]' : 'border-gray-200 hover:border-primary/40 hover:bg-bg'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              <span className="text-primary font-medium">点击上传</span> 或拖拽图片到此处
            </p>
            <p className="text-xs text-text-disabled mt-0.5">支持 PNG / JPG / WebP / GIF，最大 5MB</p>
          </div>
        </div>
      )}

      <input
        className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary text-text-secondary"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => {
          const v = e.target.value.trim()
          // 阻止 javascript: / data:text/html 等危险协议
          if (/^(javascript|data\s*:|vbscript):/i.test(v)) return
          onChange(v)
        }}
        placeholder="或直接粘贴图片URL地址 (仅 https:// 链接)"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
