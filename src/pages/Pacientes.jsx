import TutorForm from '../components/TutorForm';
import PacienteForm from '../components/PacienteForm';
import PacienteList from '../components/PacienteList';
import TutorList from '../components/TutorList';

export default function Pacientes() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1A202C' }}>Pacientes y Tutores</h1>
        <p style={{ color: '#718096' }}>Registra nuevos tutores y asígnales sus mascotas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <TutorForm />
        <PacienteForm />
      </div>

      {/* Aquí se muestran las listas de pacientes y tutores */}
      <PacienteList />
      <TutorList /> {/* Aquí se muestran las listas de pacientes y tutores */}
    </div>
  );
}