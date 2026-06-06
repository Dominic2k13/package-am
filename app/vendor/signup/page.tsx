'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, ChevronLeft, Check, Store, MapPin, Phone, FileText, Tag } from 'lucide-react'
import { api, setToken } from '@/lib/api'

const CATEGORIES = ['Pizza','Shawarma','Burgers','Nigerian','Drinks','Desserts','Fast Food','Soups','Snacks','Rice','Grills']
const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']

const STEPS = ['Business Info', 'Location', 'Categories', 'Account']

type Form = {
  businessName: string; tagline: string; description: string; emoji: string
  phone: string; address: string; city: string; state: string
  categories: string[]
  ownerName: string; email: string; password: string; confirmPassword: string
}

const BLANK: Form = {
  businessName:'', tagline:'', description:'', emoji:'🍽️',
  phone:'', address:'', city:'', state:'',
  categories:[],
  ownerName:'', email:'', password:'', confirmPassword:'',
}

export default function VendorSignupPage() {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<Form>(BLANK)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  function set(key: keyof Form, value: string | string[]) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function toggleCat(cat: string) {
    set('categories', form.categories.includes(cat)
      ? form.categories.filter(c => c !== cat)
      : [...form.categories, cat])
  }

  function validate(): boolean {
    if (step === 0) {
      if (!form.businessName.trim()) { setError('Business name is required'); return false }
      if (!form.description.trim())  { setError('Description is required');  return false }
    }
    if (step === 1) {
      if (!form.phone.trim())   { setError('Phone is required');   return false }
      if (!form.address.trim()) { setError('Address is required'); return false }
      if (!form.city.trim())    { setError('City is required');    return false }
      if (!form.state)          { setError('State is required');   return false }
    }
    if (step === 2) {
      if (form.categories.length === 0) { setError('Select at least one category'); return false }
    }
    if (step === 3) {
      if (!form.ownerName.trim()) { setError('Your name is required'); return false }
      if (!form.email.trim())     { setError('Email is required');     return false }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return false }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false }
    }
    return true
  }

  function saveToLocalStorage() {
    try {
      const existing = JSON.parse(localStorage.getItem('pa_vendor_apps') || '[]')
      const app = {
        id: `va_${Date.now()}`,
        businessName: form.businessName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        categories: form.categories,
        description: form.description,
        emoji: form.emoji,
        tagline: form.tagline,
        appliedAt: new Date().toISOString(),
        status: 'pending' as const,
      }
      localStorage.setItem('pa_vendor_apps', JSON.stringify([...existing, app]))
    } catch { /* ignore storage errors */ }
  }

  async function submit() {
    if (!validate()) return
    setLoading(true)
    setError('')
    // Always save to localStorage so the admin panel can see the application
    saveToLocalStorage()
    try {
      const res = await api.auth.vendorSignup({
        ownerName: form.ownerName, email: form.email, password: form.password,
        phone: form.phone, businessName: form.businessName, tagline: form.tagline,
        description: form.description, address: form.address, city: form.city,
        state: form.state, categories: form.categories, emoji: form.emoji,
      })
      setToken(res.user.id) // store token for status check
    } catch {
      // Backend may not be deployed yet — localStorage save above is the fallback
    }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 gradient-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-brand-dark mb-3">Application Submitted! 🎉</h1>
          <p className="text-brand-muted mb-6">
            Your application for <strong>{form.businessName}</strong> is under review.
            We&apos;ll reach out within <strong>24 hours</strong> to your email <strong>{form.email}</strong>.
          </p>
          <div className="bg-brand-bg rounded-2xl p-4 text-sm text-brand-muted mb-6">
            <p>💡 Once approved, you&apos;ll get access to your vendor dashboard where you can manage orders and your menu in real time.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 gradient-orange text-white px-6 py-3 rounded-full font-semibold">
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="bg-white border-b border-brand-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-extrabold text-lg">
              <span className="text-brand-orange">Package</span><span className="text-brand-dark">-Am</span>
            </span>
          </Link>
          <span className="text-brand-muted text-sm ml-auto">Vendor Registration</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-2">Join Package-Am</h1>
          <p className="text-brand-muted">Reach thousands of hungry customers in your city</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'gradient-orange text-white' : i === step ? 'bg-brand-dark text-white' : 'bg-brand-border text-brand-muted'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${i === step ? 'text-brand-dark' : 'text-brand-muted'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-brand-orange' : 'bg-brand-border'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          className="bg-white rounded-3xl shadow-card p-8"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0 — Business info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-xl text-brand-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-orange" /> Business Information
              </h2>
              <div className="flex gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Emoji</label>
                  <input value={form.emoji} onChange={e => set('emoji', e.target.value)}
                    className="w-16 h-12 text-2xl text-center border border-brand-border rounded-xl" maxLength={2} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">Business Name *</label>
                  <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                    placeholder="e.g. Mama's Kitchen" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Tagline</label>
                <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                  placeholder="e.g. Taste the difference" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Description *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Tell customers what makes your food special..." rows={4}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange resize-none" />
              </div>
            </div>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-xl text-brand-dark flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-orange" /> Location & Contact
              </h2>
              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="08012345678" className="w-full border border-brand-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted mb-1 block">Restaurant Address *</label>
                <input value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Full street address" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">City *</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="City" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">State *</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange bg-white">
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Categories */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-xl text-brand-dark flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-orange" /> What do you sell?
              </h2>
              <p className="text-sm text-brand-muted">Select all categories that apply</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCat(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${form.categories.includes(cat) ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-brand-border text-brand-muted hover:border-brand-orange/50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              {form.categories.length > 0 && (
                <p className="text-xs text-brand-cashback font-medium">
                  ✓ Selected: {form.categories.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Step 3 — Account */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-xl text-brand-dark">Create your account</h2>
              <p className="text-sm text-brand-muted">This will be your login to manage orders and your menu.</p>
              {[
                { label: 'Your Full Name *', key: 'ownerName' as const, placeholder: 'First Last', type: 'text' },
                { label: 'Email Address *', key: 'email' as const, placeholder: 'you@business.com', type: 'email' },
                { label: 'Password *', key: 'password' as const, placeholder: 'Min. 6 characters', type: 'password' },
                { label: 'Confirm Password *', key: 'confirmPassword' as const, placeholder: 'Repeat password', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-brand-muted mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key] as string} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 border border-brand-border text-brand-text px-5 py-3 rounded-full font-semibold text-sm hover:border-brand-orange transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={step === STEPS.length - 1 ? submit : () => { if (validate()) setStep(s => s + 1) }}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 gradient-orange text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
              {loading ? 'Submitting…' : step === STEPS.length - 1 ? 'Submit Application' : <>Next <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-sm text-brand-muted mt-6">
          Already have a vendor account?{' '}
          <Link href="/vendor/dashboard" className="text-brand-orange font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
