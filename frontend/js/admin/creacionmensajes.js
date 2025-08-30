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
    inicializarReproductorYoutube();
});

// 📌 Captura y formatea el enlace de YouTube

function obtenerYoutubeEmbed() {
    const youtubeInput = document.getElementById("youtubeLink");
    const url = youtubeInput ? youtubeInput.value.trim() : "";
    if (!url) return "";

    // Expresión regular para extraer el ID del video
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
        const videoId = match[1];
        // Devuelve la URL completa del embed con autoplay, loop, playlist y otros parámetros
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
    }

    return "";
}


async function verificarEditarMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    idMensaje = urlParams.get('id');

    if (idMensaje) {
        try {
            const response = await fetch(`/api/messagesone/${idMensaje}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            let message = data.message || [];

            cargarDatosEditarMenssage(message);

            genQrBtn.classList.add("d-none");
            contActualizar.classList.remove("d-none");

        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }
}

function cargarDatosEditarMenssage(message) {
    document.getElementById('title').value = message.title || '';
    document.getElementById('viewsLimit').value = message.max_views || '';
    console.log(message.start_date)
    document.getElementById('startDate').value = message.start_date ? new Date(message.start_date).toISOString().slice(0, 16) : '';

    document.getElementById('expiresAt').value = message.expires_at ? new Date(message.expires_at).toISOString().slice(0, 16) : '';

    document.getElementById('status').value = message.estado;
    document.getElementById('youtubeLink').value = message.link_song || '';

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

        // ⬇️ Si hay un link de YouTube, mostramos el reproductor automáticamente
    if (message.link_song) {
        mostrarReproductorYoutubeInicial(message.link_song);
    }

}

// 🔹 Redirección para editar los detalles del mensaje
function editarDetalles(id) {
    window.location.href = `/admin/detallemensajes?id=${id}`;
}

// 📌 ACTUALIZAR MENSAJE
async function actualizarMensaje(e) {
    e.preventDefault();

    if (!idMensaje) {
        alert("No se puede actualizar el mensaje porque no se encontró un ID válido.");
        return;
    }

    const title = document.getElementById('title').value;
    const viewsLimit = document.getElementById('viewsLimit').value;
    const startDate = document.getElementById('startDate').value;
    const expiresAt = document.getElementById('expiresAt').value;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;
    const youtubeLink = obtenerYoutubeEmbed();

    if (!title || !viewsLimit || !expiresAt || !startDate) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    try {
        const response = await fetch(`/api/messagesupdate/${idMensaje}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                viewsLimit,
                startDate,
                expiresAt,
                status,
                link_song: youtubeLink,
                user_id: idUsuarioA,
                password
            })
        });

        const info = await response.json();
        const data = info.data || {};

        if (response.ok) {
            alert("✅ Mensaje actualizado correctamente");
            messageLinkEdit.href = data.link;
            messageLinkEdit.textContent = data.link;
            qrImageEdit.src = data.qr_code;
            resultDivEdit.classList.remove("d-none");
        } else {
            alert("⚠️ Error al actualizar: " + (data.message || "Inténtalo nuevamente."));
        }

    } catch (error) {
        console.error("❌ Error al actualizar el mensaje:", error);
        alert("Ocurrió un error en la conexión con el servidor.");
    }
}

// 📌 CREAR MENSAJE
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const viewsLimit = document.getElementById('viewsLimit').value;
    const startDate = document.getElementById('startDate').value;
    const expiresAt = document.getElementById('expiresAt').value;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;
    const youtubeLink = obtenerYoutubeEmbed();

    const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, viewsLimit, expiresAt, startDate, status, link_song: youtubeLink, user_id: idUsuarioA, password })
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

// 📌 Cargar usuario desde sessionStorage
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

// 📌 Inicializa el reproductor de YouTube en tiempo real
function inicializarReproductorYoutube() {
    const youtubeInput = document.getElementById("youtubeLink");
    const reproductorContainer = document.getElementById("reproductorYoutubeContainer");
    const youtubePlayer = document.getElementById("youtubePlayer");

    reproductorContainer.style.display = "none";

    youtubeInput.addEventListener("input", () => {
        const url = youtubeInput.value.trim();
        if (!url) {
            reproductorContainer.style.display = "none";
            youtubePlayer.src = "";
            return;
        }

        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            const videoId = match[1];
            youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
            reproductorContainer.style.display = "block";
        } else {
            reproductorContainer.style.display = "none";
            youtubePlayer.src = "";
        }
    });
}

function mostrarReproductorYoutubeInicial(link) {
    const reproductorContainer = document.getElementById("reproductorYoutubeContainer");
    const youtubePlayer = document.getElementById("youtubePlayer");

    // Expresión regular para capturar el ID del video
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = link.match(youtubeRegex);

    if (match && match[1]) {
        const videoId = match[1];
        youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
        reproductorContainer.style.display = "block";
    } else {
        reproductorContainer.style.display = "none";
        youtubePlayer.src = "";
    }
}

