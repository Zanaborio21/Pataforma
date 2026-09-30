import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast, confirmar, alertaError } from '../utils/alerts';

export default function TutorList() {
  const [tutores, setTutores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tutorEditando, setTutorEditando] = useState(null);
  
  const [formData, setFormData] = useState({ 
    dni: '', nombres: '', apellidos: '', telefono: '', correo: '', direccion: '' 
  });

  const [busqueda, setBusqueda] = useState('');

  const fetchTutores = async () => {
    try {
      const response = await api.get('/tutores');
      setTutores(response.data);
    } catch (error) {
      console.error('Error al cargar tutores:', error);
    }
  };

  useEffect(() => {
    fetchTutores();
  }, []);

  const abrirModal = (tutor) => {
    setTutorEditando(tutor);
    setFormData({
      dni: tutor.DNI || '',
      nombres: tutor.NOMBRES || '',
      apellidos: tutor.APELLIDOS || '',
      telefono: tutor.TELEFONO || '',
      correo: tutor.CORREO || '',
      direccion: tutor.DIRECCION || ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tutores/${tutorEditando.ID_TUTOR}`, formData);
      toast.fire({ icon: 'success', title: 'Tutor actualizado con éxito' });
      setShowModal(false);
      fetchTutores(); 
    } catch (error) {
      console.error(error);
      alertaError('Ocurrió un error al actualizar el tutor');
    }
  };

   const tutoresFiltrados = tutores.filter(t => 
        (t.DNI && t.DNI.includes(busqueda)) || 
        (t.NOMBRES && t.NOMBRES.toLowerCase().includes(busqueda.toLowerCase())) ||
        (t.APELLIDOS && t.APELLIDOS.toLowerCase().includes(busqueda.toLowerCase()))
    );

  return (
    <div className="form-card" style={{ marginTop: '2rem', position: 'relative' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1A202C' }}>Directorio de Tutores (Clientes)</h3>
      
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
              <th style={{ padding: '1rem', color: '#4a5568' }}>Tutor</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Contacto</th>
              <th style={{ padding: '1rem', color: '#4a5568', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tutoresFiltrados.map((t) => (
              <tr key={t.ID_TUTOR} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', color: '#2d3748' }}>{t.DNI}</td>
                <td style={{ padding: '1rem', color: '#2A9D8F', fontWeight: 'bold' }}>
                  {t.NOMBRES} {t.APELLIDOS}
                </td>
                <td style={{ padding: '1rem', color: '#2d3748' }}>
                  📞 {t.TELEFONO} <br/>
                  <span style={{ fontSize: '0.85rem', color: '#718096' }}>✉️ {t.CORREO}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => abrirModal(t)}>
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="form-card" style={{ width: '500px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Editar Tutor</h3>
            
            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>DNI</label>
                <input type="text" name="dni" maxLength="8" className="form-control" value={formData.dni} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nombres</label>
                <input type="text" name="nombres" className="form-control" value={formData.nombres} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input type="text" name="apellidos" className="form-control" value={formData.apellidos} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Dirección</label>
                <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChange} required />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Cambios</button>
                <button type="button" className="btn-danger-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}