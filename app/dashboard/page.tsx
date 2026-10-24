'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="text-gray-600">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              CP
            </div>
            <span className="text-xl font-bold text-gray-900">CourtPilot</span>
          </a>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome{user?.email ? `, ${user.email}` : ''}. This is your facility
          management area.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Courts</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your courts and availability.
            </p>
            <p className="mt-4 text-xs text-emerald-600">Coming next</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Bookings</h2>
            <p className="mt-2 text-sm text-gray-600">
              See today’s and upcoming bookings.
            </p>
            <p className="mt-4 text-xs text-emerald-600">Coming next</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Settings</h2>
            <p className="mt-2 text-sm text-gray-600">
              Facility details, hours, and pricing.
            </p>
            <p className="mt-4 text-xs text-emerald-600">Coming next</p>
          </div>
        </div>
      </section>
    </main>
  )
}
