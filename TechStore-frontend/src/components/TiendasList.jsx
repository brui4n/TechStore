import { useState, useEffect } from 'react';
import { getTiendas, createTienda, updateTienda, deleteTienda } from '../api/tiendas';
import { Store, Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export default function TiendasList() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', ubicacion: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchTiendas = async () => {
    try {
      const res = await getTiendas();
      setTiendas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiendas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateTienda(editingId, formData);
      } else {
        await createTienda(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: '', ubicacion: '' });
      fetchTiendas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la tienda');
    }
  };

  const handleEdit = (tienda) => {
    setEditingId(tienda.id);
    setFormData({ nombre: tienda.nombre, ubicacion: tienda.ubicacion });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tienda?')) {
      try {
        await deleteTienda(id);
        fetchTiendas();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar tienda');
      }
    }
  };

  if (loading) return <div>Cargando tiendas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Gestión de Tiendas</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nombre: '', ubicacion: '' }); setError(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Tienda
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-medium text-slate-800 mb-4">{editingId ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Tienda</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Tienda Este" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
              <input required type="text" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej: Av. Principal 123" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Guardar Tienda</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4 w-16">ID</th>
              <th className="p-4">Nombre de la Tienda</th>
              <th className="p-4">Ubicación</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tiendas.map(tienda => (
              <tr key={tienda.id} className="hover:bg-slate-50 text-sm">
                <td className="p-4 font-mono text-slate-500">{tienda.id}</td>
                <td className="p-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    {tienda.nombre}
                  </div>
                </td>
                <td className="p-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {tienda.ubicacion}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(tienda)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(tienda.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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
