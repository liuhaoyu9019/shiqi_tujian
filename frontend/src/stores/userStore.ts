import { create } from 'zustand'
import type { UserInfo } from '@/types'
import { fetchUserInfo } from '@/utils/api'

interface UserState {
  user: UserInfo | null
  loading: boolean
  error: string | null
  loadUser: (userId: number) => Promise<void>
  setUser: (user: UserInfo | null) => void
  deductBalance: (amount: number) => void
  addBalance: (amount: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  loadUser: async (userId: number) => {
    set({ loading: true, error: null })
    try {
      const data = await fetchUserInfo(userId)
      set({ user: data, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  setUser: (user) => set({ user }),

  deductBalance: (amount) =>
    set((state) => {
      if (!state.user || state.user.balance < amount) return state
      return { user: { ...state.user, balance: state.user.balance - amount } }
    }),

  addBalance: (amount) =>
    set((state) => {
      if (!state.user) return state
      return { user: { ...state.user, balance: state.user.balance + amount } }
    }),
}))
