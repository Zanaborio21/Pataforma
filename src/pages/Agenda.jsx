import { useState } from 'react';
import CalendarioCitas from '../components/CalendarioCitas';
import CitaForm from '../components/CitaForm';

export default function Agenda() {
  const [recargar, setRecargar] = useState(0);

  const manejarCitaAgregada = () => {
    setRecargar(recargar + 1);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1A202C' }}>Agenda Médica</h1>
        <p style={{ color: '#718096' }}>Gestiona los horarios de consultas, vacunación, cirugías y peluquería.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <CitaForm onCitaAgregada={manejarCitaAgregada} />
      </div>

      <CalendarioCitas recargar={recargar} />
    </div>
  );
}