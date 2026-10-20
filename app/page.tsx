export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              CP
            </div>
            <span className="text-xl font-bold text-gray-900">CourtPilot</span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/find"
              className="text-sm font-medium text-gray-600 hover:text-emerald-700"
            >
              Find Courts
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              List Your Facility
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Book courts near you.
          <br />
          <span className="text-emerald-600">Manage them in one place.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          CourtPilot is the simple booking system for pickleball, badminton,
          tennis and more. Players find courts by location. Facility owners get
          a dashboard with zero technical hassle.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/find"
            className="w-full rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
          >
            Find Courts Near Me
          </a>
          <a
            href="/signup"
            className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            I Own a Facility
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Built for low maintenance
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border p-6">
              <div className="mb-3 text-2xl">📍</div>
              <h3 className="font-semibold text-gray-900">Location-first</h3>
              <p className="mt-2 text-sm text-gray-600">
                Players discover courts near them automatically. No searching by
                city name.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="mb-3 text-2xl">⚡</div>
              <h3 className="font-semibold text-gray-900">Live in minutes</h3>
              <p className="mt-2 text-sm text-gray-600">
                Facility owners register, add courts, and go live without any
                technical setup.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="mb-3 text-2xl">🛠️</div>
              <h3 className="font-semibold text-gray-900">Zero babysitting</h3>
              <p className="mt-2 text-sm text-gray-600">
                Fully managed. No servers to maintain, no debugging calls at
                midnight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        CourtPilot — Multi-sport court booking made simple
      </footer>
    </main>
  )
}
