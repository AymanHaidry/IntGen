import type { Metadata } from 'next'
import { Fraunces, Geist } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IntGen — Chart & Diagram Generator',
  description:
    'Build polished, Excel-ready charts. Enter values, pick colors, choose a chart type, and export as PNG or an editable Excel workbook.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`bg-background ${fraunces.variable} ${geist.variable}`}>
      <body className="font-serif antialiased">{children}</body>
    </html>
  )
}
