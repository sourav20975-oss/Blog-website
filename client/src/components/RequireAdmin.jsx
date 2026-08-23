import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Sirf ADMIN ke liye — baaki sab ko home pe bhej do
export default function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // pehle login karao, phir wapas isi page pe
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
