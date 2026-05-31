"use client"

import { motion, type Variants, useReducedMotion } from "framer-motion"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  variants?: Variants
  once?: boolean
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  variants,
  once = true,
}: AnimatedSectionProps) {
  const shouldReduce = useReducedMotion()
  const isMobile = useMediaQuery("(max-width: 767px)")

  const duration = shouldReduce ? 0.01 : isMobile ? 0.3 : 0.7

  const defaultVariants: Variants = shouldReduce
    ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.01 } },
      }
    : {
        hidden:  { opacity: 0, y: 40, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
        },
      }

  return (
    <motion.div
      variants={variants ?? defaultVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay: shouldReduce ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
