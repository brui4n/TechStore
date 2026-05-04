import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyMFA } from '../api/auth';
import { ShieldAlert } from 'lucide-react';

export default function MfaVerify() {
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await verifyMFA({ mfaToken });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verificación en 2 pasos</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Ingresa el código generado por tu aplicación de autenticación
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            className="block w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="000000"
            maxLength="6"
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Verificar
          </button>
        </form>
      </div>
    </div>
  );
}
