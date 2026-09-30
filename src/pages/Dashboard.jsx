import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalPacientes: 0, totalTutores: 0, totalUsuarios: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1A202C' }}>¡Hola, {user?.nombres}! 👋</h1>
        <p style={{ color: '#718096' }}>Aquí tienes el resumen actual de la clínica PATAFORMA.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        
        {/* Tarjeta de Pacientes */}
        <div className="form-card" style={{ borderTop: '4px solid #2A9D8F', textAlign: 'center' }}>
          <h3 style={{ color: '#718096', fontSize: '1rem', textTransform: 'uppercase' }}>Total Pacientes</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1A202C', margin: '1rem 0' }}>
            {stats.totalPacientes}
          </p>
          <span style={{ color: '#2A9D8F', fontWeight: 'bold' }}>🐾 Mascotas registradas</span>
        </div>

        {/* Tarjeta de Tutores */}
        <div className="form-card" style={{ borderTop: '4px solid #F4A261', textAlign: 'center' }}>
          <h3 style={{ color: '#718096', fontSize: '1rem', textTransform: 'uppercase' }}>Total Tutores</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1A202C', margin: '1rem 0' }}>
            {stats.totalTutores}
          </p>
          <span style={{ color: '#F4A261', fontWeight: 'bold' }}>👤 Clientes en sistema</span>
        </div>

        {/* Tarjeta de Usuarios (Personal) */}
        <div className="form-card" style={{ borderTop: '4px solid #E76F51', textAlign: 'center' }}>
          <h3 style={{ color: '#718096', fontSize: '1rem', textTransform: 'uppercase' }}>Personal Activo</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1A202C', margin: '1rem 0' }}>
            {stats.totalUsuarios}
          </p>
          <span style={{ color: '#E76F51', fontWeight: 'bold' }}>🏥 Usuarios del sistema</span>
        </div>

      </div>
    </div>
  );
}