"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    // Add event listener
    mediaQuery.addEventListener("change", handler)

    // Clean up
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

// Predefined media query hooks
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)")
}

export function useIsDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)")
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

export function useIsRTL() {
  return useMediaQuery("(dir: rtl)")
}

