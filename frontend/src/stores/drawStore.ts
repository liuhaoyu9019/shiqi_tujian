import { create } from 'zustand'
import type { DrawRecord } from '@/types'
import { drawBox } from '@/utils/api'

interface DrawState {
  isOpening: boolean
  lastResult: DrawRecord | null
  drawHistory: DrawRecord[]
  setOpening: (v: boolean) => void
  setLastResult: (r: DrawRecord | null) => void
  executeDraw: (userId: number, seriesId: number) => Promise<DrawRecord>
  addHistory: (r: DrawRecord) => void
}

export const useDrawStore = create<DrawState>((set) => ({
  isOpening: false,
  lastResult: null,
  drawHistory: [],
  setOpening: (v) => set({ isOpening: v }),
  setLastResult: (r) => set({ lastResult: r }),

  executeDraw: async (userId: number, seriesId: number) => {
    set({ isOpening: true })
    try {
      const record = await drawBox(userId, seriesId)
      set({ isOpening: false, lastResult: record })
      set((s) => ({ drawHistory: [record, ...s.drawHistory] }))
      return record
    } catch (e) {
      set({ isOpening: false })
      throw e
    }
  },

  addHistory: (r) => set((s) => ({ drawHistory: [r, ...s.drawHistory] })),
}))
