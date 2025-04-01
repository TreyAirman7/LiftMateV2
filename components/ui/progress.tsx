"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showValue?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showValue = false, animated = true, ...props }, ref) => {
    const percentage = value && max ? Math.min(Math.max(0, (value / max) * 100), 100) : 0

    return (
      <div
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 bg-primary transition-all", animated && "progress-bar")}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }

