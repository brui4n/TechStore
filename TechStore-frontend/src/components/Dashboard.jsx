import { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { getMe } from '../api/auth';
import { Store, Users, LogOut, Package, Shield, Key } from 'lucide-react';
import UsersList from './UsersList';
import ProductosList from './ProductosList';
import LogsList from './LogsList';
import RolesList from './RolesList';
import TiendasList from './TiendasList';

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

  const permisos = user.permisos_planos || [];
  const userRoles = user.Rols?.map(r => r.nombre) || [];
  
  // ABAC / Dynamic Permissions checks
  const canManageRoles = permisos.includes('manage_roles');
  const canManageUsers = permisos.includes('manage_users');
  const canManageTiendas = permisos.includes('manage_tiendas');
  const canViewAudit = permisos.includes('view_audit_logs');

  const navigation = [
    { name: 'Inventario', href: '/dashboard', icon: Package, show: true },
    { name: 'Gestión de Tiendas', href: '/dashboard/tiendas', icon: Store, show: canManageTiendas },
    { name: 'Gestión de Roles', href: '/dashboard/roles', icon: Key, show: canManageRoles },
    { name: 'Gestión de Usuarios', href: '/dashboard/users', icon: Users, show: canManageUsers },
    { name: 'Auditoría', href: '/dashboard/logs', icon: Shield, show: canViewAudit },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Store className="w-6 h-6 text-blue-400 mr-2" />
          <span className="font-bold text-lg tracking-tight">TechStore</span>
        </div>
        
        <div className="p-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-white">{user.nombre_completo}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {userRoles.map(role => (
                <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  {role}
                </span>
              ))}
              {userRoles.length === 0 && <span className="text-xs text-orange-400">Sin roles asignados</span>}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => item.show && (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                (location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user.nombre_completo.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700">{user.nombre_completo}</div>
              <div className="text-xs text-slate-500">Tienda {user.tienda_id} • {userRoles.join(', ')}</div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<ProductosList />} />
            <Route path="/tiendas" element={canManageTiendas ? <TiendasList /> : <div className="text-red-500">Acceso Denegado</div>} />
            <Route path="/roles" element={canManageRoles ? <RolesList /> : <div className="text-red-500">Acceso Denegado</div>} />
            <Route path="/users" element={canManageUsers ? <UsersList /> : <div className="text-red-500">Acceso Denegado</div>} />
            <Route path="/logs" element={canViewAudit ? <LogsList /> : <div className="text-red-500">Acceso Denegado</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
