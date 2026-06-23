import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { request } from '../lib/api';
import Loading from '../components/Loading';
import StockCard from '../components/StockCard';
import Alert from '../components/Alert';
import Link from 'next/link';

interface Summary {
  invested: number;
  currentValue: number;
  pl: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  async function loadData() {
    try {
      const [holdingsRes, alertsRes, watchlistRes] = await Promise.all([
        request('/holdings'),
        request('/alerts'),
        request('/watchlist')
      ]);
      setSummary(holdingsRes.summary);
      setAlerts(alertsRes.filter((a: any) => !a.isTriggered).slice(0, 3));
      setWatchlist(watchlistRes.slice(0, 3));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const searchStock = async () => {
    if (!symbol) return;
    setSearching(true);
    try {
      const data = await request(`/stocks/${symbol.toUpperCase()}`);
      setStockData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <Loading />;

  const pl = summary?.pl ?? 0;
  const plColor = pl >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Layout>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Portfolio Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Invested Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{summary.invested.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Current Value</p>
              <p className="text-2xl font-bold text-blue-600">₹{summary.currentValue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Profit/Loss</p>
              <p className={`text-2xl font-bold ${plColor}`}>₹{pl.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Stock Search */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Stock Search</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Search by symbol (e.g., AAPL)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchStock}
              disabled={searching}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {stockData && (
            <div className="mt-4">
              <StockCard stock={stockData} />
            </div>
          )}
        </div>

        {/* Active Alerts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Alerts ({alerts.length})</h3>
            <Link href="/alerts" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a._id} className="p-3 border border-gray-200 rounded bg-gray-50">
                  <p className="font-semibold">
                    {a.symbol} {a.condition === 'GT' ? '>' : '<'} ₹{a.targetPrice}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active alerts</p>
          )}
        </div>

        {/* Watchlist Preview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Watchlist Preview ({watchlist.length})</h3>
            <Link href="/watchlist" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {watchlist.length > 0 ? (
            <div className="space-y-2">
              {watchlist.map((w) => (
                <StockCard key={w._id} stock={w} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No watchlist items yet</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/watchlist" className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <p className="text-2xl mb-2">⭐</p>
            <p className="font-semibold text-blue-600">Watchlist</p>
            <p className="text-sm text-gray-600">Manage tracked stocks</p>
          </Link>
          <Link href="/portfolio" className="bg-green-50 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <p className="text-2xl mb-2">💼</p>
            <p className="font-semibold text-green-600">Portfolio</p>
            <p className="text-sm text-gray-600">View holdings & P&L</p>
          </Link>
          <Link href="/alerts" className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <p className="text-2xl mb-2">🔔</p>
            <p className="font-semibold text-purple-600">Alerts</p>
            <p className="text-sm text-gray-600">Create price alerts</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
