"use client"

import { useEffect, useRef } from "react"

interface CelebrationProps {
  active: boolean
  count?: number
  colors?: string[]
}

export function Celebration({ active, count = 50, colors = [] }: CelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const defaultColors = ["#0D9488", "#2DD4BF", "#14B8A6", "#0F766E", "#115E59"]
    const confettiColors = colors.length > 0 ? colors : defaultColors

    // Clear any existing confetti
    container.innerHTML = ""

    // Create confetti pieces
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div")
      piece.className = "confetti-piece"

      // Random position
      piece.style.left = `${Math.random() * 100}%`

      // Random color
      const colorIndex = Math.floor(Math.random() * confettiColors.length)
      piece.style.backgroundColor = confettiColors[colorIndex]

      // Random size
      const size = Math.random() * 10 + 5
      piece.style.width = `${size}px`
      piece.style.height = `${size}px`

      // Random shape
      if (Math.random() > 0.5) {
        piece.style.borderRadius = "50%"
      } else {
        piece.style.borderRadius = "0"
      }

      // Random rotation
      piece.style.transform = `rotate(${Math.random() * 360}deg)`

      // Random animation duration
      piece.style.animationDuration = `${Math.random() * 3 + 2}s`

      // Random animation delay
      piece.style.animationDelay = `${Math.random() * 0.5}s`

      container.appendChild(piece)
    }

    // Clean up after animation completes
    const timeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [active, count, colors])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true" />
  )
}

