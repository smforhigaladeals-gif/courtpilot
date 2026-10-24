'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Facility = {
  id: string
  name: string
  address: string | null
  sport_template: string
  status: string
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

    // Get tenant IDs linked to this user
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

    setFacilities(tenants || [])
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

        {/* Linked Facilities */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Your Facilities</h2>

          {facilities.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-6 text-gray-600">
              No facilities linked to this account yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {facilities.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {f.address || 'No address'}
                      </p>
                      <p className="mt-1 text-xs capitalize text-emerald-700">
                        {f.sport_template} · {f.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim / Link a facility */}
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
