'use client'

import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const utc = now.toISOString().split('T')[1].split('.')[0]
      setTime(utc)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!time) return <span className="opacity-0">00:00:00</span>

  return (
    <span className="tabular-nums font-mono">
      {time} <span className="text-muted ml-1">UTC</span>
    </span>
  )
}
