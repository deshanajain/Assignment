import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  if (loading) return <Loading />;
  if (!token) {
    router.push('/login');
    return null;
  }
  return <>{children}</>;
}
