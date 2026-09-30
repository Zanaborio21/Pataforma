import Swal from 'sweetalert2';

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export const confirmar = async (titulo, texto) => {
  const result = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2A9D8F',
    cancelButtonColor: '#F56565',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};

export const alertaError = (mensaje) => {
  Swal.fire({
    icon: 'error',
    title: '¡Ups!',
    text: mensaje,
    confirmButtonColor: '#2A9D8F'
  });
};