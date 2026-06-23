import NavBar from './NavBar';
import ProtectedRoute from './ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
