"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Home, Briefcase, Calendar, Shield, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type IconComponentType = React.ElementType<{ className?: string }>

export interface InteractiveMenuItem {
  label: string
  icon: IconComponentType
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[]
  accentColor?: string
}

const defaultItems: InteractiveMenuItem[] = [
  { label: "home", icon: Home },
  { label: "strategy", icon: Briefcase },
  { label: "period", icon: Calendar },
  { label: "security", icon: Shield },
  { label: "settings", icon: Settings },
]

const defaultAccentColor = "#f97316"

export function InteractiveMenu({ items, accentColor }: InteractiveMenuProps) {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5
    if (!isValid) return defaultItems
    return items
  }, [items])

  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const active = itemRefs.current[activeIndex]
    const line = lineRefs.current[activeIndex]
    if (active && line) {
      const width = active.querySelector("strong")?.getBoundingClientRect().width || 0
      line.style.width = `${width}px`
    }
  }, [activeIndex, finalItems])

  const activeColor = accentColor || defaultAccentColor

  return (
    <nav className="w-full flex items-center justify-between gap-2 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 px-2 py-2 shadow-lg backdrop-blur">
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex
        const IconComponent = item.icon
        return (
          <button
            key={item.label}
            onClick={() => setActiveIndex(index)}
            ref={el => {
              itemRefs.current[index] = el
            }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 rounded-xl transition-all",
              isActive ? "bg-neutral-100 dark:bg-neutral-800 shadow-sm" : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70"
            )}
            aria-pressed={isActive}
          >
            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center transition-transform", isActive && "scale-105")} style={{ color: isActive ? activeColor : undefined }}>
              <IconComponent className="h-5 w-5" />
            </div>
            <strong className={cn("text-xs uppercase tracking-wide", isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400")}>{item.label}</strong>
            <div
              ref={el => {
                lineRefs.current[index] = el
              }}
              className="h-0.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: isActive ? activeColor : "transparent", width: isActive ? "24px" : "0px" }}
            />
          </button>
        )
      })}
    </nav>
  )
}

export const InteractiveMenuDemo = () => <InteractiveMenu />

