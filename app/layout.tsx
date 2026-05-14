import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TrustCard - The Crypto Card That Moves With You | Trust Wallet',
  description: 'Spend directly from your Trust Wallet with 0% fees and earn 2% cashback on every purchase. The premium crypto card for global payments.',
  keywords: ['crypto card', 'trust wallet', 'cryptocurrency', 'debit card', 'crypto spending', 'cashback'],
  icons: {
    icon: [
      {
        url: '/trust-wallet-icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/trust-wallet-icon.svg',
        sizes: '32x32',
      },
    ],
    apple: '/trust-wallet-icon.svg',
    shortcut: '/trust-wallet-icon.svg',
  },
  openGraph: {
    title: 'TrustCard - The Crypto Card That Moves With You',
    description: 'Spend directly from your Trust Wallet with 0% fees and earn 2% cashback.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
