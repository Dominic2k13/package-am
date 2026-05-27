'use client'

import Image from 'next/image'
import { Plus, Star, Timer } from 'lucide-react'
import { motion } from 'framer-motion'
import type { FoodItem } from '@/types'

interface FoodCardProps {
  item: FoodItem
  onAdd: (item: FoodItem) => void
}

export default function FoodCard({ item, onAdd }: FoodCardProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-card flex flex-col"
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(255,90,31,0.18)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <div className="relative h-44 overflow-hidden shrink-0">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>
        {item.badge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-dark text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
            {item.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 gradient-cashback text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
          💜 5% Back
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-syne font-semibold text-brand-dark text-sm leading-snug mb-1.5 line-clamp-2">
          {item.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-brand-muted mb-3">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
            {item.rating}
          </span>
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{item.time}</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-syne font-bold text-brand-orange text-lg">
            ₦{item.price.toLocaleString()}
          </span>
          <motion.button
            onClick={() => onAdd(item)}
            className="w-9 h-9 gradient-orange text-white rounded-full flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
