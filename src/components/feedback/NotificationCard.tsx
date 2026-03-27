'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { AppNotification, useFeedbackStore } from './store'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ICON_MAP = {
  SUCCESS: <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
  ERROR:   <AlertCircle className="w-4 h-4 text-destructive" />,
  INFO:    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
}

const RING_MAP = {
  SUCCESS: 'ring-teal-500/20 bg-teal-50/50 dark:bg-teal-500/10 dark:ring-teal-500/30',
  ERROR:   'ring-destructive/20 bg-destructive/10 dark:bg-destructive/20 dark:ring-destructive/30',
  INFO:    'ring-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 dark:ring-blue-500/30',
}

const BAR_MAP = {
  SUCCESS: 'bg-teal-500',
  ERROR:   'bg-destructive',
  INFO:    'bg-blue-500',
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export function NotificationCard({ notification }: { notification: AppNotification }) {
  const dismiss = useFeedbackStore((s) => s.dismissNotification)
  const duration = notification.duration || 4000
  
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(100)
  
  const handleClose = () => {
    dismiss(notification.id)
  }

  // Update progress bar
  useInterval(() => {
    if (!isHovered) {
      setProgress(p => {
        const next = p - (100 / (duration / 50)) // 50ms interval
        if (next <= 0) {
          handleClose()
          return 0
        }
        return next
      })
    }
  }, 50)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative z-50 w-full md:w-[380px] shrink-0 mb-3 bg-white dark:bg-[#0a0a0a] ring-1 ring-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] rounded-xl overflow-hidden pointer-events-auto flex flex-col"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`shrink-0 w-8 h-8 rounded-full ring-1 flex items-center justify-center ${RING_MAP[notification.type]}`}>
          {ICON_MAP[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-[13px] font-bold text-foreground leading-tight tracking-tight">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors opacity-70 hover:opacity-100 -mt-1 -mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 w-full bg-muted/60">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${BAR_MAP[notification.type]}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  )
}
