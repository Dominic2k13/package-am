'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Eye, EyeOff, ArrowRight, BadgePercent, Bike, Smartphone } from 'lucide-react'

const BENEFITS = [
  { icon: BadgePercent, text: '5% cashback on every order'      },
  { icon: Bike,         text: 'Fast delivery, anywhere in Lagos' },
  { icon: Smartphone,   text: 'Redeem for airtime & data'        },
]

export default function LoginPage() {
  const router = useRouter()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember,     setRemember]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim())    return setError('Please enter your email address.')
    if (!password.trim()) return setError('Please enter your password.')
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.')

    setLoading(true)
    // Simulate auth request
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    router.push('/menu')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: brand ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 gradient-orange flex-col justify-between p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-extrabold text-2xl text-white">Package-Am</span>
        </Link>

        {/* Middle content */}
        <div className="relative">
          <h2 className="font-syne font-extrabold text-white text-4xl leading-tight mb-4">
            Nigeria&apos;s favourite<br />food delivery app
          </h2>
          <p className="text-white/70 text-base mb-8 leading-relaxed">
            Fast, tasty, and rewarding — every single order. Join thousands of happy customers.
          </p>

          <ul className="space-y-4">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom social proof */}
        <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="flex -space-x-2">
            {['AO','CE','NB','TF'].map(initials => (
              <div key={initials} className="w-8 h-8 gradient-cashback rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {initials}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">2,000+ happy customers</p>
            <p className="text-white/60 text-xs">earning cashback every day</p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 bg-white">

        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-extrabold text-xl">
            <span className="text-brand-orange">Package</span>
            <span className="text-brand-dark">-Am</span>
          </span>
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-2">Welcome back! 👋</h1>
            <p className="text-brand-muted text-base">Sign in to your account to continue ordering</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-brand-dark">
                  Password
                </label>
                <Link href="#" className="text-xs text-brand-orange font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 pr-11 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 accent-brand-orange rounded"
              />
              <span className="text-sm text-brand-muted">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-card"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-brand-border" />
              <span className="text-brand-muted text-xs font-medium">or</span>
              <div className="flex-1 border-t border-brand-border" />
            </div>

            {/* Vendor link */}
            <Link
              href="/vendor"
              className="w-full border border-brand-border text-brand-text py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              <Package className="w-4 h-4" />
              Sign in as Vendor
            </Link>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-brand-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-orange font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
