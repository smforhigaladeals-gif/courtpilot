'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Court = {
  id: string
  name: string
  is_active: boolean
}

type Facility = {
  id: string
  name: string
  address: string | null
  sport_template: string
}

export default function BookPage() {
  const params = useParams()
  const facilityId = params.facilityId as string

  const [facility, setFacility] = useState<Facility | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedCourt, setSelectedCourt] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/facilities/${facilityId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Facility not found')
          setLoading(false)
          return
        }

        setFacility(data.facility)
        setCourts(data.courts || [])
        if (data.courts?.length > 0) {
          setSelectedCourt(data.courts[0].id)
        }
      } catch (err) {
        setError('Could not load facility')
      } finally {
        setLoading(false)
      }
    }

    if (facilityId) load()
  }, [facilityId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    if (!selectedCourt || !date || !guestName || !guestPhone) {
      setSubmitError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: facilityId,
          courtId: selectedCourt,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          guestName,
          guestPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Booking failed')
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="text-gray-600">Loading…</p>
      </main>
    )
  }

  if (error || !facility) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 px-4">
        <p className="text-red-600">{error || 'Facility not found'}</p>
        <a href="/find" className="mt-4 text-emerald-600 hover:underline">
          ← Back to Find Courts
        </a>
      </main>
    )
  }

  if (success) {
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
          </div>
        </header>
        <section className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="rounded-2xl border bg-white p-10 shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Booking confirmed</h1>
            <p className="mt-3 text-gray-600">
              Your court at <strong>{facility.name}</strong> is reserved.
              You will receive a confirmation shortly.
            </p>
            <a
              href="/find"
              className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Find more courts
            </a>
          </div>
        </section>
      </main>
    )
  }

  // Default date = today
  const today = new Date().toISOString().split('T')[0]

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
          <a href="/find" className="text-sm text-emerald-600 hover:underline">
            Find Courts
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
          <p className="mt-1 text-gray-600">{facility.address}</p>
          <p className="mt-1 text-sm capitalize text-emerald-700">
            {facility.sport_template}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Book a court</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Court
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {courts
                  .filter((c) => c.is_active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={1}>1 hour</option>
                  <option value={1.5}>1.5 hours</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your name
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile number
              </label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {submitError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || courts.length === 0}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
