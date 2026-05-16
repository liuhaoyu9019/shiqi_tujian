import type { ApiResponse, PetBreed, PetImage } from '@/types'

const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json: ApiResponse<T> = await res.json()
  if (json.code !== 200) throw new Error(json.message || '请求失败')
  return json.data
}

// ==================== 品种接口 ====================
export function fetchSeries(): Promise<PetBreed[]> {
  return request<PetBreed[]>('/box/series')
}
export function fetchSeriesById(id: number): Promise<PetBreed> {
  return request<PetBreed>(`/box/series/${id}`)
}
export function fetchItemsBySeries(seriesId: number): Promise<PetImage[]> {
  return request<PetImage[]>(`/box/series/${seriesId}/items`)
}

// ==================== 统计接口 ====================
export function fetchStatsDashboard(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>('/admin/stats/dashboard')
}

// ==================== 后台品种管理 ====================
export function adminListSeries(): Promise<PetBreed[]> {
  return request<PetBreed[]>('/box/series')
}
export function adminCreateSeries(data: Partial<PetBreed>): Promise<PetBreed> {
  return request<PetBreed>('/admin/series', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
export function adminUpdateSeries(id: number, data: Partial<PetBreed>): Promise<PetBreed> {
  return request<PetBreed>(`/admin/series/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
export function adminDeleteSeries(id: number): Promise<void> {
  return request<void>(`/admin/series/${id}`, { method: 'DELETE' })
}

// ==================== 后台图片管理 ====================
export function adminListItems(seriesId?: number, page = 1, size = 50): Promise<{ records: PetImage[]; total: number }> {
  const params = new URLSearchParams()
  if (seriesId) params.set('seriesId', String(seriesId))
  params.set('page', String(page))
  params.set('size', String(size))
  return request<{ records: PetImage[]; total: number }>(`/admin/items?${params}`)
}
export function adminCreateItem(data: Partial<PetImage>): Promise<PetImage> {
  return request<PetImage>('/admin/items', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
export function adminUpdateItem(id: number, data: Partial<PetImage>): Promise<PetImage> {
  return request<PetImage>(`/admin/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
export function adminDeleteItem(id: number): Promise<void> {
  return request<void>(`/admin/items/${id}`, { method: 'DELETE' })
}
