import type * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor: string
  error?: string
  description?: string
  required?: boolean
}

export function FormField({
  label,
  htmlFor,
  error,
  description,
  required = false,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex justify-between">
        <label htmlFor={htmlFor} className={cn("text-sm font-medium", error ? "text-destructive" : "text-foreground")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      </div>

      {children}

      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}

      {error && <p className="text-xs text-destructive form-error-message">{error}</p>}
    </div>
  )
}

