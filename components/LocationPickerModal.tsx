'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, CheckCircle } from 'lucide-react'
import { NIGERIAN_STATES } from '@/lib/nigerianStates'

interface LocationPickerModalProps {
  open: boolean
  current: string
  onSelect: (state: string) => void
  onClose: () => void
}

export default function LocationPickerModal({
  open, current, onSelect, onClose,
}: LocationPickerModalProps) {
  const [query, setQuery] = useState('')

  // Reset search when opened
  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const filtered = NIGERIAN_STATES.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(state: string) {
    onSelect(state)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom on mobile, centered on desktop */}
          <div className="fixed inset-0 z-[401] flex items-end sm:items-center justify-center">
            <motion.div
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              {/* Handle bar (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 bg-brand-border rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 gradient-orange rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-syne font-bold text-brand-dark text-base leading-tight">Choose Location</h2>
                    <p className="text-brand-muted text-xs">See restaurants near you</p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-brand-bg hover:bg-brand-border flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-brand-text" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="px-6 py-4 border-b border-brand-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search state…"
                    autoFocus
                    className="w-full bg-brand-bg border border-brand-border rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
                  />
                </div>
              </div>

              {/* States grid */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted text-sm">
                    No state matched &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filtered.map(state => {
                      const selected = state === current
                      return (
                        <motion.button
                          key={state}
                          onClick={() => handleSelect(state)}
                          className={`flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-medium text-left transition-all ${
                            selected
                              ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                              : 'border-brand-border bg-brand-bg text-brand-text hover:border-brand-orange/40 hover:bg-brand-orange/5'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="truncate">{state}</span>
                          {selected && (
                            <CheckCircle className="w-4 h-4 shrink-0 text-brand-orange" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
