function generarFilas() {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = ""; // Limpiar el contenido actual del tbody

    fetch('http://localhost:8080/api/usuarios')
        .then(response => response.json()) // Convertir la respuesta a JSON
        .then(data => {
            // Verificar si la solicitud fue exitosa (status: true)
            if (data.status) {
                // Recorrer la lista de usuarios y agregar filas a la tabla
                data.data.forEach(usuario => {
                    const row = `
                        <tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.usuario}</td>
                            <td>${usuario.persona.nombres} ${usuario.persona.apellidoPaterno} ${usuario.persona.apellidoMaterno}</td>
                            <td>${usuario.rol.rol}</td>
                            <td>${usuario.fechaCreacion}</td>
                            <td>
                                <button type="button" class="btn btn-success btn-editar" data-id="${usuario.id}">Editar</button>
                                <button type="button" class="btn btn-danger btn-eliminar" data-id="${usuario.id}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });

                document.querySelectorAll('.btn-eliminar').forEach(button => {
                    button.addEventListener('click', (e) => {

                        Swal.fire({
                            title: "¿Estás seguro?",
                            text: "Una vez eliminado, no podrás recuperar este registro.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: 'Eliminar',
                            cancelButtonText: 'Cancelar',
                            dangerMode: true,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const userId = e.target.getAttribute('data-id');
                                fetch(`http://localhost:8080/api/usuarios/${userId}`, {
                                    method: 'DELETE',
                                })
                                    .then(response => {
                                        if (response.ok) {
                                            generarFilas();
                                            Swal.fire({
                                                title: "¡El usuario ha sido eliminado!",
                                                icon: "success",
                                            });
                                        } else {
                                            throw new Error('No se pudo eliminar el usuario.');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error al eliminar el usuario:', error);
                                        swal("¡Error!", "No se pudo eliminar el usuario.", "error");
                                    });
                            }
                        });
                    });
                });

                document.querySelectorAll('.btn-editar').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const userId = e.target.getAttribute('data-id');

                        fetch(`http://localhost:8080/api/usuarios/${userId}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.status) {
                                    const usuario = data.data;

                                    document.getElementById('id-usuario-editar').value = usuario.id;
                                    document.getElementById('usuario-editar').value = usuario.usuario;
                                    document.getElementById('contrasena-editar').value = usuario.contrasenia;
                                    document.getElementById('correo-editar').value = usuario.correoRecuperacion;
                                    document.getElementById('status-select-persona-editar').value = usuario.persona.id;
                                    document.getElementById('status-select-rol-editar').value = usuario.rol.id;

                                    // Abrir el modal de edición
                                    const modal = new bootstrap.Modal(document.getElementById('custom-modal-editar-usuario'));
                                    modal.show();
                                } else {
                                    console.error('Error al obtener los datos del usuario:', data.message);
                                    swal("¡Error!", "No se pudieron obtener los datos del usuario.", "error");
                                }
                            })
                            .catch(error => {
                                console.error('Error al realizar la solicitud HTTP:', error);
                                swal("¡Error!", "No se pudieron obtener los datos del usuario.", "error");
                            });
                    });
                });

            } else {
                console.error('Error al obtener la lista de usuarios:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al realizar la solicitud HTTP:', error);
        });
}

function generarOpcionesDeRoles() {
    const selectRol = document.getElementById('status-select-rol');
    const selectRolEditar = document.getElementById('status-select-rol-editar');

    // Limpia las opciones existentes en ambos selectores
    selectRol.innerHTML = '';
    selectRolEditar.innerHTML = '';

    selectRol.appendChild(new Option('Elige un rol', ''));
    selectRolEditar.appendChild(new Option('Elige un rol', ''));

    fetch('http://localhost:8080/api/roles')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                data.data.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id;
                    option.textContent = rol.rol;

                    // Agrega la opción a ambos selectores
                    selectRol.appendChild(option.cloneNode(true)); // Crea un clon para evitar referencias duplicadas
                    selectRolEditar.appendChild(option.cloneNode(true));
                });
            } else {
                console.error('Error al obtener la lista de roles:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al realizar la solicitud HTTP:', error);
        });
}

function generarOpcionesDePersonas() {
    const selectPersona = document.getElementById('status-select-persona');
    const selectPersonaEditar = document.getElementById('status-select-persona-editar');

    selectPersona.innerHTML = '';
    selectPersonaEditar.innerHTML = '';

    selectPersona.appendChild(new Option('Elige una persona', ''));
    selectPersonaEditar.appendChild(new Option('Elige una persona', ''));

    fetch('http://localhost:8080/api/personas')
        .then(response => response.json()) // Convertir la respuesta a JSON
        .then(data => {
            // Verificar si la solicitud fue exitosa (status: true)
            if (data.status) {
                // Recorrer la lista de personas y crear opciones para el select
                data.data.forEach(persona => {
                    const option = document.createElement('option');
                    option.value = persona.id;
                    option.textContent = `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`;


                    // Agrega la opción a ambos selectores
                    selectPersona.appendChild(option.cloneNode(true)); // Crea un clon para evitar referencias duplicadas
                    selectPersonaEditar.appendChild(option.cloneNode(true));
                });
            } else {
                console.error('Error al obtener la lista de personas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al realizar la solicitud HTTP:', error);
        });
}

function guardarUsuario() {
    const usuario = document.getElementById('usuario-create').value;
    const contrasenia = document.getElementById('contrasena-create').value;
    const correo = document.getElementById('correo-create').value;
    const personaId = document.getElementById('status-select-persona').value;
    const rolId = document.getElementById('status-select-rol').value;

    const nuevoUsuario = {
        personaId: personaId,
        usuario: usuario,
        contrasenia: contrasenia,
        correoRecuperacion: correo,
        rolId: rolId
    };

    console.log(nuevoUsuario);

    fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoUsuario)
    })
        .then(response => response.json())
        .then(
            () => {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El nuevo usuario ha sido creado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                const modal = bootstrap.Modal.getInstance(document.getElementById('custom-modal'));
                modal.hide();
                // Vaciar los campos después de ocultar el modal
                document.getElementById('usuario-create').value = '';
                document.getElementById('contrasena-create').value = '';
                document.getElementById('correo-create').value = '';
                document.getElementById('status-select-persona').selectedIndex = 0;
                document.getElementById('status-select-rol').selectedIndex = 0;

                generarFilas();
            })
        .catch(error => {
            Swal.fire({
                title: 'Ha sucedido un error!',
                text: 'Error al crear el usuario. Por favor, inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        });
}

function actualizarUsuario() {
    const usuarioId = document.getElementById('id-usuario-editar').value;
    const usuario = document.getElementById('usuario-editar').value;
    const contrasenia = document.getElementById('contrasena-editar').value;
    const correo = document.getElementById('correo-editar').value;
    const personaId = document.getElementById('status-select-persona-editar').value;
    const rolId = document.getElementById('status-select-rol-editar').value;

    const usuarioActualizado = {
        personaId: personaId,
        usuario: usuario,
        contrasenia: contrasenia,
        correoRecuperacion: correo,
        rolId: rolId
    };

    fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioActualizado)
    })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El usuario ha sido actualizado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                const modal = bootstrap.Modal.getInstance(document.getElementById('custom-modal-editar-usuario'));
                modal.hide();
                generarFilas();
            } else {
                throw new Error('No se pudo actualizar el usuario.');
            }
        })
        .catch(error => {
            console.error('Error al actualizar el usuario:', error);
            swal("¡Error!", "No se pudo actualizar el usuario.", "error");
        });
}

function guardarNuevoRol() {
    // Obtener los valores de los campos del formulario
    const nombreRol = document.getElementById('name-rol').value;
    const descripcionRol = document.getElementById('descripcion-rol').value;
    const permisos = [];
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            permisos.push(checkbox.nextElementSibling.textContent.trim());
        }
    });

    // Crear el objeto de datos a enviar
    const nuevoRol = {
        rol: nombreRol,
        descripcion: descripcionRol,
        permisos: JSON.stringify(permisos) // Convertir la lista de permisos a JSON
    };

    // Enviar los datos al endpoint mediante una solicitud POST
    fetch('http://localhost:8080/api/roles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoRol)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                // Si la solicitud fue exitosa, mostrar un mensaje de éxito y cerrar el modal
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El nuevo rol ha sido creado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                const modal = bootstrap.Modal.getInstance(document.getElementById('custom-modal-rol'));
                modal.hide();
                generarOpcionesDeRoles();
            } else {
                // Si ocurrió un error, mostrar un mensaje de error
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo crear el nuevo rol. Por favor, inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error('Error al realizar la solicitud HTTP:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el nuevo rol. Por favor, inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        });
}


function inicializarVista() {
    generarFilas();
    generarOpcionesDeRoles();
    generarOpcionesDePersonas();
}


// Llamar a la función inicializarVista al inicializar la vista
window.onload = inicializarVista;

