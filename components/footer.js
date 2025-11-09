import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Healio</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Your safe space for mental wellness and professional support.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[hsl(var(--foreground))]">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))] pt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>&copy; 2025 Healio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
