import { Inter, Outfit } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata = {
  title: "Healio - Mental Health Support",
  description: "Your safe space for mental wellness",
  generator: "Healio",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
