import Link from 'next/link'
import { Package } from 'lucide-react'

const LINKS = {
  Company: [
    { label: 'About Us',      href: '#' },
    { label: 'Careers',       href: '#' },
    { label: 'Blog',          href: '#' },
    { label: 'Vendor Portal', href: '/vendor' },
  ],
  Support: [
    { label: 'Help Center',   href: '#' },
    { label: 'Track Order',   href: '#' },
    { label: 'Contact Us',    href: '#' },
    { label: 'Cashback FAQ',  href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy',    href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-orange rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-syne font-extrabold text-xl">
                <span className="text-brand-orange">Package</span>
                <span className="text-white">-Am</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Nigeria&apos;s favourite food delivery platform. Fast, tasty, and rewarding — every single order.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-syne font-semibold text-white mb-4 text-sm uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/50 text-sm hover:text-brand-orange transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© 2025 Package-Am. All rights reserved.</p>
          <p>Made with ❤️ in Nigeria</p>
        </div>
      </div>
    </footer>
  )
}
