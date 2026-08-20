import React from "react"
import { cn } from "@/lib/utils"

interface ModuleHeaderProps {
  title: string
  tabs?: React.ReactNode
  actions?: React.ReactNode
}

export function ModuleHeader({ title, tabs, actions }: ModuleHeaderProps) {
  return (
    <div 
      className={cn(
        "sticky top-0 z-50",
        "-mx-4 -mt-4 mb-8 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8", // Negative margins to stretch full width
        "px-4 py-4 sm:px-6 lg:px-8",
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        "bg-[#F7F6F4]", // Solid opaque background (Warm paper tone)
        "border-b border-[var(--border)] shadow-md" // Visual separation
      )}
    >
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black">{title}</h1>
          <div className="w-10 h-1 bg-[var(--primary)] mt-2 rounded-full" />
        </div>
        {tabs && (
          <div className="w-full sm:w-[400px]">
            {tabs}
          </div>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-4 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
