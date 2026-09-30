import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast, confirmar, alertaError } from '../utils/alerts';

export default function PacienteList() {
  const [pacientes, setPacientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  
  // Estado adaptado a las columnas reales
  const [formData, setFormData] = useState({ 
    nombre: '', especie: '', raza: '', fecha_nac: '', peso_kg: '', sexo: '' 
  });

  const [busqueda, setBusqueda] = useState('');

  const fetchPacientes = async () => {
    try {
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (error) {
      console.error('Error al cargar la lista de pacientes:', error);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const abrirModal = (paciente) => {
    setPacienteEditando(paciente);
    
    // Formatear la fecha de nacimiento si existe (para el input type="date")
    let fechaFormateada = '';
    if (paciente.FECHA_NAC) {
      fechaFormateada = new Date(paciente.FECHA_NAC).toISOString().split('T')[0];
    }

    setFormData({
      nombre: paciente.NOMBRE_PACIENTE || paciente.NOMBRE || '',
      especie: paciente.ESPECIE || '',
      raza: paciente.RAZA || '',
      fecha_nac: fechaFormateada,
      peso_kg: paciente.PESO_KG || '',
      sexo: paciente.SEXO || '' // Vendrá como 'M' o 'H'
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const id = pacienteEditando.ID_PACIENTE; 
      await api.put(`/pacientes/${id}`, formData);
      
      toast.fire({ icon: 'success', title: 'Paciente actualizado con éxito' });
      setShowModal(false);
      fetchPacientes(); 
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el paciente');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const pacientesFiltrados = pacientes.filter(p => 
        (p.NOMBRE_PACIENTE && p.NOMBRE_PACIENTE.toLowerCase().includes(busqueda.toLowerCase())) || 
        (p.ESPECIE && p.ESPECIE.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.RAZA && p.RAZA.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.NOMBRE_TUTOR && p.NOMBRE_TUTOR.toLowerCase().includes(busqueda.toLowerCase()))
    );

  return (
    <div className="form-card" style={{ position: 'relative' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1A202C' }}>Directorio de Pacientes y Tutores</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre, especie, raza o tutor..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
      </div>
      <div style={{ overflowX: 'auto', minHeight: '350px', maxHeight: '500px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Paciente</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Especie / Raza</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Tutor</th>
              <th style={{ padding: '1rem', color: '#4a5568' }}>Teléfono</th>
              <th style={{ padding: '1rem', color: '#4a5568', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((p, index) => (
              <tr key={p.ID_PACIENTE || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', color: '#2A9D8F', fontWeight: 'bold' }}>{p.NOMBRE_PACIENTE || p.NOMBRE || 'N/A'}</td>
                <td style={{ padding: '1rem', color: '#2d3748' }}>{p.ESPECIE} {p.RAZA ? `- ${p.RAZA}` : ''}</td>
                <td style={{ padding: '1rem', color: '#2d3748' }}>{p.NOMBRE_TUTOR || 'Sin tutor'}</td>
                <td style={{ padding: '1rem', color: '#2d3748' }}>{p.TELEFONO_TUTOR || 'N/A'}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => abrirModal(p)}>
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
            <h3 style={{ marginBottom: '1rem' }}>Editar Paciente</h3>
            
            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nombre del Paciente</label>
                <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label>Especie</label>
                <input type="text" name="especie" className="form-control" value={formData.especie} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Raza</label>
                <input type="text" name="raza" className="form-control" value={formData.raza} onChange={handleChange} />
              </div>
              
              {/* Novedad: Fecha de Nacimiento */}
              <div className="form-group">
                <label>Fecha Nacimiento</label>
                <input type="date" name="fecha_nac" className="form-control" value={formData.fecha_nac} onChange={handleChange} />
              </div>

              {/* Novedad: PESO_KG */}
              <div className="form-group">
                <label>Peso (kg)</label>
                <input type="number" step="0.1" name="peso_kg" className="form-control" value={formData.peso_kg} onChange={handleChange} />
              </div>

              {/* Ajuste: Values "M" y "H" (1 char) */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Sexo</label>
                <select name="sexo" className="form-control" value={formData.sexo} onChange={handleChange}>
                  <option value="">Seleccione</option>
                  <option value="M">Macho</option>
                  <option value="H">Hembra</option>
                </select>
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