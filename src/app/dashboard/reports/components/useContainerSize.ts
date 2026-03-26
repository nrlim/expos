'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

/**
 * Measures a DOM element via ResizeObserver using a CALLBACK REF.
 * Unlike a useRef + useEffect approach, the callback ref fires whenever the
 * element actually mounts into the DOM — even if it mounts conditionally
 * (e.g. after a loading guard). This guarantees the observer is always attached.
 *
 * Usage:
 *   const { ref, size } = useContainerSize()
 *   <div ref={ref} className="h-64 w-full">
 *     {size && <MyChart width={size.width} height={size.height} />}
 *   </div>
 */
export function useContainerSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  // Callback ref — called by React when the element mounts OR unmounts
  const ref = useCallback((el: HTMLDivElement | null) => {
    // Tear down any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) })
        }
      }
    })

    observer.observe(el)
    observerRef.current = observer

    // Also fire synchronously in case the element already has layout
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    }
  }, [])

  // Safety cleanup on component unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return { ref, size }
}
