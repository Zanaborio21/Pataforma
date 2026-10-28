import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';
import { toast, alertaError } from '../utils/alerts';

export default function CalendarioCitas({ recargar }) {
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Estados para la Historia Clínica
  const [showHistoria, setShowHistoria] = useState(false);
  const [historiaExiste, setHistoriaExiste] = useState(false);
  const [vistaHistoria, setVistaHistoria] = useState('formulario'); 
  const [historialPaciente, setHistorialPaciente] = useState([]);
  const [formHistoria, setFormHistoria] = useState({
    temperatura: '', frecuencia_cardiaca: '', frecuencia_respiratoria: '', anamnesis: '', diagnostico: ''
  });

  const cargarCitas = async () => {
    try {
      const respuesta = await api.get('/citas');
      setCitas(respuesta.data);
    } catch (error) {
      console.error('Error al cargar la agenda:', error);
    }
  };

  // Se ejecuta al cargar por primera vez y cada vez que cambia "recargar"
  useEffect(() => {
    cargarCitas();
  }, [recargar]);

  const handleEventClick = (info) => {
    setCitaSeleccionada({
      ...info.event.extendedProps,
      idCita: info.event.extendedProps.ID_CITA || info.event.extendedProps.id_cita,
      idPaciente: info.event.extendedProps.ID_PACIENTE || info.event.extendedProps.id_paciente,
      ESTADO: info.event.extendedProps.ESTADO || info.event.extendedProps.estado,
      horaInicio: info.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    setShowModal(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    try {
      const idParaActualizar = citaSeleccionada.idCita || citaSeleccionada.ID_CITA;
      await api.put(`/citas/${idParaActualizar}/estado`, { estado: nuevoEstado });
      
      toast.fire({ icon: 'success', title: `Cita marcada como ${nuevoEstado}` });
      
      setCitaSeleccionada(prev => ({ ...prev, ESTADO: nuevoEstado }));
      cargarCitas();
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.fire({ icon: 'error', title: 'Error en la base de datos al actualizar el estado.' });
    }
  };

  const abrirHistoria = async () => {
    setVistaHistoria('formulario');
    
    try {
      const res = await api.get(`/historias/cita/${citaSeleccionada.idCita}`);
      setFormHistoria({
        temperatura: res.data.TEMPERATURA || '',
        frecuencia_cardiaca: res.data.FRECUENCIA_CARDIACA || '',
        frecuencia_respiratoria: res.data.FRECUENCIA_RESPIRATORIA || '',
        anamnesis: res.data.ANAMNESIS || '',
        diagnostico: res.data.DIAGNOSTICO || ''
      });
      setHistoriaExiste(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setFormHistoria({ temperatura: '', frecuencia_cardiaca: '', frecuencia_respiratoria: '', anamnesis: '', diagnostico: '' });
        setHistoriaExiste(false);
      }
    }

    try {
      if (citaSeleccionada.idPaciente) {
        const resHistorial = await api.get(`/historias/paciente/${citaSeleccionada.idPaciente}`);
        setHistorialPaciente(resHistorial.data);
      }
    } catch (error) {
      console.error('Error al cargar el historial del paciente');
      setHistorialPaciente([]);
    }

    setShowHistoria(true);
  };

  const guardarHistoria = async (e) => {
    e.preventDefault();
    try {
      await api.post('/historias', { ...formHistoria, id_cita: citaSeleccionada.idCita });
      
      toast.fire({ icon: 'success', title: 'Historia clínica guardada exitosamente' });
      
      setHistoriaExiste(true);
      if (citaSeleccionada.idPaciente) {
        const resHistorial = await api.get(`/historias/paciente/${citaSeleccionada.idPaciente}`);
        setHistorialPaciente(resHistorial.data);
      }
    } catch (error) {
      toast.fire({ icon: 'error', title: error.response?.data?.error || 'Error al guardar la historia clínica' });
    }
  };

  const renderEventContent = (eventInfo) => {
    const { PACIENTE, VETERINARIO, CONSULTORIO, TIPO_CITA } = eventInfo.event.extendedProps;
    const textStyle = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
    return (
      <div style={{ padding: '2px 4px', fontSize: '0.75rem', lineHeight: '1.2' }}>
        <div style={{ fontWeight: 'bold', ...textStyle }}>{eventInfo.timeText} - {PACIENTE}</div>
        <div style={textStyle}>🩺 {VETERINARIO}</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.9, ...textStyle }}>📍 {CONSULTORIO} | {TIPO_CITA}</div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="es"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={citas}
        eventClick={handleEventClick}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:15:00"
        height="70vh"
        eventContent={renderEventContent}
      />

      {showModal && citaSeleccionada && !showHistoria && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="form-card" style={{ width: '500px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Detalles de la Cita - {citaSeleccionada.horaInicio}</h3>
              <span style={{ 
                fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold',
                backgroundColor: citaSeleccionada.ESTADO === 'Pendiente' ? '#FEFCBF' : citaSeleccionada.ESTADO === 'Finalizada' ? '#C6F6D5' : '#FED7D7',
                color: citaSeleccionada.ESTADO === 'Pendiente' ? '#B7791F' : citaSeleccionada.ESTADO === 'Finalizada' ? '#22543D' : '#9B2C2C'
              }}>
                {citaSeleccionada.ESTADO}
              </span>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>🩺 Veterinario:</strong> {citaSeleccionada.VETERINARIO}</p>
              <p><strong>📍 Espacio:</strong> {citaSeleccionada.CONSULTORIO} ({citaSeleccionada.TIPO_CITA})</p>
              <p><strong>📝 Motivo:</strong> {citaSeleccionada.MOTIVO || 'Sin motivo'}</p>
            </div>

            <h4 style={{ color: '#2A9D8F', marginBottom: '0.5rem' }}>Datos del Paciente</h4>
            <div style={{ backgroundColor: '#f7fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p><strong>🐾 Mascota:</strong> {citaSeleccionada.PACIENTE}</p>
              <p><strong>👤 Tutor:</strong> {citaSeleccionada.TUTOR || 'No registrado'}</p>
            </div>

            {citaSeleccionada.ESTADO === 'Pendiente' && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1, backgroundColor: '#48BB78', borderColor: '#48BB78' }} onClick={() => actualizarEstado('Finalizada')}>✅ Finalizar</button>
                <button className="btn-danger-outline" style={{ flex: 1 }} onClick={() => actualizarEstado('Cancelada')}>🚫 Cancelar</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' }} onClick={abrirHistoria}>
                📂 Historias Clínicas
              </button>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showHistoria && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="form-card" style={{ width: '90%', maxWidth: '600px', boxSizing: 'border-box', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Historia de {citaSeleccionada?.PACIENTE}</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setVistaHistoria('formulario')} 
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid #2b6cb0', backgroundColor: vistaHistoria === 'formulario' ? '#2b6cb0' : 'transparent', color: vistaHistoria === 'formulario' ? 'white' : '#2b6cb0', cursor: 'pointer' }}
                >
                  Cita Actual
                </button>
                <button 
                  onClick={() => setVistaHistoria('historial')} 
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid #2b6cb0', backgroundColor: vistaHistoria === 'historial' ? '#2b6cb0' : 'transparent', color: vistaHistoria === 'historial' ? 'white' : '#2b6cb0', cursor: 'pointer' }}
                >
                  Ver Previas
                </button>
              </div>
            </div>
            
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              {vistaHistoria === 'formulario' ? (
                <form onSubmit={guardarHistoria} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <input type="number" step="0.1" className="form-control" placeholder="Temp (°C)" style={{ width: '100%', boxSizing: 'border-box' }} value={formHistoria.temperatura} onChange={(e) => setFormHistoria({...formHistoria, temperatura: e.target.value})} disabled={historiaExiste} required />
                    <input type="number" className="form-control" placeholder="Frec. Cardíaca" style={{ width: '100%', boxSizing: 'border-box' }} value={formHistoria.frecuencia_cardiaca} onChange={(e) => setFormHistoria({...formHistoria, frecuencia_cardiaca: e.target.value})} disabled={historiaExiste} required />
                    <input type="number" className="form-control" placeholder="Frec. Resp (rpm)" style={{ width: '100%', boxSizing: 'border-box' }} value={formHistoria.frecuencia_respiratoria} onChange={(e) => setFormHistoria({...formHistoria, frecuencia_respiratoria: e.target.value})} disabled={historiaExiste} required />
                  </div>
                  
                  <textarea className="form-control" placeholder="Anamnesis (Síntomas y motivo detallado)" rows="3" style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} value={formHistoria.anamnesis} onChange={(e) => setFormHistoria({...formHistoria, anamnesis: e.target.value})} disabled={historiaExiste} required />
                  <textarea className="form-control" placeholder="Diagnóstico y Tratamiento" rows="3" style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} value={formHistoria.diagnostico} onChange={(e) => setFormHistoria({...formHistoria, diagnostico: e.target.value})} disabled={historiaExiste} required />

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {!historiaExiste && (
                      <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Registro</button>
                    )}
                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowHistoria(false)}>
                      Volver a la Cita
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {historialPaciente.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#718096', padding: '2rem 0' }}>No hay registros previos para este paciente.</p>
                  ) : (
                    historialPaciente.map((hist) => (
                      <div key={hist.ID_HISTORIA} style={{ padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong>📅 {hist.FECHA_CITA}</strong>
                          <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>🩺 {hist.VETERINARIO}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Motivo:</strong> {hist.MOTIVO}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#4a5568' }}>
                          <span>🌡️ {hist.TEMPERATURA}°C</span>
                          <span>❤️ {hist.FRECUENCIA_CARDIACA} lpm</span>
                          <span>🫁 {hist.FRECUENCIA_RESPIRATORIA} rpm</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Anamnesis:</strong> {hist.ANAMNESIS}</p>
                        <p style={{ fontSize: '0.85rem' }}><strong>Diagnóstico:</strong> {hist.DIAGNOSTICO}</p>
                      </div>
                    ))
                  )}
                  <button type="button" className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setShowHistoria(false)}>
                    Volver a la Cita
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}