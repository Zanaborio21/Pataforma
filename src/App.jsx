// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- Importa el AuthProvider
import Layout from './components/Layout';
import Pacientes from './pages/Pacientes';
import Admin from './pages/Admin';
import Login from './pages/Login'; // <-- Importa la página real de Login
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider> {/* <-- Envuelve todo en el AuthProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;