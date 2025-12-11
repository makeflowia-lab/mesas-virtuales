"use client"

import React from "react"
import NumberFlow, { useCanAnimate } from "@number-flow/react"
import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const MotionNumberFlow = motion(NumberFlow as any)
const MotionArrowUp = motion(ArrowUp as any)

export default function AnimatedNumberRandom({ value, diff }: { value: number; diff: number }) {
  const canAnimate = useCanAnimate()

  return (
    <span className="flex items-center justify-center gap-2">
      <NumberFlow value={value} className="text-5xl font-semibold" format={{ style: "currency", currency: "USD" }} />
      <motion.span
        className={cn(diff > 0 ? "bg-emerald-400" : "bg-red-500", "inline-flex items-center px-[0.3em] text-white transition-colors duration-300")}
        style={{ borderRadius: 999 }}
        layout={canAnimate}
        transition={{ layout: { duration: 0.9, bounce: 0, type: "spring" } }}
      >
        <MotionArrowUp
          className="mr-0.5 size-[0.75em]"
          absoluteStrokeWidth
          strokeWidth={3}
          transition={{ rotate: { type: "spring", duration: 0.5, bounce: 0 } }}
          animate={{ rotate: diff > 0 ? 0 : -180 }}
          initial={false}
        />
        <MotionNumberFlow
          value={diff}
          className="font-semibold"
          format={{ style: "percent", maximumFractionDigits: 2 }}
          layout={canAnimate}
          layoutRoot={canAnimate}
        />
      </motion.span>
    </span>
  )
}

export const AnimatedNumberRandomDemo = () => {
  const numbers = [124.23, 41.75, 2125.95]
  const diffs = [0.0564, -0.114, 0.0029]
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const handleCustomClick = () => setCurrentIndex(prev => (prev + 1) % numbers.length)

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <AnimatedNumberRandom value={numbers[currentIndex]} diff={diffs[currentIndex]} />
      <button
        onClick={handleCustomClick}
        className="duration-[.16s] ease-[cubic-bezier(.4,0,.2,1)] active:duration-[25ms] mx-auto mt-4 flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition hover:brightness-125 active:scale-[98%] active:brightness-[98%]"
      >
        Cambiar
      </button>
    </div>
  )
}

