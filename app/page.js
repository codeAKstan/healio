import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--foreground))]">
                Your Space for Peace of Mind
              </h1>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                Track your moods, journal your thoughts, access professional support, and connect with therapists in a
                safe, private environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button className="bg-[hsl(var(--primary))] hover:bg-blue-600 text-white px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="px-8 py-6 text-lg border-[hsl(var(--border))] bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Mood Tracking",
                  description: "Log your daily emotions and visualize patterns over time with beautiful charts.",
                  icon: "😊",
                },
                {
                  title: "Private Journaling",
                  description: "Express yourself freely with secure, encrypted journal entries.",
                  icon: "📝",
                },
                {
                  title: "Professional Support",
                  description: "Connect with licensed therapists and book appointments seamlessly.",
                  icon: "👨‍⚕️",
                },
                {
                  title: "Self-Help Resources",
                  description: "Access articles, guides, and coping strategies for mental wellness.",
                  icon: "📚",
                },
                {
                  title: "Appointment Management",
                  description: "Schedule, reschedule, or cancel therapy sessions with ease.",
                  icon: "📅",
                },
                {
                  title: "Admin Dashboard",
                  description: "For administrators: manage users, therapists, and platform activity.",
                  icon: "⚙️",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of users finding peace and support with Healio.</p>
            <Link href="/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">Get Started Free</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
