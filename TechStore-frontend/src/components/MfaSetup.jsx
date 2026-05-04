import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupMFA, verifyMFA } from '../api/auth';
import { ShieldCheck } from 'lucide-react';

export default function MfaSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initMFA = async () => {
      try {
        const response = await setupMFA();
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al iniciar configuración MFA');
      }
    };
    initMFA();
  }, []);

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
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Configurar MFA</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Escanea el código QR con tu aplicación Google Authenticator
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {qrCode ? (
          <div className="flex justify-center mb-6">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 border-4 border-white shadow-sm rounded-lg" />
          </div>
        ) : (
          <div className="animate-pulse h-48 w-48 bg-slate-200 rounded-lg mx-auto mb-6"></div>
        )}

        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-1">O ingresa esta clave manualmente:</p>
          <code className="bg-slate-100 text-slate-700 px-3 py-2 rounded text-sm font-mono tracking-wider block break-all">
            {secret || 'Cargando...'}
          </code>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            className="block w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="000000"
            maxLength="6"
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Verificar y Continuar
          </button>
        </form>
      </div>
    </div>
  );
}
