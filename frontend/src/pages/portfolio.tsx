import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { request } from '../lib/api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Portfolio() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await request('/holdings');
      setHoldings(res.holdings);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!symbol) newErrors.symbol = 'Symbol is required';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (buyPrice <= 0) newErrors.buyPrice = 'Price must be greater than 0';
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
      await request('/holdings', {
        method: 'POST',
        body: JSON.stringify({ symbol, quantity, buyPrice })
      });
      setSymbol('');
      setQuantity(0);
      setBuyPrice(0);
      setSuccess('Holding added!');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await request(`/holdings/${id}`, { method: 'DELETE' });
      setSuccess('Holding removed');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const pl = summary?.pl ?? 0;
  const plColor = pl >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">My Portfolio</h2>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Portfolio Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">₹{summary.invested.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Current Value</p>
              <p className="text-2xl font-bold">₹{summary.currentValue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Profit/Loss</p>
              <p className={`text-2xl font-bold ${plColor}`}>{pl >= 0 ? '+' : ''}₹{pl.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Add Holding Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add New Holding</h3>
          <form onSubmit={add} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stock Symbol"
                name="symbol"
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={(value) => setSymbol(String(value))}
                error={errors.symbol}
                required
              />
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                placeholder="Number of shares"
                value={quantity}
                onChange={(v) => setQuantity(Number(v))}
                error={errors.quantity}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Buy Price (₹)"
                name="buyPrice"
                type="number"
                placeholder="Price per share"
                value={buyPrice}
                onChange={(v) => setBuyPrice(Number(v))}
                error={errors.buyPrice}
                required
              />
              <div className="flex items-end">
                <Button type="submit" loading={adding} className="w-full">
                  Add Holding
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Holdings List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Holdings ({holdings.length})</h3>
          {holdings.length > 0 ? (
            <div className="space-y-3">
              {holdings.map((h) => (
                <div key={h.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg">{h.symbol}</p>
                      <p className="text-sm text-gray-600">
                        {h.quantity} shares @ ₹{h.buyPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => remove(h.id)} className="text-sm">
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Invested</p>
                      <p className="font-semibold">₹{h.invested.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Current Value</p>
                      <p className="font-semibold">₹{h.currentValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">P/L</p>
                      <p className={`font-semibold ${h.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {h.pl >= 0 ? '+' : ''}₹{h.pl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No holdings yet</p>
              <p className="text-sm text-gray-500">Add your first holding above</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
