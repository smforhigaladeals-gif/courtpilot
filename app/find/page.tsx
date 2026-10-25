'use client'

import { useState } from 'react'

type Facility = {
  id: string
  name: string
  address: string | null
  sport_template: string
  distance_meters: number
}

export default function FindCourtsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [searched, setSearched] = useState(false)

  async function findNearby() {
    setLoading(true)
    setError('')
    setFacilities([])
    setSearched(true)

    if (!navigator.geolocation) {
      setError('Location is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const res = await fetch(
            `/api/nearby?lat=${latitude}&lng=${longitude}`
          )
          const data = await res.json()

          if (!res.ok) {
            setError(data.error || 'Could not find courts')
            setLoading(false)
            return
          }

          setFacilities(data.facilities || [])
        } catch (err) {
          setError('Network error. Please try again.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Please allow location access to find courts near you.')
        setLoading(false)
      }
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              CP
            </div>
            <span className="text-xl font-bold text-gray-900">CourtPilot</span>
          </a>
          <a
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            List Your Facility
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Find courts near you
        </h1>
        <p className="mt-3 text-gray-600">
          We use your location to show the closest available courts.
        </p>

        <button
          onClick={findNearby}
          disabled={loading}
          className="mt-8 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Finding courts…' : 'Use My Location'}
        </button>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {/* Results */}
      {searched && !loading && (
        <section className="mx-auto max-w-2xl px-4 pb-20">
          {facilities.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-600">
              No courts found nearby yet. Be the first to list a facility!
            </div>
          ) : (
            <div className="space-y-4">
              {facilities.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">{f.name}</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {f.address || 'Address not set'}
                      </p>
                      <p className="mt-1 text-xs capitalize text-emerald-700">
                        {f.sport_template}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {f.distance_meters < 1000
                          ? `${Math.round(f.distance_meters)} m`
                          : `${(f.distance_meters / 1000).toFixed(1)} km`}
                      </div>
                      <a
                        href={`/book/${f.id}`}
                        className="mt-2 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Book
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}
