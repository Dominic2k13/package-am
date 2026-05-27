'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
}

export default function AnimateIn({
  children,
  className,
  delay = 0,
  duration = 0.55,
  direction = 'up',
  once = true,
}: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-60px' })

  const offsets = {
    up:    { y: 36, x: 0 },
    down:  { y: -36, x: 0 },
    left:  { y: 0, x: 36 },
    right: { y: 0, x: -36 },
    none:  { y: 0, x: 0 },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offsets[direction], scale: direction === 'none' ? 0.95 : 1 }}
      animate={inView
        ? { opacity: 1, y: 0, x: 0, scale: 1 }
        : { opacity: 0, ...offsets[direction], scale: direction === 'none' ? 0.95 : 1 }
      }
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
