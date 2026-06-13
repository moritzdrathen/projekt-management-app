import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import UsersPage from './pages/UsersPage';
import Navbar from './components/Navbar';
import { ReactNode } from 'react';

function PrivateRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" />;
  if (requiredRole && auth.role !== requiredRole) return <Navigate to="/projects" />;
  return <>{children}</>;
}

export default function App() {
  const { auth } = useAuth();

  return (
    <BrowserRouter>
      {auth && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute requiredRole="ADMIN"><UsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={auth ? '/projects' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
