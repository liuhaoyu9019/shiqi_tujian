// 藏品稀有度
export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR'

// 盲盒系列
export interface BoxSeries {
  id: number
  name: string
  coverUrl: string
  description: string
  price: number
  totalItems: number
  isHot: boolean
  isNew: boolean
}

// 藏品定义
export interface ItemDef {
  id: number
  seriesId: number
  name: string
  modelUrl: string
  thumbnailUrl: string
  rarity: Rarity
  probability: number
}

// 开盒记录
export interface DrawRecord {
  id: number
  drawNo: string
  seriesId: number
  itemId: number
  itemName: string
  rarity: Rarity
  price: number
  isFirstGet: boolean
  createdAt: string
}

// 用户藏品
export interface UserItem {
  id: number
  userId: number
  itemId: number
  seriesId: number
  quantity: number
  firstGetAt: string
  isDisplayed: boolean
  itemDef: ItemDef
}

// 用户信息
export interface UserInfo {
  id: number
  nickname: string
  avatarUrl: string
  level: number
  exp: number
  balance: number
}

// API 统一响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 稀有度配置
export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; stars: number }> = {
  N:  { label: '普通', color: '#9CA3AF', bg: '#F3F4F6', stars: 1 },
  R:  { label: '稀有', color: '#3B82F6', bg: '#EFF6FF', stars: 2 },
  SR: { label: '史诗', color: '#A855F7', bg: '#FAF5FF', stars: 3 },
  SSR:{ label: '传说', color: '#F0B90B', bg: '#FFFBEB', stars: 4 },
  UR: { label: '隐藏', color: '#EF4444', bg: '#FEF2F2', stars: 5 },
}
