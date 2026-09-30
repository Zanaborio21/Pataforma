import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: 'https://referring-camping-canyon-far.trycloudflare.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesión Expirada',
          text: 'Tu sesión ha caducado por seguridad. Por favor, vuelve a ingresar.',
          confirmButtonColor: '#2A9D8F',
          allowOutsideClick: false 
        }).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login'; 
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;