import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roles';
import { Key, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateRole(editingId, formData);
      } else {
        await createRole(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: '', descripcion: '' });
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el rol');
    }
  };

  const handleEdit = (rol) => {
    setEditingId(rol.id);
    setFormData({ nombre: rol.nombre, descripcion: rol.descripcion });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        await deleteRole(id);
        fetchRoles();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar rol');
      }
    }
  };

  if (loading) return <div>Cargando roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Gestión de Roles</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nombre: '', descripcion: '' }); setError(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Rol
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-medium text-slate-800 mb-4">{editingId ? 'Editar Rol' : 'Nuevo Rol'}</h3>
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Soporte_Tecnico" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <input required type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Breve descripción del rol" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Guardar Rol</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">ID</th>
              <th className="p-4">Nombre del Rol</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map(rol => (
              <tr key={rol.id} className="hover:bg-slate-50 text-sm">
                <td className="p-4 font-mono text-slate-500">{rol.id}</td>
                <td className="p-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" />
                    {rol.nombre}
                  </div>
                </td>
                <td className="p-4 text-slate-600">{rol.descripcion}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(rol)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rol.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
