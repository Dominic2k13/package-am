import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Package-Am | Nigeria's Favourite Food Delivery",
  description: 'Fast, tasty, and rewarding — every single order. Order food and earn 5% cashback every time.',
  keywords: ['food delivery', 'nigeria', 'jollof rice', 'cashback', 'package-am'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-dm-sans bg-brand-bg text-brand-text antialiased">
        {children}
      </body>
    </html>
  )
}
