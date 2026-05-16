import { create } from 'zustand'
import type { BoxSeries } from '@/types'
import { fetchSeries } from '@/utils/api'

interface BoxState {
  series: BoxSeries[]
  loading: boolean
  error: string | null
  loadSeries: () => Promise<void>
  getSeriesById: (id: number) => BoxSeries | undefined
  updateSeries: (s: BoxSeries) => void
  removeSeries: (id: number) => void
}

export const useBoxStore = create<BoxState>((set, get) => ({
  series: [],
  loading: false,
  error: null,

  loadSeries: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchSeries()
      set({ series: data, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  getSeriesById: (id) => get().series.find((s) => s.id === id),

  updateSeries: (s) => set((state) => ({
    series: state.series.map((item) => (item.id === s.id ? s : item)),
  })),

  removeSeries: (id) => set((state) => ({
    series: state.series.filter((s) => s.id !== id),
  })),
}))
