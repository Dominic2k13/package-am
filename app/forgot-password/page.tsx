'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Package, ArrowRight, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

type Stage = 'email' | 'sent'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [stage,   setStage]   = useState<Stage>('email')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim())                      return setError('Please enter your email address.')
    if (!/\S+@\S+\.\S+/.test(email))        return setError('Please enter a valid email address.')

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setStage('sent')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: brand ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 gradient-orange flex-col justify-between p-12 relative overflow-hidden">
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

        {/* Middle */}
        <div className="relative">
          <h2 className="font-syne font-extrabold text-white text-4xl leading-tight mb-4">
            No worries,<br />we&apos;ve got you.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Enter the email address linked to your account and we&apos;ll send you a reset link right away.
          </p>
        </div>

        {/* Bottom */}
        <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-1">Remembered your password?</p>
          <p className="text-white/60 text-xs mb-3">Head back and sign in to keep ordering.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
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

          {stage === 'email' ? (
            <>
              {/* Back link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-orange text-sm font-medium transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>

              <div className="mb-8">
                <div className="w-14 h-14 gradient-orange rounded-2xl flex items-center justify-center mb-5 shadow-card">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-2">Forgot Password?</h1>
                <p className="text-brand-muted text-base">
                  No stress — enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-card"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-brand-muted">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-brand-orange font-semibold hover:underline">
                  Create one free
                </Link>
              </p>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-syne font-extrabold text-3xl text-brand-dark mb-3">Check your inbox</h1>
              <p className="text-brand-muted text-base mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="font-semibold text-brand-dark text-base mb-8 break-all">{email}</p>

              <div className="bg-brand-bg border border-brand-border rounded-2xl p-5 mb-8 text-left space-y-2">
                <p className="text-brand-dark text-sm font-semibold">Didn&apos;t get the email?</p>
                <ul className="text-brand-muted text-sm space-y-1 list-disc list-inside">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you typed the right address</li>
                  <li>The link expires in 30 minutes</li>
                </ul>
              </div>

              <button
                onClick={() => { setStage('email'); setEmail('') }}
                className="w-full mb-3 gradient-orange text-white py-3.5 rounded-full font-syne font-semibold text-sm hover:opacity-90 transition-opacity shadow-card"
              >
                Try a different email
              </button>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 border border-brand-border text-brand-text py-3.5 rounded-full font-syne font-semibold text-sm hover:border-brand-orange hover:text-brand-orange transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
