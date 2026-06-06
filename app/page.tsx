import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Timer, CheckCircle, Smartphone, Search, ShoppingCart, Bike, BadgePercent, Wifi, UtensilsCrossed } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimateIn from '@/components/ui/AnimateIn'
import { StaggerGrid, StaggerItem } from '@/components/ui/StaggerGrid'
import { FOOD_ITEMS, CATEGORIES } from '@/lib/data'

const STATS = [
  { value: '50+',  label: 'Restaurants'   },
  { value: '2k+',  label: 'Happy Customers'},
  { value: '5%',   label: 'Cashback Always'},
]

const HOW_IT_WORKS = [
  { step: '01', icon: Search,       title: 'Browse & Pick',    desc: 'Explore 50+ restaurants and choose from hundreds of delicious meals.' },
  { step: '02', icon: ShoppingCart, title: 'Place Your Order', desc: 'Add items to your cart, confirm your address, and pay securely.' },
  { step: '03', icon: Bike,         title: 'Fast Delivery',    desc: 'Your order is prepared and delivered hot to your door, fast.' },
  { step: '04', icon: BadgePercent, title: 'Earn Cashback',    desc: 'Get 5% cashback credited instantly. Redeem for airtime or more food!' },
]

export default function HomePage() {
  const featured = FOOD_ITEMS.slice(0, 4)

  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero min-h-[92vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-orange/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-cashback/5 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy — staggered children */}
          <AnimateIn direction="up" duration={0.7}>
            <span className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange text-sm font-semibold px-4 py-2 rounded-full mb-6">
              🚀 Fastest Delivery in Town
            </span>

            <h1 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] text-brand-dark leading-[1.15] mb-6">
              Order Food,{' '}
              <span className="text-brand-orange">Earn Cashback</span>{' '}
              Every Time
            </h1>

            <p className="text-brand-muted text-lg leading-relaxed mb-8 max-w-lg">
              Nigeria&apos;s favourite food delivery platform. Fast, tasty, and rewarding — every single order.
            </p>

            <div className="flex flex-col xs:flex-row flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 gradient-orange text-white px-7 py-4 rounded-full font-syne font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-card"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border-2 border-brand-border text-brand-text px-7 py-4 rounded-full font-syne font-semibold text-base hover:border-brand-orange hover:text-brand-orange transition-colors"
              >
                Browse Menu
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <div className="font-syne font-extrabold text-2xl text-brand-dark">{stat.value}</div>
                  <div className="text-brand-muted text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimateIn>

          {/* Right: hero image + floating cards */}
          <AnimateIn direction="left" duration={0.8} delay={0.15}>
            <div className="relative flex justify-center lg:justify-end animate-hero-float px-12 sm:px-16 lg:px-0">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-white shadow-[0_24px_64px_rgba(255,90,31,0.18)]">
                <Image
                  src="/gineer/pizzza.jpg"
                  alt="Gineer Special Mix Pizza"
                  fill
                  priority
                  sizes="320px"
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:flex absolute -left-4 top-1/4 bg-white rounded-2xl shadow-card px-4 py-3 items-center gap-3 min-w-[150px]">
                <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted">Order placed!</p>
                  <p className="text-xs font-semibold text-brand-dark">Gineer Pizza 🎉</p>
                </div>
              </div>
              <div className="hidden sm:flex absolute -right-2 bottom-1/4 bg-white rounded-2xl shadow-card px-4 py-3 items-center gap-3 min-w-[150px]">
                <div className="w-9 h-9 gradient-orange rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">🚀</span>
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted">Delivering now</p>
                  <p className="text-xs font-semibold text-brand-dark">25–35 mins ⚡</p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Search ───────────────────────────────────────────── */}
      <AnimateIn direction="none">
        <section className="bg-white py-6 shadow-sm">
          <div className="max-w-2xl mx-auto px-4">
            <Link
              href="/menu"
              className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-full px-5 py-4 hover:border-brand-orange transition-colors group cursor-text"
            >
              <svg className="w-5 h-5 text-brand-muted group-hover:text-brand-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="text-brand-muted text-sm flex-1">Search for jollof rice, pizza, burgers…</span>
              <span className="text-brand-orange text-sm font-semibold hidden sm:block">Search</span>
            </Link>
          </div>
        </section>
      </AnimateIn>

      {/* ── Categories ───────────────────────────────────────── */}
      <AnimateIn direction="up" delay={0.05}>
        <section className="py-8 bg-white border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.id}
                  href={`/menu?cat=${cat.id}`}
                  className="flex items-center gap-2 whitespace-nowrap bg-brand-bg border border-brand-border text-brand-text px-4 py-2.5 rounded-full text-sm font-medium hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all duration-200 shrink-0"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ── Cashback banner ──────────────────────────────────── */}
      <section id="cashback" className="py-16 gradient-cashback">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <AnimateIn direction="right" className="text-white text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-5">
                💜 Exclusive Rewards
              </div>
              <h2 className="font-syne font-extrabold text-3xl sm:text-4xl mb-3">Your Cashback, Your Rules</h2>
              <p className="text-white/70 text-base max-w-md">
                Every order earns you 5% cashback. Redeem it however you want — no expiry, no hassle.
              </p>
            </AnimateIn>

            <AnimateIn direction="left" delay={0.15}>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Your balance</p>
                  <p className="font-syne font-extrabold text-white text-4xl">₦1,250</p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {[
                    { icon: Smartphone,      label: 'Buy Airtime', href: '/cashback' },
                    { icon: Wifi,            label: 'Buy Data',    href: '/cashback' },
                    { icon: UtensilsCrossed, label: 'Order Food',  href: '/menu'     },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl py-3 px-2"
                    >
                      <Icon className="w-5 h-5 text-white" />
                      <span className="text-white text-[11px] font-medium text-center leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Popular items preview ─────────────────────────────── */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn direction="up" className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-syne font-extrabold text-3xl text-brand-dark mb-1">🍽️ What Are You Craving?</h2>
              <p className="text-brand-muted text-sm">Fresh, local, and always delicious</p>
            </div>
            <Link
              href="/menu"
              className="hidden sm:inline-flex items-center gap-1.5 text-brand-orange font-semibold text-sm hover:gap-2.5 transition-all"
            >
              View Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimateIn>

          <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(item => (
              <StaggerItem key={item.id}>
                <Link href="/menu" className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  <div className="relative h-40 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-brand-dark text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="font-syne font-semibold text-brand-dark text-xs leading-snug mb-1 line-clamp-2">{item.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-brand-muted mb-2">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-brand-yellow text-brand-yellow" /> {item.rating}
                      </span>
                      <span className="flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />{item.time}</span>
                    </div>
                    <div className="mt-auto font-syne font-bold text-brand-orange text-sm">
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/menu" className="inline-flex items-center gap-2 gradient-orange text-white px-6 py-3 rounded-full font-syne font-semibold text-sm hover:opacity-90 transition-opacity">
              View Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-brand-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn direction="up" className="text-center mb-14">
            <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-3">How Package-Am Works</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto">Four simple steps between you and your next favourite meal</p>
          </AnimateIn>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <StaggerItem key={step}>
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group h-full">
                  <div className="text-brand-orange/20 font-syne font-extrabold text-5xl absolute top-4 right-5 select-none">{step}</div>
                  <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center mb-4 shadow-card group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-syne font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <AnimateIn direction="up">
        <section className="py-16 bg-brand-bg">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-syne font-extrabold text-3xl text-brand-dark mb-4">Ready to order?</h2>
            <p className="text-brand-muted mb-8">Join 2,000+ Nigerians already earning cashback on every order.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 gradient-orange text-white px-7 py-3.5 rounded-full font-syne font-semibold hover:opacity-90 active:scale-95 transition-all shadow-card">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 border border-brand-border text-brand-text px-7 py-3.5 rounded-full font-syne font-semibold hover:border-brand-orange hover:text-brand-orange transition-colors">
                Browse Menu
              </Link>
            </div>
          </div>
        </section>
      </AnimateIn>

      <Footer />
    </>
  )
}
