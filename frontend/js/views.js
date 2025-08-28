let messageDetails = [];      // Mensajes completos
let groupedMessages = [];     // Mensajes agrupados por position
let currentGroupIndex = 0;    // Índice del grupo actual
let autoTimeout = null;
let messageLinkSong = null;

function cargarMensaje() {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');


    if (!messageId) {
        alert("Falta el ID del mensaje");
        return;
    }

        // 🔹 Codificamos el ID para evitar problemas con caracteres especiales
    const encodedId = encodeURIComponent(messageId);
    console.log("🚀 ~ cargarMensaje ~ encodedId:", encodedId)

    // 🚨 Aquí hacemos la petición al backend
    fetch(`/api/message/${encodedId}`)
        .then(res => res.json())
        .then(data => {
            if (data.requierePassword) {
                mostrarModalPassword(messageId);
                return;
            }

            if (data.error) {
                alert(data.error);
                return;
            }

            const { message, messagedetails } = data.content;
            messageLinkSong = message.link_song;

            let vistasRestantes = data.vistasRestantes;

            messageDetails = messagedetails;
            groupedMessages = agruparPorPosition(messageDetails);

            document.getElementById('messageTitle').textContent = message.title;
            document.getElementById('vistasRestantes').textContent = vistasRestantes;
            document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";

            if (message.qr_code) {
                document.getElementById('qrContainer').style.display = 'block';
                document.getElementById('qrImage').src = message.qr_code;
            }

            document.getElementById('messageLink').textContent = "Link al mensaje";
            document.getElementById('messageLink').href = message.link;

            const alertVistas = document.getElementById('alertVistas');
            if (vistasRestantes <= 2) {
                alertVistas.classList.remove("d-none");
            }

            document.getElementById("btnVerDetalles").addEventListener("click", () => {
                currentGroupIndex = 0;
                mostrarGrupo(currentGroupIndex);
            });
        })
        .catch(err => {
            console.error(err);
            alert("Error al cargar el mensaje");
        });
}




// Agrupar mensajes por position
function agruparPorPosition(mensajes) {
    const grupos = {};

    mensajes.forEach(msg => {
        if (!grupos[msg.position]) {
            grupos[msg.position] = [];
        }
        grupos[msg.position].push(msg);
    });

    // Ordenar grupos por position
    return Object.keys(grupos)
        .sort((a, b) => a - b)
        .map(pos => grupos[pos]);
}

// Función para animar texto con efecto máquina de escribir
function escribirTexto(elemento, texto, velocidad = 40, callback) {
    let i = 0;
    elemento.textContent = "";

    function escribir() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i);
            i++;
            setTimeout(escribir, velocidad);
        } else if (callback) {
            callback();
        }
    }
    escribir();
}

// Mostrar grupo de mensajes

function mostrarGrupo(index) {
    if (index >= groupedMessages.length) {
        const container = document.querySelector(".card");
        container.innerHTML = `
            <div class="alert alert-success text-center rounded-4 p-4">
                🎉 ¡Has visto todos los detalles!
            </div>
        `;
        return;
    }

    const grupo = groupedMessages[index];
    const container = document.querySelector(".card");

    // Si es la primera vez → creamos la estructura base con reproductor
    if (!document.getElementById("contenedorMensajes")) {
        container.innerHTML = `
            <h3 class="text-primary text-center mb-3">📩 Detalles del mensaje</h3>
            <hr>
            <div id="contenedorMensajes"></div>
            <div class="text-center mt-3 d-none" id="botonSiguienteContainer">
                <button id="botonSiguiente" class="btn btn-outline-primary rounded-pill px-4 py-2">
                    ⏭️ Siguiente grupo
                </button>
            </div>

            <!-- Reproductor de YouTube -->
            <div id="reproductorYoutubeContainer" class="text-center mt-4">
                <iframe id="youtubePlayer"
                    width="100%" height="80"
                    src="${messageLinkSong ? messageLinkSong : "https://www.youtube.com/embed/MATmOn-Nk5Y?autoplay=1&mute=0&loop=1&playlist=MATmOn-Nk5Y&controls=1&modestbranding=1&rel=0"}"
                    title="Reproductor YouTube"
                    frameborder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>

            <div class="text-center mt-2 text-muted">
                <small id="contadorGrupos"></small>
            </div>
        `;
    }

    // Limpiamos solo los mensajes, pero NO tocamos el reproductor
    const contenedorMensajes = document.getElementById("contenedorMensajes");
    contenedorMensajes.innerHTML = "";

    const botonContainer = document.getElementById("botonSiguienteContainer");
    const botonSiguiente = document.getElementById("botonSiguiente");
    const contador = document.getElementById("contadorGrupos");
    contador.textContent = `Mostrando grupo ${index + 1} de ${groupedMessages.length}`;

    // Ordenamos mensajes por prioridad
    const titulo = grupo.find(msg => msg.priority === 1);
    const mensajesPrincipales = grupo.filter(msg => msg.priority === 2);
    const pie = grupo.find(msg => msg.priority === 3);

    const mensajesOrdenados = [];
    if (titulo) mensajesOrdenados.push(titulo);
    mensajesOrdenados.push(...mensajesPrincipales);
    if (pie) mensajesOrdenados.push(pie);

    let mensajesCompletados = 0;

    mensajesOrdenados.forEach((msg, idx) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = "p-3 mb-3 rounded-3 shadow-sm opacity-0";

        // 🎨 NUEVA LÓGICA PARA SOPORTAR GRADIENTES 🎨
        const backgroundStyle = (msg.background_color && msg.background_color2)
            ? `background: linear-gradient(135deg, ${msg.background_color}, ${msg.background_color2});`
            : `background-color: ${msg.background_color || "transparent"};`;

        const textStyle = (msg.text_color && msg.text_color2)
            ? `
                background: linear-gradient(135deg, ${msg.text_color}, ${msg.text_color2});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            `
            : `color: ${msg.text_color};`;

        msgDiv.style.cssText = `
            ${backgroundStyle}
            ${textStyle}
            font-family: ${msg.font_family};
            font-size: ${msg.font_size}px;
            transition: opacity 0.5s ease-in-out;
        `;

        msgDiv.innerHTML = `<div class="mensaje-texto"></div>`;
        contenedorMensajes.appendChild(msgDiv);

        const textoElemento = msgDiv.querySelector(".mensaje-texto");

        setTimeout(() => {
            msgDiv.classList.remove("opacity-0");
            escribirTexto(textoElemento, msg.detail, 35, () => {
                mensajesCompletados++;

                if (mensajesCompletados === mensajesOrdenados.length) {
                    botonContainer.classList.remove("d-none");
                }

                setTimeout(() => {
                    msgDiv.style.opacity = "0";
                    setTimeout(() => {
                        msgDiv.style.display = "none";
                    }, 500);
                }, msg.display_time * 1000);
            });
        }, idx * 300);
    });

    // Botón siguiente grupo
    botonSiguiente.onclick = () => {
        currentGroupIndex++;
        mostrarGrupo(currentGroupIndex);
    };
}



// 🔹 Mostramos modal y solicitamos contraseña
function mostrarModalPassword(messageId) {
    const modal = new bootstrap.Modal(document.getElementById('modalPassword'));
    modal.show();

    const btnCheck = document.getElementById('btnCheckPassword');
    btnCheck.onclick = () => {
        const password = document.getElementById('inputPassword').value.trim();

        if (!password) {
            document.getElementById('errorPassword').textContent = "La contraseña es obligatoria";
            document.getElementById('errorPassword').classList.remove("d-none");
            return;
        }
        const encodedId = encodeURIComponent(messageId);

        // ✅ Ahora enviamos la contraseña y pedimos los datos completos al backend
        fetch(`/api/message/${encodedId }`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                modal.hide();
                actualizarVistaConMensaje(result.content.message, result.content.messagedetails, result.vistasRestantes);
            } else {
                document.getElementById('errorPassword').textContent = result.error || "Contraseña incorrecta ❌";
                document.getElementById('errorPassword').classList.remove("d-none");
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('errorPassword').textContent = "Error al verificar contraseña";
            document.getElementById('errorPassword').classList.remove("d-none");
        });
    };
}

// 🔹 Nueva función para actualizar la vista con los datos del mensaje desbloqueado
function actualizarVistaConMensaje(message, messagedetails, vistasRestantes) {
    messageDetails = messagedetails;
    groupedMessages = agruparPorPosition(messageDetails);

    document.getElementById('messageTitle').textContent = message.title;
    document.getElementById('vistasRestantes').textContent = vistasRestantes;
    document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";

    // Actualizar QR si existe
    if (message.qr_code) {
        document.getElementById('qrContainer').style.display = 'block';
        document.getElementById('qrImage').src = message.qr_code;
    }

    // Actualizar link
    document.getElementById('messageLink').textContent = "Link al mensaje";
    document.getElementById('messageLink').href = message.link;

    // Alertar si quedan pocas vistas
    const alertVistas = document.getElementById('alertVistas');
    if (vistasRestantes <= 2) {
        alertVistas.classList.remove("d-none");
    } else {
        alertVistas.classList.add("d-none");
    }

    // Configurar botón para ver detalles de nuevo
    document.getElementById("btnVerDetalles").addEventListener("click", () => {
        currentGroupIndex = 0;
        mostrarGrupo(currentGroupIndex);
    });
}





// Ejecutar al cargar la página
cargarMensaje();
