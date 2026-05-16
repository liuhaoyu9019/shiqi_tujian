import type { ApiResponse, BoxSeries, ItemDef, DrawRecord, UserInfo } from '@/types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  const json: ApiResponse<T> = await res.json()
  if (json.code !== 200) throw new Error(json.message || '请求失败')
  return json.data
}

// ===== 盲盒系列 =====
export function fetchSeries(): Promise<BoxSeries[]> {
  return request('/box/series')
}

export function fetchSeriesById(id: number): Promise<BoxSeries> {
  return request(`/box/series/${id}`)
}

export function fetchItemsBySeries(seriesId: number): Promise<ItemDef[]> {
  return request(`/box/series/${seriesId}/items`)
}

// ===== 开盒 =====
export function drawBox(userId: number, seriesId: number): Promise<DrawRecord> {
  return request('/draw/open', {
    method: 'POST',
    body: JSON.stringify({ userId, seriesId }),
  })
}

// ===== 用户 =====
export function fetchUserInfo(userId: number): Promise<UserInfo> {
  return request(`/user/${userId}`)
}

// ===== 钱包 =====
export function fetchRechargePackages(): Promise<{ id: number; amount: number; bonus: number; label: string; desc: string }[]> {
  return request('/wallet/packages')
}

export function createRechargeOrder(userId: number, packageId: number): Promise<{ orderNo: string; amount: number; bonus: number; totalAmount: number }> {
  return request('/wallet/recharge', {
    method: 'POST',
    body: JSON.stringify({ userId, packageId }),
  })
}

export function payOrder(orderNo: string): Promise<void> {
  return request(`/wallet/pay/${orderNo}`, { method: 'POST' })
}

// ===== 后台统计 =====
export function fetchStatsDashboard(): Promise<Record<string, unknown>> {
  return request('/admin/stats/dashboard')
}

// ===== 后台管理 =====
export function adminListSeries(): Promise<BoxSeries[]> {
  return request('/box/series')
}

export function adminCreateSeries(data: Partial<BoxSeries>): Promise<BoxSeries> {
  return request('/admin/series', { method: 'POST', body: JSON.stringify(data) })
}

export function adminUpdateSeries(id: number, data: Partial<BoxSeries>): Promise<BoxSeries> {
  return request(`/admin/series/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function adminDeleteSeries(id: number): Promise<void> {
  return request(`/admin/series/${id}`, { method: 'DELETE' })
}

export function adminListItems(seriesId?: number, page = 1, size = 20): Promise<{ records: ItemDef[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (seriesId) params.set('seriesId', String(seriesId))
  return request(`/admin/items?${params}`)
}

export function adminCreateItem(data: Partial<ItemDef>): Promise<ItemDef> {
  return request('/admin/items', { method: 'POST', body: JSON.stringify(data) })
}

export function adminUpdateItem(id: number, data: Partial<ItemDef>): Promise<ItemDef> {
  return request(`/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function adminDeleteItem(id: number): Promise<void> {
  return request(`/admin/items/${id}`, { method: 'DELETE' })
}

export function adminListDraws(params: Record<string, string | number> = {}): Promise<{ records: DrawRecord[]; total: number }> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, String(v)) })
  return request(`/admin/draws?${qs}`)
}

export function adminListUsers(): Promise<{ id: number; nickname: string; phone: string; level: number; balance: number; drawCount: number; createdAt: string }[]> {
  return request('/admin/users')
}

export function adminListRecharges(): Promise<{ id: number; orderNo: string; userId: number; nickname: string; amount: number; bonus: number; totalAmount: number; status: number; paidAt: string | null; createdAt: string }[]> {
  return request('/admin/recharges')
}
