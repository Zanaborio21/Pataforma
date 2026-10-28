import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast, alertaError } from '../utils/alerts';

export default function CitaForm({ onCitaAgregada }) {
  const [pacientes, setPacientes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [tiposCita, setTiposCita] = useState([]);
  
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_usuario: '',
    id_consultorio: '',
    id_tipo: '',
    fecha: '',
    hora_inicio: '',
    motivo: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resPacientes, resUsuarios, resConsultorios, resTipos] = await Promise.all([
          api.get('/pacientes'),
          api.get('/usuarios'),
          api.get('/consultorios'),
          api.get('/tipos-cita')
        ]);
        
        setPacientes(resPacientes.data);
        setConsultorios(resConsultorios.data);
        setTiposCita(resTipos.data);
        
        const soloVeterinarios = resUsuarios.data.filter(usuario => 
          usuario.ROLES && usuario.ROLES.toLowerCase().includes('veterinario')
        );
        setVeterinarios(soloVeterinarios);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      }
    };
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fechaHoraInicio = `${formData.fecha} ${formData.hora_inicio}:00`;
      const tipoSeleccionado = tiposCita.find(t => t.ID_TIPO === parseInt(formData.id_tipo));
      const duracion = tipoSeleccionado ? tipoSeleccionado.DURACION_MINUTOS : 30;
      const fechaInicioObj = new Date(`${formData.fecha}T${formData.hora_inicio}:00`);
      fechaInicioObj.setMinutes(fechaInicioObj.getMinutes() + duracion);
      
      const year = fechaInicioObj.getFullYear();
      const month = String(fechaInicioObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaInicioObj.getDate()).padStart(2, '0');
      const horas = String(fechaInicioObj.getHours()).padStart(2, '0');
      const minutos = String(fechaInicioObj.getMinutes()).padStart(2, '0');
      
      const fechaHoraFin = `${year}-${month}-${day} ${horas}:${minutos}:00`;

      const payload = {
        id_paciente: formData.id_paciente,
        id_usuario: formData.id_usuario,
        id_consultorio: formData.id_consultorio,
        id_tipo: formData.id_tipo,
        fecha_hora_inicio: fechaHoraInicio,
        fecha_hora_fin: fechaHoraFin,
        motivo: formData.motivo || 'Consulta médica'
      };

      await api.post('/citas', payload);
      
      // CORRECCIÓN AQUÍ: Usar toast.fire()
      toast.fire({ icon: 'success', title: 'Cita médica programada exitosamente.' });
      
      setFormData({ ...formData, fecha: '', hora_inicio: '', motivo: '', id_consultorio: '', id_tipo: '' });
      if (onCitaAgregada) onCitaAgregada();
      
    } catch (error) {
      console.error('Error al guardar la cita:', error.response?.data || error);
      // CORRECCIÓN AQUÍ: Usar toast.fire() para errores
      toast.fire({ icon: 'error', title: error.response?.data?.error || 'Ocurrió un error al programar la cita' });
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Programar Nueva Cita</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <select className="form-control" value={formData.id_paciente} onChange={(e) => setFormData({...formData, id_paciente: e.target.value})} required>
          <option value="">Seleccione un paciente...</option>
          {pacientes.map(paciente => (
            <option key={paciente.ID_PACIENTE} value={paciente.ID_PACIENTE}>
              {paciente.NOMBRE_PACIENTE || paciente.NOMBRE}
            </option>
          ))}
        </select>

        <select className="form-control" value={formData.id_usuario} onChange={(e) => setFormData({...formData, id_usuario: e.target.value})} required>
          <option value="">Seleccione un veterinario...</option>
          {veterinarios.map(vet => (
            <option key={vet.ID_USUARIO} value={vet.ID_USUARIO}>
              {vet.NOMBRES} {vet.APELLIDOS}
            </option>
          ))}
        </select>

        <select className="form-control" value={formData.id_tipo} onChange={(e) => setFormData({...formData, id_tipo: e.target.value})} required>
          <option value="">Tipo de Cita...</option>
          {tiposCita.map(tipo => (
            <option key={tipo.ID_TIPO} value={tipo.ID_TIPO}>
              {tipo.NOMBRE} ({tipo.DURACION_MINUTOS} min)
            </option>
          ))}
        </select>

        <select className="form-control" value={formData.id_consultorio} onChange={(e) => setFormData({...formData, id_consultorio: e.target.value})} required>
          <option value="">Consultorio...</option>
          {consultorios.map(cons => (
            <option key={cons.ID_CONSULTORIO} value={cons.ID_CONSULTORIO}>
              {cons.NOMBRE}
            </option>
          ))}
        </select>

        <input type="date" className="form-control" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} required />
        <input type="time" className="form-control" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} required />

        <input type="text" className="form-control" placeholder="Motivo (Opcional)" value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})} style={{ gridColumn: 'span 2' }} />

        <button type="submit" className="btn-primary" style={{ height: '40px', alignSelf: 'end', gridColumn: 'span 2' }}>
          Guardar Cita
        </button>
      </form>
    </div>
  );
}