 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Court = {
  id: string
  name: string
  is_active: boolean
  court_type: string | null
}

type Booking = {
  id: string
  start_time: string
  end_time: string
  status: string
  guest_name: string | null
  guest_phone: string | null
  court_id: string
  court_name?: string
}

type Facility = {
  id: string
  name: string
  address: string | null
  sport_template: string
  status: string
  courts: Court[]
  bookings: Booking[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [claimId, setClaimId] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState('')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      await loadFacilities(data.user.id)
      setLoading(false)
    })
  }, [router])

  async function loadFacilities(userId: string) {
    const supabase = createClient()

    const { data: links } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', userId)

    if (!links || links.length === 0) {
      setFacilities([])
      return
    }

    const tenantIds = links.map((l) => l.tenant_id)

    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, address, sport_template, status')
      .in('id', tenantIds)

    if (!tenants || tenants.length === 0) {
      setFacilities([])
      return
    }

    const { data: courts } = await supabase
      .from('courts')
      .select('id, name, is_active, court_type, tenant_id')
      .in('tenant_id', tenantIds)
      .order('sort_order')

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status, guest_name, guest_phone, court_id, tenant_id')
      .in('tenant_id', tenantIds)
      .in('status', ['pending', 'confirmed', 'completed'])
      .order('start_time', { ascending: true })
      .limit(50)

    const courtMap = new Map((courts || []).map((c) => [c.id, c.name]))

    const facilitiesWithData: Facility[] = tenants.map((t) => ({
      ...t,
      courts: (courts || []).filter((c) => c.tenant_id === t.id),
      bookings: (bookings || [])
        .filter((b) => b.tenant_id === t.id)
        .map((b) => ({
          ...b,
          court_name: courtMap.get(b.court_id) || 'Court',
        })),
    }))

    setFacilities(facilitiesWithData)
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!claimId.trim()) return

    setClaimLoading(true)
    setClaimError('')
    setClaimSuccess('')

    try {
      const res = await fetch('/api/link-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: claimId.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setClaimError(data.error || 'Could not link facility')
        setClaimLoading(false)
        return
      }

      setClaimSuccess('Facility linked successfully!')
      setClaimId('')
      if (user) await loadFacilities(user.id)
    } catch (err) {
      setClaimError('Network error')
    } finally {
      setClaimLoading(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
          Welcome{user?.email ? `, ${user.email}` : ''}.
        </p>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Your Facilities</h2>

          {facilities.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-6 text-gray-600">
              No facilities linked to this account yet.
            </div>
          ) : (
            <div className="mt-4 space-y-8">
              {facilities.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {f.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {f.address || 'No address'}
                    </p>
                    <p className="mt-1 text-xs capitalize text-emerald-700">
                      {f.sport_template} · {f.status}
                    </p>
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Courts ({f.courts.length})
                    </h4>
                    {f.courts.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">
                        No courts added yet.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {f.courts.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm"
                          >
                            <span className="font-medium text-gray-900">
                              {c.name}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs ${
                                c.is_active
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {c.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Bookings ({f.bookings.length})
                    </h4>
                    {f.bookings.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">
                        No bookings yet.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {f.bookings.map((b) => (
                          <li
                            key={b.id}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {b.guest_name || 'Guest'}
                                </p>
                                <p className="mt-0.5 text-gray-600">
                                  {b.court_name} · {formatDateTime(b.start_time)}
                                  {' – '}
                                  {new Date(b.end_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                {b.guest_phone && (
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {b.guest_phone}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs capitalize ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : b.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Link a facility
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            After you create a facility, paste its ID here to manage it from
            this dashboard.
          </p>

          <form onSubmit={handleClaim} className="mt-4 flex gap-3">
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Paste facility ID"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={claimLoading}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {claimLoading ? 'Linking…' : 'Link'}
            </button>
          </form>

          {claimError && (
            <p className="mt-3 text-sm text-red-600">{claimError}</p>
          )}
          {claimSuccess && (
            <p className="mt-3 text-sm text-emerald-600">{claimSuccess}</p>
          )}
        </div>
      </section>
    </main>
  )
}
