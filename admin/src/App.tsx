import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminThemeProvider } from './context/AdminThemeContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

function AdminAppContent() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminDashboardPage />;
}

export function App() {
  return (
    <AdminAuthProvider>
      <AdminThemeProvider>
        <AdminAppContent />
      </AdminThemeProvider>
    </AdminAuthProvider>
  );
}

export default App;
