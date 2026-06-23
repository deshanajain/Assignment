import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => router.pathname === path ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-blue-600';

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            📈 StockApp
          </Link>
          {user && (
            <div className="hidden md:flex space-x-6">
              <Link href="/watchlist" className={isActive('/watchlist')}>Watchlist</Link>
              <Link href="/portfolio" className={isActive('/portfolio')}>Portfolio</Link>
              <Link href="/alerts" className={isActive('/alerts')}>Alerts</Link>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user && <span className="text-sm text-gray-600">{user.name}</span>}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
