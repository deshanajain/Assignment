import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { request } from '../lib/api';
import StockCard from '../components/StockCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Watchlist() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const list = await request('/watchlist');
      const enriched = await Promise.all(
        list.map(async (it: any) => {
          try {
            const data = await request(`/stocks/${it.symbol}`);
            return { id: it._id, symbol: it.symbol, ...data };
          } catch {
            return { id: it._id, symbol: it.symbol };
          }
        })
      );
      setItems(enriched);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!symbol) newErrors.symbol = 'Symbol is required';
    else if (symbol.length > 5) newErrors.symbol = 'Symbol too long';
    return newErrors;
  };

  const add = async (e: any) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setError('');
    setSuccess('');
    setAdding(true);
    try {
      await request('/watchlist', { method: 'POST', body: JSON.stringify({ symbol }) });
      setSymbol('');
      setSuccess('Added to watchlist!');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await request(`/watchlist/${id}`, { method: 'DELETE' });
      setSuccess('Removed from watchlist');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">My Watchlist</h2>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Add Stock Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Stock to Watchlist</h3>
          <form onSubmit={add} className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1">
              <Input
                label="Stock Symbol"
                name="symbol"
                placeholder="e.g., AAPL, GOOGL, RELIANCE"
                value={symbol}
                onChange={setSymbol}
                error={errors.symbol}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={adding}>
                Add Stock
              </Button>
            </div>
          </form>
        </div>

        {/* Watchlist Items */}
        {loading ? (
          <Loading />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((it) => (
              <div key={it.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <StockCard stock={it} />
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => remove(it.id)}
                    className="text-sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">No stocks in watchlist yet</p>
            <p className="text-gray-500">Add a stock to get started tracking prices</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
