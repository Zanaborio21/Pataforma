import { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const obtenerUsuarioGuardado = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "undefined") {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error("Error leyendo la sesión:", error);
      return null;
    }
  };

  const [user, setUser] = useState(obtenerUsuarioGuardado);

  const login = async (correo, password) => {
    const response = await api.post('/usuarios/login', { correo, password });
    
    const datosUsuario = response.data.usuario; 
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(datosUsuario));
    setUser(datosUsuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};