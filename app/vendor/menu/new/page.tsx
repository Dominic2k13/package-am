'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ArrowLeft, ImageIcon, Check } from 'lucide-react'
import { api, getToken } from '@/lib/api'

const CATEGORIES = ['pizza','shawarma','fast-food','nigerian','drinks','snacks','rice','soups','grills','desserts']

export default function NewMenuItemPage() {
  const router  = useRouter()
  const token   = getToken()

  const [form, setForm] = useState({
    name: '', category: 'pizza', price: '', prepTime: '20–30 min', image: '', badge: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim())    { setError('Name is required');           return }
    if (!Number(form.price))  { setError('Price must be a number');     return }
    if (!token)               { setError('Not authenticated — please log in'); return }

    setLoading(true)
    try {
      await api.vendor.createItem(token, {
        name: form.name, category: form.category,
        price: Number(form.price), prepTime: form.prepTime,
        image: form.image, badge: form.badge || undefined,
      })
      setDone(true)
      setTimeout(() => router.push('/vendor'), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-white border-b border-brand-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/vendor" className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-bg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-orange rounded-lg flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-syne font-bold text-brand-dark">Add Menu Item</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence>
          {done ? (
            <motion.div className="bg-white rounded-3xl shadow-card p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-syne font-bold text-xl text-brand-dark mb-2">Item Added!</h2>
              <p className="text-brand-muted text-sm">Redirecting to your dashboard…</p>
            </motion.div>
          ) : (
            <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-7 space-y-5">

              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Item Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Chicken Shawarma (King Size)" required
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full border border-brand-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-orange bg-white capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Price (₦) *</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="e.g. 5000" min="1" required
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Prep Time</label>
                  <input value={form.prepTime} onChange={e => set('prepTime', e.target.value)}
                    placeholder="e.g. 15–25 min"
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Badge (optional)</label>
                  <input value={form.badge} onChange={e => set('badge', e.target.value)}
                    placeholder="e.g. 🔥 Bestseller"
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Image Path or URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input value={form.image} onChange={e => set('image', e.target.value)}
                    placeholder="/gineer/pizzza.jpg or https://…"
                    className="w-full border border-brand-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
                <p className="text-xs text-brand-muted mt-1">Use a path from /public/gineer/ or an image URL</p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Link href="/vendor"
                  className="flex-1 py-3 border border-brand-border rounded-full text-center text-sm font-semibold text-brand-muted hover:border-brand-orange hover:text-brand-orange transition-colors">
                  Cancel
                </Link>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 gradient-orange text-white rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
                  {loading ? 'Saving…' : 'Add Item'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
