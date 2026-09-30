import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Errata Lens — ESP32',
  description: 'An agent that checks ESP32 errata against the datasheet for your silicon revision.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
