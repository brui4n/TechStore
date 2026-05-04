import { useState, useEffect } from 'react';
import { getUsers, getRoles, assignRole, removeRole } from '../api/users';
import { getMe } from '../api/auth';
import { X } from 'lucide-react';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, meRes] = await Promise.all([
        getUsers(),
        getRoles(),
        getMe()
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setCurrentUser(meRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRole = async (userId, rolId) => {
    try {
      await assignRole(userId, rolId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al asignar rol');
    }
  };

  const handleRemoveRole = async (userId, rolId) => {
    try {
      await removeRole(userId, rolId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al remover rol');
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const isAdmin = currentUser?.Rols?.some(r => r.nombre === 'Admin');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Usuario</th>
              <th className="p-4">Tienda ID</th>
              <th className="p-4">Roles Actuales</th>
              {isAdmin && <th className="p-4">Gestión de Roles</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{user.nombre_completo}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="p-4 text-slate-600">
                  {user.tienda_id}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {user.Rols && user.Rols.map(rol => (
                      <span key={rol.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rol.nombre}
                        {isAdmin && (
                          <button onClick={() => handleRemoveRole(user.id, rol.id)} className="ml-1.5 text-blue-600 hover:text-blue-900 focus:outline-none">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {(!user.Rols || user.Rols.length === 0) && (
                      <span className="text-sm text-slate-400">Ninguno</span>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4">
                    <select 
                      className="text-sm border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignRole(user.id, e.target.value);
                          e.target.value = ''; // reset
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Añadir Rol...</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
