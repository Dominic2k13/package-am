'use client'

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { registerUser } from '@/lib/auth'

interface FormState {
  name:            string
  email:           string
  phone:           string
  password:        string
  confirmPassword: string
}

const PERKS = [
  '5% cashback on every single order',
  'Redeem cashback for airtime & data',
  'Track orders in real time',
  'Exclusive deals from top restaurants',
]

function PasswordStrength({ password }: { password: string }) {
  const strength = (() => {
    let score = 0
    if (password.length >= 8)            score++
    if (/[A-Z]/.test(password))          score++
    if (/[0-9]/.test(password))          score++
    if (/[^A-Za-z0-9]/.test(password))   score++
    return score
  })()

  const levels = [
    { label: 'Weak',      color: 'bg-red-400'          },
    { label: 'Fair',      color: 'bg-brand-yellow'      },
    { label: 'Good',      color: 'bg-brand-green'       },
    { label: 'Strong',    color: 'bg-brand-green'       },
  ]

  if (!password) return null
  const level = levels[Math.min(strength - 1, 3)] ?? levels[0]

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? level.color : 'bg-brand-border'}`} />
        ))}
      </div>
      <p className="text-xs text-brand-muted">{level.label} password</p>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const { user, isLoaded, login } = useAuth()

  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms,          setAgreeTerms]          = useState(false)
  const [loading,             setLoading]             = useState(false)
  const [error,               setError]               = useState('')
  const [success,             setSuccess]             = useState(false)

  // Already signed in → go to menu
  useEffect(() => {
    if (isLoaded && user) router.replace('/menu')
  }, [isLoaded, user, router])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const { name, email, phone, password, confirmPassword } = form

    if (!name.trim())                         return setError('Full name is required.')
    if (!email.trim())                        return setError('Email address is required.')
    if (!/\S+@\S+\.\S+/.test(email))          return setError('Please enter a valid email address.')
    if (!phone.trim())                        return setError('Phone number is required.')
    if (!/^[0-9+\s\-()]{7,15}$/.test(phone)) return setError('Please enter a valid phone number.')
    if (password.length < 8)                  return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword)         return setError('Passwords do not match.')
    if (!agreeTerms)                          return setError('Please agree to the Terms & Privacy Policy.')

    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)

    // Create and persist user, then auto-login
    const newUser = {
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone.trim(),
      cashback:  500,                        // ₦500 welcome bonus
      createdAt: new Date().toISOString(),
    }
    registerUser(newUser)
    login(newUser)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-card max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-brand-green" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-brand-dark mb-3">Account Created! 🎉</h1>
          <p className="text-brand-muted text-sm mb-2">
            Welcome, <strong className="text-brand-dark">{form.name.split(' ')[0]}</strong>! Your account is ready.
          </p>
          <p className="text-brand-muted text-sm mb-8">
            You&apos;ve been given <span className="text-brand-cashback font-semibold">₦500 cashback</span> as a welcome bonus!
          </p>

          <div className="bg-brand-cashback-light rounded-2xl p-4 mb-8 flex items-center gap-3 text-left">
            <span className="text-2xl shrink-0">💜</span>
            <div>
              <p className="text-brand-cashback font-semibold text-sm">Welcome Bonus!</p>
              <p className="text-brand-cashback/70 text-xs">₦500 cashback added to your wallet</p>
            </div>
          </div>

          {/* Already logged in — go straight to ordering */}
          <button
            onClick={() => router.push('/menu')}
            className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Start Ordering Now 🍽️
          </button>
          <Link href="/" className="mt-4 block text-sm text-brand-muted hover:text-brand-orange transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 gradient-cashback flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-extrabold text-2xl text-white">Package-Am</span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            💜 Start Earning Today
          </span>
          <h2 className="font-syne font-extrabold text-white text-4xl leading-tight mb-4">
            Order food &<br />earn cashback<br />every time
          </h2>
          <p className="text-white/70 text-base mb-8 leading-relaxed">
            Create your free account and get ₦500 cashback as a welcome bonus.
          </p>

          <ul className="space-y-3.5">
            {PERKS.map(perk => (
              <li key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-brand-cashback" />
                </div>
                <span className="text-white/90 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">AO</div>
            <div>
              <p className="text-white font-semibold text-sm">Amaka Obi</p>
              <p className="text-white/50 text-xs">Lagos, Nigeria</p>
            </div>
          </div>
          <p className="text-white/80 text-sm italic">&quot;I&apos;ve earned over ₦12,000 in cashback this month alone. Package-Am is amazing!&quot;</p>
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center px-5 sm:px-10 lg:px-16 py-10 bg-white overflow-y-auto">

        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
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
            <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-2">Create your account</h1>
            <p className="text-brand-muted text-base">Get ₦500 welcome cashback on sign up 🎁</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-brand-dark mb-1.5">Full Name</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                placeholder="Amaka Obi"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-semibold text-brand-dark mb-1.5">Email Address</label>
              <input
                id="signup-email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-1.5">Phone Number</label>
              <input
                id="phone" name="phone" type="tel" autoComplete="tel"
                value={form.phone} onChange={handleChange}
                placeholder="08012345678"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-brand-dark mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="signup-password" name="password"
                  type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 pr-11 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-dark mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full bg-brand-bg border rounded-xl px-4 py-3 pr-11 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 transition-all ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? 'border-brand-green focus:border-brand-green focus:ring-brand-green/10'
                      : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/10'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors" aria-label="Toggle confirm password visibility">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green pointer-events-none" />
                )}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-orange rounded shrink-0"
              />
              <span className="text-sm text-brand-muted leading-relaxed">
                I agree to Package-Am&apos;s{' '}
                <Link href="#" className="text-brand-orange hover:underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-brand-orange hover:underline font-medium">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-card mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
