import { Analytics } from '@vercel/analytics/next'
import { Inter, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Sequence Flow | Interactive Journey Diagrams',
  description:
    'Author guided business and technical journeys, then ship them in React, native HTML, or a self-contained offline file.',
  generator: 'Next.js',
  metadataBase: new URL('https://sequence-flow.canadian-ai.app'),
  icons: {
    icon: [
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'Sequence Flow | Interactive Journey Diagrams',
    title: 'Sequence Flow | Interactive Journey Diagrams',
    description:
      'Author guided business and technical journeys, then ship them in React, native HTML, or a self-contained offline file.',
    url: 'https://sequence-flow.canadian-ai.app',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Sequence Flow | Interactive Journey Diagrams',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sequence Flow | Interactive Journey Diagrams',
    description:
      'Author guided business and technical journeys, then ship them in React, native HTML, or a self-contained offline file.',
    images: ['/twitter-image.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
