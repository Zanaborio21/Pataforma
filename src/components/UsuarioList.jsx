import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast, confirmar, alertaError } from '../utils/alerts';


export default function UsuarioList() {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  
  // Estados para el Modal de ROLES
  const [showModalRoles, setShowModalRoles] = useState(false);
  const [usuarioRolesEditando, setUsuarioRolesEditando] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  // Estados para el Modal de DATOS PERSONALES
  const [showModalDatos, setShowModalDatos] = useState(false);
  const [usuarioDatosEditando, setUsuarioDatosEditando] = useState(null);
  const [formData, setFormData] = useState({ 
    dni: '', nombres: '', apellidos: '', telefono: '', direccion: '', correo: '' 
  });

  const [busqueda, setBusqueda] = useState('');

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar la lista de usuarios:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRolesDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  // --- LÓGICA PARA MODAL DE ROLES ---
  const abrirModalRoles = (usuario) => {
    setUsuarioRolesEditando(usuario);
    if (usuario.ID_ROLES) {
      const ids = usuario.ID_ROLES.split(',').map(id => parseInt(id));
      setRolesSeleccionados(ids);
    } else {
      setRolesSeleccionados([]);
    }
    setShowModalRoles(true);
  };

  const handleRoleChange = (e) => {
    const idRol = parseInt(e.target.value);
    if (e.target.checked) {
      setRolesSeleccionados([...rolesSeleccionados, idRol]);
    } else {
      setRolesSeleccionados(rolesSeleccionados.filter(id => id !== idRol));
    }
  };

  const guardarRoles = async (e) => {
    e.preventDefault();
    if (rolesSeleccionados.length === 0) {
      return toast.fire({ icon: 'warning', title: 'Debe seleccionar al menos un rol' }); 
    }

    try {
      await api.put(`/usuarios/${usuarioRolesEditando.ID_USUARIO}/roles`, { rolesSeleccionados });
      toast.fire({ icon: 'success', title: 'Roles actualizados' }); // Éxito!
      setShowModalRoles(false);
      fetchUsuarios(); 
    } catch (error) {
      console.error(error);
      alertaError('Ocurrió un error al guardar los roles');
    }
  };

  // --- LÓGICA PARA MODAL DE DATOS ---
  const abrirModalDatos = (usuario) => {
    setUsuarioDatosEditando(usuario);
    setFormData({
      dni: usuario.DNI || '',
      nombres: usuario.NOMBRES || '',
      apellidos: usuario.APELLIDOS || '',
      telefono: usuario.TELEFONO || '',
      direccion: usuario.DIRECCION || '',
      correo: usuario.CORREO || ''
    });
    setShowModalDatos(true);
  };

  const handleChangeDatos = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarDatos = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/usuarios/${usuarioDatosEditando.ID_USUARIO}`, formData);
      toast.fire({ icon: 'success', title: 'Datos actualizados correctamente' }); 
      setShowModalDatos(false);
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      alertaError('Ocurrió un error al actualizar los datos');
    }
  };

  const toggleEstado = async (usuario) => {
    const nuevoEstado = usuario.ESTADO === 1 ? 0 : 1; 
    const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
    
    // Usamos nuestra nueva alerta de confirmación
    const confirmado = await confirmar(
      `¿${accion.toUpperCase()} USUARIO?`, 
      `Estás a punto de ${accion} a ${usuario.NOMBRES}`
    );

    if (confirmado) {
      try {
        await api.put(`/usuarios/${usuario.ID_USUARIO}/estado`, { estado: nuevoEstado });
        fetchUsuarios();
        toast.fire({ icon: 'success', title: `Usuario ${accion}do correctamente` }); // Éxito!
      } catch (error) {
        console.error(error);
        alertaError(`No se pudo ${accion} el usuario`);
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    (u.DNI && u.DNI.includes(busqueda)) || 
    (u.NOMBRES && u.NOMBRES.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.APELLIDOS && u.APELLIDOS.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="form-card" style={{ marginTop: '2rem', position: 'relative' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1A202C' }}>Usuarios Registrados</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por DNI, Nombre o Apellido..." 
          className="form-control"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
      </div>

      <div style={{ overflowX: 'auto', minHeight: '350px', maxHeight: '500px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#4a5568' }}>DNI</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Personal</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Roles</th>
              <th style={{ padding: '1rem', color: '#4a5568', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(u => (
              <tr key={u.ID_USUARIO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', color: '#2d3748' }}>{u.DNI}</td>
                
                {/* CAMBIO 1: Agregamos el indicador visual (puntito de color) al lado del nombre */}
                <td style={{ padding: '1rem', color: '#2d3748' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{u.NOMBRES} {u.APELLIDOS}</strong>
                    <span style={{ 
                      display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', 
                      backgroundColor: u.ESTADO === 1 ? '#48BB78' : '#F56565' 
                    }} title={u.ESTADO === 1 ? 'Activo' : 'Inactivo'}></span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#718096' }}>{u.CORREO}</span>
                </td>
                
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: '#e6fffa', color: '#2A9D8F', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {u.ROLES || 'Sin rol'}
                  </span>
                </td>
                
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => abrirModalDatos(u)}>
                      ✏️ Editar
                    </button>
                    <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => abrirModalRoles(u)}>
                      ⚙️ Permisos
                    </button>
                    
                    {/* CAMBIO: Protegemos al usuario actual */}
                    {user?.id === u.ID_USUARIO ? (
                      <span style={{ fontSize: '0.85rem', color: '#A0AEC0', padding: '0.25rem 0.5rem' }}>
                         (Tú)
                      </span>
                    ) : (
                      <button 
                        className="btn-outline" 
                        style={{ 
                          padding: '0.25rem 0.5rem', fontSize: '0.85rem', 
                          borderColor: u.ESTADO === 1 ? '#F56565' : '#48BB78',
                          color: u.ESTADO === 1 ? '#F56565' : '#48BB78'
                        }} 
                        onClick={() => toggleEstado(u)}
                      >
                        {u.ESTADO === 1 ? '🚫 Desactivar' : '✅ Activar'}
                      </button>
                    )}
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: EDITAR ROLES */}
      {showModalRoles && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="form-card" style={{ width: '400px', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Administrar Permisos</h3>
            <p style={{ color: '#718096', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Modificando a: <strong>{usuarioRolesEditando?.NOMBRES}</strong></p>
            
            <form onSubmit={guardarRoles}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {rolesDisponibles.map(r => (
                  <label key={r.ID_ROL} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <input type="checkbox" value={r.ID_ROL} checked={rolesSeleccionados.includes(r.ID_ROL)} onChange={handleRoleChange} />
                    {r.NOMBRE}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Roles</button>
                <button type="button" className="btn-danger-outline" style={{ flex: 1 }} onClick={() => setShowModalRoles(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR DATOS PERSONALES */}
      {showModalDatos && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="form-card" style={{ width: '500px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Editar Datos del Usuario</h3>
            
            <form onSubmit={guardarDatos} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>DNI</label>
                <input type="text" name="dni" maxLength="8" className="form-control" value={formData.dni} onChange={handleChangeDatos} required />
              </div>
              <div className="form-group">
                <label>Nombres</label>
                <input type="text" name="nombres" className="form-control" value={formData.nombres} onChange={handleChangeDatos} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input type="text" name="apellidos" className="form-control" value={formData.apellidos} onChange={handleChangeDatos} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChangeDatos} required />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChangeDatos} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Dirección</label>
                <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChangeDatos} required />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Datos</button>
                <button type="button" className="btn-danger-outline" style={{ flex: 1 }} onClick={() => setShowModalDatos(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}