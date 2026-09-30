import UsuarioForm from '../components/UsuarioForm';
import UsuarioList from '../components/UsuarioList';

export default function Admin() {
  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: '#1A202C' }}>Panel de Administración</h2>
      
      {/* Formulario para crear usuarios */}
      <UsuarioForm />
      
      {/* Lista de usuarios */}
      <UsuarioList />
    </div>
  );
}