import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active
            ? 'text-white underline underline-offset-4'
            : 'text-blue-200 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-[#1e3a5f] px-6 py-3 flex items-center gap-6 shadow-md">
      <Link to="/projects" className="text-white font-bold text-base tracking-tight hover:opacity-80 transition-opacity">Projekt-Management</Link>
      {navLink('/projects', 'Projekte')}
      {auth?.role === 'ADMIN' && navLink('/admin/users', 'Benutzer')}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-blue-200 text-sm">{auth?.username} · {auth?.role}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
        >
          Abmelden
        </button>
      </div>
    </nav>
  );
}
