import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-none border-none bg-background px-3 py-2 text-base font-mono placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 relative z-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {/* 8bit pixelated border */}
        <div className="absolute top-0 left-0 w-full h-[5px] md:h-1.5 bg-primary pointer-events-none" />
        <div className="absolute bottom-0 w-full h-[5px] md:h-1.5 bg-primary pointer-events-none" />
        <div className="absolute top-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-primary pointer-events-none" />
        <div className="absolute bottom-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-primary pointer-events-none" />
        <div className="absolute top-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-primary pointer-events-none" />
        <div className="absolute bottom-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-primary pointer-events-none" />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
