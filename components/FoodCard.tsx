'use client'

import Image from 'next/image'
import { Plus, Star, Timer } from 'lucide-react'
import type { FoodItem } from '@/types'

interface FoodCardProps {
  item: FoodItem
  onAdd: (item: FoodItem) => void
}

export default function FoodCard({ item, onAdd }: FoodCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.badge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-dark text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {item.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 gradient-cashback text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
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
          <button
            onClick={() => onAdd(item)}
            className="w-9 h-9 gradient-orange text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-90 transition-all shadow-sm"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
