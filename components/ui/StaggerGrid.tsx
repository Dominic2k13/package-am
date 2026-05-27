'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

// Container — triggers stagger for child StaggerItem components
export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  )
}

// Item — place inside StaggerGrid
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 28, scale: 0.96 },
        visible: { opacity: 1, y: 0,  scale: 1,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
