// 品种（替代原盲盒系列）
export interface PetBreed {
  id: number
  name: string
  coverUrl: string
  description: string
}

// 品种图片（替代原藏品定义）
export interface PetImage {
  id: number
  seriesId: number
  name: string
  thumbnailUrl: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}
