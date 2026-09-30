import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credenciales.correo, credenciales.password);
      navigate('/'); 
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1A202C' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <h2 style={{ color: '#2A9D8F', textAlign: 'center', marginBottom: '2rem' }}>🐾 PATAFORMA</h2>
        
        {error && <div style={{ color: '#e53e3e', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="correo" onChange={handleChange} required className="form-control" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="form-control" />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}