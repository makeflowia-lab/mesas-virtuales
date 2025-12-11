"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const bouncingDotsVariant = cva("flex gap-2 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
})

export interface BouncingDotsProps {
  dots?: number
  message?: string
  messagePlacement?: "bottom" | "left" | "right"
}

export function BouncingDots({
  dots = 3,
  message,
  messagePlacement = "bottom",
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & BouncingDotsProps) {
  return (
    <div className={cn(bouncingDotsVariant({ messagePlacement }))}>
      <div className="flex gap-2 items-center justify-center">
        {Array(dots)
          .fill(null)
          .map((_, index) => (
            <motion.div
              key={index}
              className={cn("w-3 h-3 bg-foreground rounded-full", className)}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
              {...props}
            />
          ))}
      </div>
      {message && <div className="text-sm text-foreground/80 mt-2">{message}</div>}
    </div>
  )
}

export const BouncingDotsDemo = () => (
  <div className="flex items-center justify-center py-10">
    <BouncingDots message="Procesando..." />
  </div>
)

