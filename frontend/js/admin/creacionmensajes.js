const form = document.getElementById('messageForm');
let idUsuarioA = null;
const resultDiv = document.getElementById('result');
const messageLink = document.getElementById('messageLink');
const qrImage = document.getElementById('qrImage');
const genQrBtn = document.getElementById('generar-qr');
const contActualizar = document.getElementById('actionButtons');
let idMensaje = null;
const btnCrearDetalles = document.getElementById('btn-crear-detalles');

let idMensajeEditar = null;

const resultDivEdit = document.getElementById('result-edit');

const messageLinkEdit = document.getElementById('messageLinkEdit');
const qrImageEdit = document.getElementById('qrImageEdit');




let btnActualizarDetalles = document.getElementById('btn-actualizar-detalles');


document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarioDesdeSessionStorage();
    verificarEditarMenssage();
});



async function verificarEditarMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    idMensaje = urlParams.get('id');

    if (idMensaje) {
        console.log("🚀 ~ verificarEditarMenssage ~ idMensaje:", idMensaje)

        try {
            // Solicitar los datos del mensaje específico
            const response = await fetch(`/api/messagesone/${idMensaje}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();

            // Si tienes mensajes para filtrar en el catálogo
            let message = data.message || [];

            cargarDatosEditarMenssage(message);
  
            // Ocultar el botón de Generar QR
            genQrBtn.classList.add("d-none");

            // Mostrar contenedor de botones de actualización
            contActualizar.classList.remove("d-none");

 

        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }
}

function cargarDatosEditarMenssage(message) {
    document.getElementById('title').value = message.title || '';
    document.getElementById('viewsLimit').value = message.max_views || '';
    document.getElementById('expiresAt').value = message.expires_at ? new Date(message.expires_at).toISOString().slice(0, 16) : '';
    document.getElementById('status').value = message.estado;

    messageLinkEdit.href = message.link;
    messageLinkEdit.textContent = message.link;
    qrImageEdit.src = message.qr_code;
    btnCrearDetalles.classList.add('d-none');
    resultDivEdit.classList.remove('d-none');

    btnActualizarDetalles.addEventListener('click', (e) => {
        e.preventDefault();
        editarDetalles(message.id);
    });
    const btnActualizarMensaje = document.getElementById("btn-update-message");
        if (btnActualizarMensaje) {
            btnActualizarMensaje.addEventListener("click", actualizarMensaje);
        }
                

}

// 🔹 Redirección para editar los detalles del mensaje o crear los respectivos detalles
function editarDetalles(id) {
    window.location.href = `/admin/detallemensajes?id=${id}`;
}

// Función para actualizar el mensaje existente
async function actualizarMensaje(e) {
    e.preventDefault();

    if (!idMensaje) {
        alert("No se puede actualizar el mensaje porque no se encontró un ID válido.");
        return;
    }

    // Tomamos los valores del formulario
    const title = document.getElementById('title').value;
    const viewsLimit = document.getElementById('viewsLimit').value;
    const expiresAt = document.getElementById('expiresAt').value;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;

    // Validación rápida
    if (!title || !viewsLimit || !expiresAt) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    try {
        // Enviar la solicitud PUT para actualizar el mensaje
        const response = await fetch(`/api/messagesupdate/${idMensaje}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                viewsLimit,
                expiresAt,
                status,
                user_id: idUsuarioA,
                password
            })
        });

        const info = await response.json();
        const data = info.data|| {};
        console.log("🚀 ~ actualizarMensaje ~ data:", data)

        if (response.ok) {
            alert("✅ Mensaje actualizado correctamente");

            // Actualizamos el enlace y el QR en pantalla
            messageLinkEdit.href = data.link;
            messageLinkEdit.textContent = data.link;
            qrImageEdit.src = data.qr_code;

            // Mostramos el resultado actualizado
            resultDivEdit.classList.remove("d-none");

        } else {
            alert("⚠️ Error al actualizar: " + (data.message || "Inténtalo nuevamente."));
        }

    } catch (error) {
        console.error("❌ Error al actualizar el mensaje:", error);
        alert("Ocurrió un error en la conexión con el servidor.");
    }
}



form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const viewsLimit = document.getElementById('viewsLimit').value;
    const expiresAt = document.getElementById('expiresAt').value;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, viewsLimit, expiresAt, status, user_id : idUsuarioA, password })
    });

    const data = await res.json();


    if (res.ok) {
        messageLink.href = data.link;
        messageLink.textContent = data.link;
        qrImage.src = data.qrUrl;
        genQrBtn.classList.add("d-none");
        resultDiv.classList.remove('d-none');
        btnCrearDetalles.classList.remove('d-none');

        idMensajeEditar = data.message.id;
        btnCrearDetalles.addEventListener('click', redirigirCrearDetalles);
    } else {
        alert(data.error || "Error al generar el mensaje");
    }
});


function redirigirCrearDetalles() {
    if (idMensajeEditar) {
        window.location.href = `/admin/detallemensajes?idnuevo=${idMensajeEditar}`;
    } else {
        alert("Primero debes generar un mensaje antes de crear detalles.");
    }
}


function cargarUsuarioDesdeSessionStorage() {
    const storedInfoUsuario = sessionStorage.getItem('infoUsuario');
    if (storedInfoUsuario) {
        try {
            const infoUsuario = JSON.parse(storedInfoUsuario);
            idUsuarioA = infoUsuario.id || null;
        } catch (error) {
            console.error("Error al parsear infoUsuario:", error);
        }
    }
}