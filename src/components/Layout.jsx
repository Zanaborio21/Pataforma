import { useContext, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estados para manejar el Modal de Configuración
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    telefono: user?.telefono || '', 
    correo: user?.correo || '' 
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Enviamos los datos al nuevo endpoint
      await api.put('/usuarios/perfil', {
        id_usuario: user.id,
        telefono: formData.telefono,
        correo: formData.correo
      });
      
      alert('Datos actualizados. Por favor, inicia sesión nuevamente para ver los cambios.');
      handleLogout(); // Forzamos un re-login para que el token se actualice con los nuevos datos
    } catch (error) {
      console.error(error);
      alert('Error al actualizar los datos');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
      {/* Sidebar Lateral */}
      <aside style={{ width: '260px', background: '#1A202C', color: 'white', padding: '2rem' }}>
        <h2 style={{ color: '#2A9D8F', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🐾 PATAFORMA
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: '500' }}>Panel Principal</Link>
          <Link to="/pacientes" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: '500' }}>Pacientes y Tutores</Link>
          {user?.roles?.includes('Administrador') && (
            <Link to="/admin" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: '500' }}>Usuarios (Administrador)</Link>
          )}
        </nav>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.nombres || 'Usuario'}</p>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>{user?.roles || 'Sin Rol'}</p>
            </div>
            {/* Abrimos el modal al hacer clic */}
            <button className="btn-outline" onClick={() => setShowModal(true)}>Configuración</button>
            <button className="btn-danger-outline" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div style={{ padding: '2rem', overflowY: 'auto' }}>
          <Outlet /> 
        </div>
      </main>

      {/* Modal de Configuración Superpuesto */}
      {showModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="form-card" style={{ width: '400px', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>Actualizar Mis Datos</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.correo} 
                  onChange={(e) => setFormData({...formData, correo: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
                <button type="button" className="btn-danger-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}