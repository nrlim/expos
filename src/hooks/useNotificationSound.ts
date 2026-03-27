'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useNotificationSound() {
  const [isMuted, setIsMuted] = useState(true) // Default muted to comply with browser autoplay
  const [volume, setVolume] = useState(0.8)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize and unlock the AudioContext upon first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      setIsMuted(false)
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  const playChime = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return
    
    // Ensure the context is running (fixes Safari background tab issues)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    const ctx = audioCtxRef.current

    /**
     * Synthesizes a high-end, executive "Double Ping" chime.
     * Uses Sine waves with an exponential decay envelope for a glass-like transient.
     */
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      // Envelope: 20ms attack for a soft edge, then smooth exponential decay
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    
    // First note (Fundamental)
    playTone(1046.50, now, 0.4) // C6
    // Second note (Perfect Fifth relative to fundamental, creating a resolving "chime")
    playTone(1567.98, now + 0.12, 0.6) // G6
    
  }, [isMuted, volume])

  return {
    playChime,
    isMuted,
    setIsMuted,
    volume,
    setVolume
  }
}
