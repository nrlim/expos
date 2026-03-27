'use client'

import { useFeedbackStore } from './store'
import { NotificationCard } from './NotificationCard'
import { TopProgressBar } from './TopProgressBar'
import { AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function RouteChangeListener() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const stopRouting = useFeedbackStore((s) => s.stopRouting)

  useEffect(() => {
    stopRouting()
  }, [pathname, searchParams, stopRouting])

  return null
}

export function GlobalFeedbackProvider({ children }: { children: React.ReactNode }) {
  const notifications = useFeedbackStore((s) => s.notifications)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>
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
