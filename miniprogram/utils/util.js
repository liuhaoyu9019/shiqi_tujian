// ==================== 工具函数 ====================

/** 数字格式化：≥10000 显示为 X.Xw，≥1000 显示为 X.Xk */
export function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

/** 时长格式化：秒 → "X分Y秒" */
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m + '分' + s + '秒'
}
