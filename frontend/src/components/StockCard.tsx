export default function StockCard({ stock }: { stock: any }) {
  if (!stock.currentPrice) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="font-semibold text-lg">{stock.symbol}</div>
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  const percentChange = stock.percentChange || 0;
  const changeColor = percentChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-lg">{stock.symbol}</p>
          <p className="text-sm text-gray-600">Stock Info</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">₹{stock.currentPrice?.toFixed(2)}</p>
          <p className={`font-semibold ${changeColor}`}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm border-t pt-3">
        <div>
          <p className="text-gray-600">High</p>
          <p className="font-semibold">₹{stock.high?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600">Low</p>
          <p className="font-semibold">₹{stock.low?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600">Volume</p>
          <p className="font-semibold">{(stock.volume || 0) / 1e6}M</p>
        </div>
      </div>
    </div>
  );
}
