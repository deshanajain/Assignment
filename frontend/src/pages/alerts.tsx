import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { request } from '../lib/api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('GT');
  const [targetPrice, setTargetPrice] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await request('/alerts');
      setAlerts(res);
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
    if (targetPrice <= 0) newErrors.targetPrice = 'Price must be greater than 0';
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
      await request('/alerts', {
        method: 'POST',
        body: JSON.stringify({ symbol, condition, targetPrice })
      });
      setSymbol('');
      setCondition('GT');
      setTargetPrice(0);
      setSuccess('Alert created!');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await request(`/alerts/${id}`, { method: 'DELETE' });
      setSuccess('Alert deleted');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.isTriggered);
  const triggeredAlerts = alerts.filter((a) => a.isTriggered);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Price Alerts</h2>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Create Alert Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create New Alert</h3>
          <form onSubmit={add} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Stock Symbol"
                name="symbol"
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={setSymbol}
                error={errors.symbol}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GT">Greater Than</option>
                  <option value="LT">Less Than</option>
                </select>
              </div>
              <Input
                label="Target Price (₹)"
                name="targetPrice"
                type="number"
                placeholder="Price"
                value={targetPrice}
                onChange={(v) => setTargetPrice(Number(v))}
                error={errors.targetPrice}
                required
              />
              <div className="flex items-end">
                <Button type="submit" loading={adding} className="w-full">
                  Create Alert
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Active Alerts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Active Alerts ({activeAlerts.length})
          </h3>
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((a) => (
                <div key={a._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">
                        {a.symbol}{' '}
                        <span className="text-blue-600">
                          {a.condition === 'GT' ? '>' : '<'} ₹{a.targetPrice}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => remove(a._id)} className="text-sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <p className="text-gray-700">No active alerts</p>
            </div>
          )}
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Triggered Alerts ({triggeredAlerts.length})
            </h3>
            <div className="space-y-3">
              {triggeredAlerts.map((a) => (
                <div key={a._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-green-600">
                        ✓ {a.symbol} {a.condition === 'GT' ? '>' : '<'} ₹{a.targetPrice}
                      </p>
                      <p className="text-sm text-gray-600">
                        Triggered: {new Date(a.triggeredAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => remove(a._id)} className="text-sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
