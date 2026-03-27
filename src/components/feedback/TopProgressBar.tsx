'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFeedbackStore } from './store'

export function TopProgressBar() {
  const isRouting = useFeedbackStore((s) => s.isRouting)
  const [progress, setProgress] = useState(0)

  // Simulation logic for an indeterminate progress bar
  useEffect(() => {
    let t1: NodeJS.Timeout
    let t2: NodeJS.Timeout
    
    if (isRouting) {
      setProgress(10)
      t1 = setTimeout(() => setProgress(30), 200)
      t2 = setTimeout(() => setProgress(85), 800)
    } else {
      setProgress(100)
      t1 = setTimeout(() => setProgress(0), 400) // Reset after transition out
    }
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isRouting])

  return (
    <AnimatePresence>
      {(isRouting || progress === 100) && progress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2px] w-full"
        >
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_2px_theme(colors.primary.DEFAULT)]"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
