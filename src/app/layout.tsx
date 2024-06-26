import { Analytics } from "@vercel/analytics/react"
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'InBuilding',
  description: 'Accelerate built environment decarbonization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  )
}