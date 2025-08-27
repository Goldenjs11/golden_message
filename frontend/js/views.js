let messageDetails = [];      // Mensajes completos
let groupedMessages = [];     // Mensajes agrupados por position
let currentGroupIndex = 0;    // Índice del grupo actual
let autoTimeout = null;

function cargarMensaje() {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');

    if (!messageId) {
        alert("Falta el ID del mensaje");
        return;
    }

    fetch(`/api/message/${messageId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            const { message, messagedetails } = data.content;
            console.log("🚀 ~ cargarMensaje ~ messagedetails:", messagedetails);
            let vistasRestantes = data.vistasRestantes;

            // Guardamos los detalles globalmente
            messageDetails = messagedetails;

            // Agrupamos los mensajes por position
            groupedMessages = agruparPorPosition(messageDetails);

            // Mostrar datos generales
            document.getElementById('messageTitle').textContent = message.title;
            document.getElementById('vistasRestantes').textContent = vistasRestantes;
            document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";

            // Mostrar QR si existe
            if (message.qr_code) {
                document.getElementById('qrContainer').style.display = 'block';
                document.getElementById('qrImage').src = message.qr_code;
            }

            // Mostrar enlace
            document.getElementById('messageLink').textContent = "Link al mensaje";
            document.getElementById('messageLink').href = message.link;

            // Mostrar alerta si las vistas están por agotarse
            const alertVistas = document.getElementById('alertVistas');
            if (vistasRestantes <= 2) {
                alertVistas.classList.remove("d-none");
            }

            // Si ya no hay vistas, pedimos contraseña
            if (vistasRestantes <= 0) {
                mostrarModalPassword(messageId);
            }

            // Configurar botón para ver detalles
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


        <div id="reproductorSpotifyContainer" class="text-center mt-3">
                <iframe style="border-radius:12px"
                    src="https://open.spotify.com/embed/track/6fwPja1mVgyYA93mFHTorn?utm_source=generator&theme=0"
                    width="100%" height="80" frameborder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
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
        msgDiv.style.cssText = `
            background-color: ${msg.background_color || "transparent"};
            color: ${msg.text_color};
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





function mostrarModalPassword(messageId) {
    const modal = new bootstrap.Modal(document.getElementById('modalPassword'));
    modal.show();

    const btnCheck = document.getElementById('btnCheckPassword');
    btnCheck.addEventListener('click', () => {
        const password = document.getElementById('inputPassword').value.trim();

        if (!password) {
            document.getElementById('errorPassword').textContent = "La contraseña es obligatoria";
            document.getElementById('errorPassword').classList.remove("d-none");
            return;
        }

        fetch(`/api/message/${messageId}/verify-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    location.reload();
                } else {
                    document.getElementById('errorPassword').textContent = "Contraseña incorrecta ❌";
                    document.getElementById('errorPassword').classList.remove("d-none");
                }
            })
            .catch(err => console.error(err));
    });
}

// Ejecutar al cargar la página
cargarMensaje();
