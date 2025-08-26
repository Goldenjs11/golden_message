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
    resultDivEdit.classList.remove('d-none');

    btnActualizarDetalles.addEventListener('click', (e) => {
        e.preventDefault();
        editarDetalles(message.id);
    });
        

}

// 🔹 Redirección para editar los detalles del mensaje o crear los respectivos detalles
function editarDetalles(id) {
    window.location.href = `/admin/detallemensajes?id=${id}`;
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