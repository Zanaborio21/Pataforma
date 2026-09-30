import { useState } from 'react';
import api from '../services/api';
import { toast } from '../utils/alerts';

export default function TutorForm({ onTutorCreated }) {
  const [formData, setFormData] = useState({
    dni: '', nombres: '', apellidos: '', 
    telefono: '', correo: '', direccion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llama a tutoresController.js
      const response = await api.post('/tutores', formData);
      toast.fire({ icon: 'success', title: 'Tutor registrado con éxito' });
      setFormData({ dni: '', nombres: '', apellidos: '', telefono: '', correo: '', direccion: '' });
      if(onTutorCreated) onTutorCreated(response.data);
    } catch (error) {
      console.error('Error al registrar tutor', error);
      const mensajeBackend = error.response?.data?.error || 'Ocurrió un error al registrar el tutor';
      toast.fire({ icon: 'error', title: mensajeBackend });
    }
  };

  return (
    <div className="form-card bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Registrar Nuevo Tutor</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>DNI</label>
          <input type="text" name="dni" maxLength="8" value={formData.dni} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Nombres</label>
          <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Apellidos</label>
          <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group col-span-2">
          <label>Dirección</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-actions mt-4 col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">Guardar Tutor</button>
        </div>
      </form>
    </div>
  );
}