import type { Metadata, Viewport } from 'next'
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Package-Am',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: "Package-Am | Nigeria's Favourite Food Delivery",
    description: 'Order food and earn 5% cashback every time.',
    siteName: 'Package-Am',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#FF5A1F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
