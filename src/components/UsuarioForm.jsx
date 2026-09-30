// src/components/UsuarioForm.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../utils/alerts';

export default function UsuarioForm() {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    dni: '', nombres: '', apellidos: '', telefono: '', 
    direccion: '', correo: '', password: ''
  });
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error("Error cargando roles", error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const idRol = parseInt(e.target.value);
    if (e.target.checked) {
      setRolesSeleccionados([...rolesSeleccionados, idRol]);
    } else {
      setRolesSeleccionados(rolesSeleccionados.filter(id => id !== idRol));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rolesSeleccionados.length === 0) {
      return alert('Debes seleccionar al menos un rol.');
    }
    
    try {
      const payload = { ...formData, rolesSeleccionados };
      await api.post('/usuarios', payload);
      toast.fire({ icon: 'success', title: 'Usuario creado y roles asignados exitosamente' });
      setFormData({ dni: '', nombres: '', apellidos: '', telefono: '', direccion: '', correo: '', password: '' });
      setRolesSeleccionados([]);
    } catch (error) {
      console.error('Error al crear usuario', error);
      const mensajeBackend = error.response?.data?.error || 'Ocurrió un error al registrar el usuario';
      toast.fire({ icon: 'error', title: mensajeBackend });
    }
  };

  return (
    <div className="form-card">
      <h3>Administración: Nuevo Usuario</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>DNI</label>
          <input type="text" name="dni" maxLength="8" value={formData.dni} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Nombres</label>
          <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Apellidos</label>
          <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Correo (Usuario)</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-control" />
        </div>
        
        {}
        <div className="form-group col-span-2">
          <label>Asignar Roles</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {roles.map(r => (
              <label key={r.ID_ROL} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  value={r.ID_ROL} 
                  checked={rolesSeleccionados.includes(r.ID_ROL)}
                  onChange={handleRoleChange} 
                />
                {r.NOMBRE}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-actions col-span-2">
          <button type="submit" className="btn-primary">Registrar Usuario</button>
        </div>
      </form>
    </div>
  );
}