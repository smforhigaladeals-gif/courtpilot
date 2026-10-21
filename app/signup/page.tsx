export default function SignupPage() {
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
        </div>
      </header>

      {/* Form */}
      <section className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            List your facility
          </h1>
          <p className="mt-2 text-gray-600">
            Get your courts online in a few minutes. No technical setup needed.
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facility Name
              </label>
              <input
                type="text"
                placeholder="e.g. Green Valley Pickleball Club"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                placeholder="Full address of your facility"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Main Sport
              </label>
              <select className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="pickleball">Pickleball</option>
                <option value="badminton">Badminton</option>
                <option value="tennis">Tennis</option>
                <option value="padel">Padel</option>
                <option value="multi">Multi-sport</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Continue →
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-emerald-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
