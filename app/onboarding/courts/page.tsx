export const dynamic = 'force-dynamic'

'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AddCourtsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const facilityName = searchParams.get('name') || 'your facility'
  const tenantId = searchParams.get('id') || ''

  const [courts, setCourts] = useState(['Court 1'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addCourt() {
    setCourts([...courts, `Court ${courts.length + 1}`])
  }

  function updateCourt(index: number, value: string) {
    const updated = [...courts]
    updated[index] = value
    setCourts(updated)
  }

  function removeCourt(index: number) {
    if (courts.length <= 1) return
    setCourts(courts.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId) {
      setError('Missing facility ID. Please start from the signup form again.')
      return
    }

    const cleaned = courts.map((c) => c.trim()).filter(Boolean)
    if (cleaned.length === 0) {
      setError('Please add at least one court.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, courts: cleaned }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      router.push(`/onboarding/done?name=${encodeURIComponent(facilityName)}`)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
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
        </div>
      </header>

      <section className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-2 text-sm font-medium text-emerald-700">
            Step 2 of 2
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add courts for {facilityName}
          </h1>
          <p className="mt-2 text-gray-600">
            Players will choose from these courts when they book.
            Add at least one court to finish setup.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {courts.map((court, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Court {index + 1}
                  </label>
                  <input
                    type="text"
                    required
                    value={court}
                    onChange={(e) => updateCourt(index, e.target.value)}
                    placeholder={`e.g. Court ${index + 1}`}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                {courts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCourt(index)}
                    className="mb-0.5 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addCourt}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              + Add another court
            </button>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save Courts & Finish →'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
