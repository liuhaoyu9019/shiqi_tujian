import { create } from 'zustand'
import type { PetBreed } from '@/types'
import { fetchSeries } from '@/utils/api'

interface BreedState {
  breeds: PetBreed[]
  loading: boolean
  error: string | null
  loadBreeds: () => Promise<void>
  getBreedById: (id: number) => PetBreed | undefined
  updateBreed: (b: PetBreed) => void
  removeBreed: (id: number) => void
}

export const useBreedStore = create<BreedState>((set, get) => ({
  breeds: [],
  loading: false,
  error: null,
  loadBreeds: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchSeries()
      set({ breeds: data, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },
  getBreedById: (id) => get().breeds.find((s) => s.id === id),
  updateBreed: (b) =>
    set((state) => ({
      breeds: state.breeds.map((item) => (item.id === b.id ? b : item)),
    })),
  removeBreed: (id) =>
    set((state) => ({
      breeds: state.breeds.filter((s) => s.id !== id),
    })),
}))
