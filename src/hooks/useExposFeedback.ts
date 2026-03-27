'use client'

import { useFeedbackStore, NotificationType } from '@/components/feedback/store'
import { useCallback } from 'react'

export function useExposFeedback() {
  const { showNotification, startRouting, stopRouting } = useFeedbackStore()

  const toast = useCallback((type: NotificationType, title: string, message?: string, duration: number = 4000) => {
    showNotification({ type, title, message, duration })
  }, [showNotification])

  return {
    showSuccess: (title: string, message?: string) => toast('SUCCESS', title, message),
    showError:   (title: string, message?: string) => toast('ERROR', title, message, 6000), // longer duration for errors
    showInfo:    (title: string, message?: string) => toast('INFO', title, message),
    
    startLoading: startRouting,
    stopLoading: stopRouting,
  }
}
