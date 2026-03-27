'use client'

import { useFeedbackStore } from './store'
import { NotificationCard } from './NotificationCard'
import { TopProgressBar } from './TopProgressBar'
import { AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function GlobalFeedbackProvider({ children }: { children: React.ReactNode }) {
  const notifications = useFeedbackStore((s) => s.notifications)
  const stopRouting = useFeedbackStore((s) => s.stopRouting)
  const [mounted, setMounted] = useState(false)
  
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hook into Next.js router changes to stop the loader globally when new pages render
  useEffect(() => {
    stopRouting()
  }, [pathname, searchParams, stopRouting])

  return (
    <>
      <TopProgressBar />
      {children}
      
      {/* Toast Notification Portal Layer */}
      {mounted && createPortal(
        <div className="fixed z-[99999] top-4 right-4 md:right-6 w-full max-w-[380px] px-4 md:px-0 flex flex-col pointer-events-none">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  )
}
