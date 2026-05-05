import { useState, useEffect } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos';
import { getTiendas } from '../api/tiendas';
import { getMe } from '../api/auth';
import { Package, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function ProductosList() {
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', stock: '', es_premium: false, tienda_id: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [prodRes, userRes, tiendasRes] = await Promise.all([getProductos(), getMe(), getTiendas()]);
      setProductos(prodRes.data);
      setUser(userRes.data);
      setTiendas(tiendasRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roles = user?.Rols?.map(r => r.nombre) || [];
  const isAdmin = roles.includes('Admin');
  const isAuditor = roles.includes('Auditor');
  const isGerente = roles.includes('Gerente');
  const isEmpleado = roles.includes('Empleado');

  // ABAC Frontend Checks
  const canCreate = isAdmin || isGerente;
  const canDelete = isAdmin || isGerente;
  
  const canUpdate = (producto) => {
    if (isAdmin) return true;
    if (isAuditor) return false;
    if (isGerente && producto.tienda_id === user.tienda_id) return true;
    if (isEmpleado && producto.tienda_id === user.tienda_id) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProducto(editingId, formData);
      } else {
        await createProducto(formData);
      }
      setShowForm(false);
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '', es_premium: false, tienda_id: user.tienda_id });
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar');
      }
    }
  };

  const openEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      es_premium: producto.es_premium,
      tienda_id: producto.tienda_id
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  if (loading) return <div>Cargando inventario...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Productos ({productos.length})</h2>
        {canCreate && (
          <button 
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nombre: '', descripcion: '', precio: '', stock: '', es_premium: false, tienda_id: user.tienda_id }); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-md font-medium mb-4">{editingId ? 'Editar Producto' : 'Crear Producto'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" disabled={isEmpleado && editingId} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
              <input required type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" disabled={isEmpleado && editingId} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
              <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            {isAdmin && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tienda Asignada</label>
                <select 
                  required 
                  value={formData.tienda_id || ''} 
                  onChange={e => setFormData({...formData, tienda_id: e.target.value})} 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm appearance-none" 
                  disabled={editingId}
                >
                  <option value="" disabled>Selecciona una tienda</option>
                  {tiendas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1 flex items-center mt-6">
              <input type="checkbox" id="es_premium" checked={formData.es_premium} onChange={e => setFormData({...formData, es_premium: e.target.checked})} className="mr-2 rounded border-slate-300" disabled={isEmpleado && editingId} />
              <label htmlFor="es_premium" className="text-sm font-medium text-slate-700">Producto Premium</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" disabled={isEmpleado && editingId} />
            </div>
            <div className="col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Atributos</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {productos.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{p.nombre}</div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{p.descripcion}</div>
                </td>
                <td className="p-4 text-slate-700 font-medium">${p.precio}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.stock} unid.
                  </span>
                </td>
                <td className="p-4">
                  {p.es_premium && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Premium</span>}
                  <span className="ml-2 text-xs text-slate-500">{tiendas.find(t => t.id === p.tienda_id)?.nombre || `Tienda ${p.tienda_id}`}</span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {canUpdate(p) && (
                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  No hay productos disponibles en tu inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
