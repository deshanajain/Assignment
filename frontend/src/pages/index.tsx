import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold text-blue-600">
  📈        StockTracker
        </h1>

        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-5 py-2 rounded-lg border border-blue-400 hover:bg-blue-500 transition">
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Track Stocks.
              <br />
              Get Alerts.
              <br />
              Grow Smarter.
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Monitor your favorite stocks, receive real-time alerts,
              manage your portfolio, and track profits & losses all
              in one place.
            </p>

            <div className="flex gap-4 mt-8">
              <Link href="/signup">
                <button className="px-8 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition">
                  Get Started
                </button>
              </Link>

              <Link href="/login">
                <button className="px-8 py-3 border border-gray-400 rounded-lg hover:bg-white hover:text-black transition">
                  Login
                </button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md">  
                <h2 className="text-xl font-bold mb-4 text-blue-600">
                Market Snapshot
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>RELIANCE</span>
                  <span className="text-green-400">₹3,012 ▲</span>
                </div>

                <div className="flex justify-between">
                  <span>TCS</span>
                  <span className="text-green-400">₹4,125 ▲</span>
                </div>

                <div className="flex justify-between">
                  <span>INFY</span>
                  <span className="text-red-400">₹1,542 ▼</span>
                </div>

                <div className="flex justify-between">
                  <span>HDFCBANK</span>
                  <span className="text-green-400">₹1,876 ▲</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Key Features
        </h2>

        <Link href="/login">
          <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-3">
                🔍 Stock Search
            </h3>
            <p className="text-gray-600">
                  Search stocks and view market details instantly.
            </p>
          </div>
        </Link>

          <Link href="/login">
            <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">
                  ⭐ Watchlist
              </h3>
              <p className="text-gray-600">
                  Save your favorite stocks and monitor them easily.
              </p>
            </div>
          </Link>

          <Link href="/login">
            <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">
                  🔔 Price Alerts
              </h3>
              <p className="text-gray-600">
                  Get notified when a stock reaches your target price.
              </p>
            </div>
          </Link>

          <Link href="/login">
            <div className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">
                  💰 Portfolio Tracker
              </h3>
              <p className="text-gray-600">
              Track holdings, profit/loss, and portfolio performance.
              </p>
            </div>
          </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-400">
        © 2026 Stock Alert & Portfolio Tracker
      </footer>
    </div>
  );
}