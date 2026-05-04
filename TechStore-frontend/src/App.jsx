import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MfaSetup from './components/MfaSetup';
import MfaVerify from './components/MfaVerify';

function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">TechStore Dashboard</h1>
      <p className="text-slate-500">Bienvenido al sistema de inventario seguro.</p>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mfa/setup" element={<MfaSetup />} />
        <Route path="/mfa/verify" element={<MfaVerify />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
