import { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { getMe } from '../api/auth';
import { Store, Users, LogOut, Package, Shield } from 'lucide-react';
import UsersList from './UsersList';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;
  if (!user) return null;

  const userRoles = user.Rols?.map(r => r.nombre) || [];
  const isAdmin = userRoles.includes('Admin');
  const isManager = userRoles.includes('Gerente');

  const navigation = [
    { name: 'Inventario', href: '/dashboard', icon: Package, show: true },
    { name: 'Gestión de Usuarios', href: '/dashboard/users', icon: Users, show: isAdmin || isManager },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">TechStore</span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-6 px-2">
            <p className="text-sm font-medium text-slate-900">{user.nombre_completo}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {userRoles.map(role => (
                <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  {role}
                </span>
              ))}
              {userRoles.length === 0 && <span className="text-xs text-orange-500">Sin roles asignados</span>}
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/dashboard');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {location.pathname === '/dashboard/users' ? 'Gestión de Usuarios' : 'Inventario de Tienda'}
          </h1>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center"><Package className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h2 className="text-xl font-medium text-slate-700">Módulo de Inventario</h2><p className="text-slate-500 mt-2">Fase 3: ABAC - Próximamente</p></div>} />
            <Route path="/users" element={isAdmin || isManager ? <UsersList /> : <div className="text-red-500">Acceso Denegado</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
