import { create } from 'zustand'

export type NotificationType = 'SUCCESS' | 'ERROR' | 'INFO'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  createdAt: number
}

interface FeedbackState {
  // Notifications
  notifications: AppNotification[]
  showNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void
  dismissNotification: (id: string) => void
  
  // App-level Top Loader
  isRouting: boolean
  startRouting: () => void
  stopRouting: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  notifications: [],
  showNotification: (payload) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...payload, id, createdAt: Date.now() }
      ]
    }))
  },
  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  isRouting: false,
  startRouting: () => set({ isRouting: true }),
  stopRouting: () => set({ isRouting: false }),
}))
