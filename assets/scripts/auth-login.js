const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita que el formulario se envíe por defecto

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const loginData = {
    usuario: username,
    contrasenia: password
  };

  fetch('http://localhost:8080/api/auth/login', {
    method: 'POST', // Método POST para enviar datos
    headers: { 'Content-Type': 'application/json' }, // Encabezado para JSON
    body: JSON.stringify(loginData) // Convertir datos de inicio de sesión a JSON
  })
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        // Login correcto, redirigir a index.html
        window.location.href = "/home.html";

      } else {
        // Credenciales incorrectas, mostrar SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
          text: data.message
        });
      }
    })
    .catch(error => {
      console.error('Error al realizar la solicitud de login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Ocurrió un error al intentar iniciar sesión.'
      });
    });
});