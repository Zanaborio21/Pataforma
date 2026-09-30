import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../utils/alerts';

export default function PacienteForm() {
  const [tutores, setTutores] = useState([]);
  const [formData, setFormData] = useState({
    id_tutor: '', nombre: '', especie: '', 
    raza: '', fecha_nac: '', peso_kg: '', sexo: 'M'
  });

  // Cargar lista de tutores para el select
  useEffect(() => {
    const fetchTutores = async () => {
      const response = await api.get('/tutores');
      setTutores(response.data);
    };
    fetchTutores();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llama a pacientesController.js
      await api.post('/pacientes', formData);
      toast.fire({ icon: 'success', title: 'Paciente registrado con éxito 🐾' });
      setFormData({ id_tutor: '', nombre: '', especie: '', raza: '', fecha_nac: '', peso_kg: '', sexo: 'M' });
    } catch (error) {
      console.error('Error al registrar paciente', error);
      alertaError({ icon: 'error', title: 'Ocurrió un error al registrar el paciente' });
    }
  };

  return (
    <div className="form-card bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Registrar Nuevo Paciente</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-span-2">
          <label>Tutor Responsable</label>
          <select name="id_tutor" value={formData.id_tutor} onChange={handleChange} required className="form-control">
            <option value="">Seleccione un tutor...</option>
            {tutores.map(t => (
              <option key={t.ID_TUTOR} value={t.ID_TUTOR}>{t.NOMBRES} {t.APELLIDOS} - {t.DNI}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Nombre del Paciente</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Especie (Ej. Canino, Felino)</label>
          <input type="text" name="especie" value={formData.especie} onChange={handleChange} required className="form-control" />
        </div>
        <div className="form-group">
          <label>Raza</label>
          <input type="text" name="raza" value={formData.raza} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Sexo</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange} className="form-control">
            <option value="M">Macho</option>
            <option value="H">Hembra</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input type="date" name="fecha_nac" value={formData.fecha_nac} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Peso (Kg)</label>
          <input type="number" step="0.01" name="peso_kg" value={formData.peso_kg} onChange={handleChange} className="form-control" />
        </div>
        
        <div className="form-actions mt-4 col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">Guardar Paciente</button>
        </div>
      </form>
    </div>
  );
}