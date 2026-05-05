import { useState, useEffect } from 'react';
import { getLogs } from '../api/logs';
import { ClipboardList, Clock, User, FileText } from 'lucide-react';

export default function LogsList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getLogs();
        setLogs(res.data);
      } catch (error) {
        console.error('Error fetching logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Cargando logs de auditoría...</div>;

  const renderDetalles = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {Object.entries(parsed).map(([key, value]) => {
            if (key === 'fecha_creacion' || key === 'fecha_actualizacion') return null;
            let displayValue = value;
            if (typeof value === 'boolean') displayValue = value ? 'Sí' : 'No';
            if (value === null || value === undefined) displayValue = 'N/A';
            
            const strVal = String(displayValue);
            const truncated = strVal.length > 25 ? strVal.substring(0, 25) + '...' : strVal;
            
            return (
              <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-600 border border-slate-200 shadow-sm" title={strVal}>
                <span className="font-semibold text-slate-800 mr-1">{key}:</span> {truncated}
              </span>
            );
          })}
        </div>
      );
    } catch (e) {
      return <span className="text-xs text-slate-400">{jsonStr}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Logs de Auditoría</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Fecha y Hora</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Acción</th>
              <th className="p-4">Recurso</th>
              <th className="p-4 w-2/5">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 text-sm">
                <td className="p-4 whitespace-nowrap text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(log.fecha).toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{log.Usuario?.nombre_completo || 'Desconocido'}</div>
                      <div className="text-xs text-slate-500">{log.Usuario?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold
                    ${log.accion === 'CREATE' ? 'bg-green-100 text-green-700' : 
                      log.accion === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {log.accion}
                  </span>
                </td>
                <td className="p-4 font-medium text-slate-700">
                  {log.recurso} <span className="text-slate-400 font-normal text-xs">(ID: {log.recurso_id})</span>
                </td>
                <td className="p-4">
                  {renderDetalles(log.detalles)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  No hay registros de auditoría aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
