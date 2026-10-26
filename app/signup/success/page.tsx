export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; id?: string }>
}) {
  const params = await searchParams
  const name = params.name || 'your facility'
  const id = params.id || ''

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
          <h1 className="text-2xl font-bold text-gray-900">
            {name} is created
          </h1>
          <p className="mt-3 text-gray-600">
            Next step (required): add the courts players will book.
            Without courts, players cannot reserve a time.
          </p>

          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
            <strong>Important:</strong> You must add at least one court to finish setup.
          </div>

          <a
            href={`/onboarding/courts?name=${encodeURIComponent(name)}&id=${id}`}
            className="mt-8 inline-block w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white hover:bg-emerald-700"
          >
            Add Courts Now →
          </a>
        </div>
      </section>
    </main>
  )
}
