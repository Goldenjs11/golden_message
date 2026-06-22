let messageDetails = [];    // Mensajes completos
let groupedMessages = [];     // Mensajes agrupados por position
let currentGroupIndex = 0;    // Índice del grupo actual
let datosBanerUsuario;
let autoTimeout = null;
let messageLinkSong = null;
let currentMessageHash = null;
let currentReactions = null;

const DEFAULT_EMBED_SONG = "https://www.youtube.com/embed/MATmOn-Nk5Y?autoplay=1&mute=0&loop=1&playlist=MATmOn-Nk5Y&controls=1&modestbranding=1&rel=0";

function configurarBotonDetalles(estaListo = false) {
    const boton = document.getElementById("btnVerDetalles");
    if (!boton) return;

    boton.disabled = !estaListo;
    boton.textContent = estaListo ? "Ver detalles del mensaje" : "Cargando mensaje...";
    boton.onclick = estaListo
        ? () => {
            currentGroupIndex = 0;
            mostrarGrupo(currentGroupIndex);
        }
        : null;
}

function cargarMensaje() {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');
    currentMessageHash = messageId;
    configurarBotonDetalles(false);


    if (!messageId) {
        mensajeNoDisponible("Falta el ID del mensaje en la URL");
        return;
    }

    // 🔹 Codificamos el ID para evitar problemas con caracteres especiales
    const encodedId = encodeURIComponent(messageId);


    // 🚨 Aquí hacemos la petición al backend
    fetch(`/api/message/${encodedId}`)
        .then(res => res.json())
        .then(data => {
            if (data.requierePassword) {
                mostrarModalPassword(messageId);
                return;
            }

            if (data.disponible === false) {
                mensajeNoDisponible(data.error || "El mensaje no está disponible en este momento.");
                return;
            }


            if (data.error) {
                // Si el error es de mensaje aún no disponible
                if (data.disponible_en) {
                    iniciarContador(data.disponible_en);
                } else {
                    mensajeNoDisponible(data.error);
                }
                return;
            }

            // Si el mensaje está disponible, ocultamos contador
            document.getElementById('contadorDisponibilidad').classList.add('d-none');

            const { message, messagedetails, banerUser, reactions } = data.content;
            messageLinkSong = message.link_song;
            datosBanerUsuario = banerUser;
            currentReactions = normalizarReacciones(reactions);
            let vistasRestantes = data.vistasRestantes;

            messageDetails = messagedetails;
            groupedMessages = agruparPorPosition(messageDetails);


            document.getElementById('messageTitle').textContent = message.title;
            document.getElementById('vistasRestantes').textContent = vistasRestantes;
            document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";

            poblaBaner(banerUser);

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

            configurarBotonDetalles(true);
        })
        .catch(err => {
            console.error(err);
            mensajeNoDisponible("Error al cargar el mensaje");
            configurarBotonDetalles(false);
        });
}

function poblaBaner(datosBaner) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const facebookPreview = document.getElementById('facebookLinkPreview');
    const instagramPreview = document.getElementById('instagramLinkPreview');

    if (!usernameDisplay || !facebookPreview || !instagramPreview) {
        return;
    }

    usernameDisplay.textContent = "Anonimo";
    facebookPreview.removeAttribute("href");
    instagramPreview.removeAttribute("href");
    facebookPreview.style.display = "none";
    instagramPreview.style.display = "none";

    if (datosBaner) {

        usernameDisplay.textContent = datosBaner.username_public || "Anonimo";

        if (datosBaner.facebook_link) {
            facebookPreview.setAttribute("href", normalizarUrl(datosBaner.facebook_link));
            facebookPreview.style.display = "inline-block";
        } else {
            facebookPreview.style.display = "none";
        }

        if (datosBaner.instagram_link) {
            instagramPreview.setAttribute("href", normalizarUrl(datosBaner.instagram_link));
            instagramPreview.style.display = "inline-block";
        } else {
            instagramPreview.style.display = "none";
        }

    }
}

function normalizarUrl(url) {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
    }
    return url;
}


function mensajeNoDisponible(mensaje) {
    const mensajeDiv = document.getElementById('MensajeDisponibilidad');
    mensajeDiv.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="cerrarMensaje()">&times;</button>
    `;

    mensajeDiv.classList.remove('d-none');
    setTimeout(() => {
        mensajeDiv.classList.add('show');
    }, 10);
}

function cerrarMensaje() {
    const mensajeDiv = document.getElementById('MensajeDisponibilidad');
    mensajeDiv.classList.remove('show');
    setTimeout(() => {
        mensajeDiv.classList.add('d-none');
    }, 300);
}



function iniciarContador(fechaDisponibilidad) {
    const contador = document.getElementById('contadorDisponibilidad');
    contador.classList.remove('d-none');

    // ✅ Convertimos la fecha de disponibilidad a milisegundos (sin tocar la zona horaria original)
    const fechaObj = new Date(fechaDisponibilidad).getTime();

    const intervalo = setInterval(() => {
        // ✅ Obtenemos la hora actual en Colombia
        const ahoraUTC = new Date();
        const ahoraColombia = ahoraUTC.getTime() - (ahoraUTC.getTimezoneOffset() + 300) * 60000;


        // ✅ Calculamos la diferencia en milisegundos
        const diferencia = fechaObj - ahoraColombia;

        // ✅ Si la fecha ya pasó
        if (diferencia <= 0) {
            clearInterval(intervalo);
            contador.innerHTML = `
                <div style="color:#00ffea; font-family:'Orbitron', sans-serif; font-size:1.5em; text-align:center;">
                    🚀 ¡El mensaje ya está disponible! 🚀
                </div>`;
            location.reload();
            return;
        }

        // ✅ Calculamos días, horas, minutos y segundos
        const dias = String(Math.floor(diferencia / (1000 * 60 * 60 * 24))).padStart(2, '0');
        const horas = String(Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        const minutos = String(Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const segundos = String(Math.floor((diferencia % (1000 * 60)) / 1000)).padStart(2, '0');

        // ✅ Actualizamos el DOM
        document.getElementById('dias').textContent = dias;
        document.getElementById('horas').textContent = horas;
        document.getElementById('minutos').textContent = minutos;
        document.getElementById('segundos').textContent = segundos;

        // ✅ Efecto “glitch” aleatorio
        const unidades = ['dias', 'horas', 'minutos', 'segundos'];
        const aleatorio = unidades[Math.floor(Math.random() * unidades.length)];
        const elem = document.getElementById(aleatorio);
        elem.style.transform = `translateX(${Math.random() * 4 - 2}px) translateY(${Math.random() * 4 - 2}px)`;
        setTimeout(() => { elem.style.transform = 'translate(0,0)'; }, 100);

    }, 1000);
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
        mostrarPantallaFinal();
        return;
    }

    const grupo = groupedMessages[index];
    const container = document.querySelector(".card");
    const esUltimoGrupo = index === groupedMessages.length - 1;

    // Si es la primera vez → creamos la estructura base con reproductor
    if (!document.getElementById("contenedorMensajes")) {
        container.innerHTML = `
            <h3 class="text-primary text-center mb-3">📩 Detalles del mensaje</h3>
            <hr>
            <div class="d-flex justify-content-end">
                <div class="banner-preview neon-pulse" id="bannerPreview">
                    <div class="d-flex align-items-center justify-content-center gap-2">
                        <span id="usernameDisplay">Anonimo</span>
                        <a id="facebookLinkPreview" href="https://facebook.com/tuUsuario" target="_blank"
                            class="text-white">
                            <i class="fab fa-facebook fa-lg"></i>
                        </a>
                        <a id="instagramLinkPreview" href="https://instagram.com/tuUsuario" target="_blank"
                            class="text-white">
                            <i class="fab fa-instagram fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>
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
                    src="${messageLinkSong || DEFAULT_EMBED_SONG}"
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

    const contenedorMensajes = document.getElementById("contenedorMensajes");
    contenedorMensajes.innerHTML = "";

    const botonContainer = document.getElementById("botonSiguienteContainer");
    const botonSiguiente = document.getElementById("botonSiguiente");
    const contador = document.getElementById("contadorGrupos");
    contador.textContent = `Mostrando grupo ${index + 1} de ${groupedMessages.length}`;

    // Ordenar mensajes por prioridad
    const titulo = grupo.find(msg => msg.priority === 1);
    const mensajesPrincipales = grupo.filter(msg => msg.priority === 2);
    const pie = grupo.find(msg => msg.priority === 3);

    const mensajesOrdenados = [];
    if (titulo) mensajesOrdenados.push(titulo);
    mensajesOrdenados.push(...mensajesPrincipales);
    if (pie) mensajesOrdenados.push(pie);

    let mensajesCompletados = 0;
    let mensajesOcultos = 0;
    poblaBaner(datosBanerUsuario);
    mensajesOrdenados.forEach((msg, idx) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = "p-3 mb-3 rounded-3 shadow-sm opacity-0";

        // 🎨 Fondo del div (gradiente o color sólido)
        if (msg.background_color && msg.background_color2) {
            msgDiv.style.background = `linear-gradient(135deg, ${msg.background_color}, ${msg.background_color2})`;
        } else {
            msgDiv.style.backgroundColor = msg.background_color || "transparent";
        }

        // Fuente y transición
        msgDiv.style.fontFamily = msg.font_family;
        msgDiv.style.fontSize = `${msg.font_size}px`;
        msgDiv.style.transition = "opacity 0.5s ease-in-out";

        // Contenedor de texto
        const textoElemento = document.createElement("div");
        textoElemento.className = "mensaje-texto";

        // 🎨 Texto (gradiente o color sólido)
        if (msg.text_color && msg.text_color2) {
            textoElemento.style.background = `linear-gradient(135deg, ${msg.text_color}, ${msg.text_color2})`;
            textoElemento.style.webkitBackgroundClip = "text";
            textoElemento.style.webkitTextFillColor = "transparent";
        } else {
            textoElemento.style.color = msg.text_color || "#000000";
        }

        msgDiv.appendChild(textoElemento);
        contenedorMensajes.appendChild(msgDiv);

        // Animación máquina de escribir
        setTimeout(() => {
            msgDiv.classList.remove("opacity-0");
            escribirTexto(textoElemento, msg.detail, 35, () => {
                mensajesCompletados++;

                if (mensajesCompletados === mensajesOrdenados.length) {
                    if (!esUltimoGrupo) {
                        botonContainer.classList.remove("d-none");
                    } else {
                        botonContainer.classList.add("d-none");
                    }
                }

                setTimeout(() => {
                    msgDiv.style.opacity = "0";
                    setTimeout(() => {
                        msgDiv.style.display = "none";
                        mensajesOcultos++;

                        if (esUltimoGrupo && mensajesOcultos === mensajesOrdenados.length) {
                            mostrarPantallaFinal();
                        }
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

function mostrarPantallaFinal() {
    const container = document.querySelector(".card");
    container.innerHTML = `
        <div class="message-finished">
            <div class="finished-mark">
                <i class="fa-solid fa-check"></i>
            </div>
            <h3>Mensaje completo</h3>
            <p>Gracias por ver todo el mensaje. Ahora puedes dejar tu reaccion.</p>
            <div id="reaccionesFinales"></div>
        </div>
    `;

    agregarReacciones(document.getElementById("reaccionesFinales"));
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
        fetch(`/api/message/${encodedId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    modal.hide();
                    currentMessageHash = messageId;
                    currentReactions = normalizarReacciones(result.content.reactions);
                    datosBanerUsuario = result.content.banerUser;
                    messageLinkSong = result.content.message.link_song;
                    actualizarVistaConMensaje(result.content.message, result.content.messagedetails, result.content.banerUser, result.vistasRestantes);
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
function actualizarVistaConMensaje(message, messagedetails, banerUser, vistasRestantes) {
    messageDetails = messagedetails;
    groupedMessages = agruparPorPosition(messageDetails);
    datosBanerUsuario = banerUser;

    document.getElementById('messageTitle').textContent = message.title;
    document.getElementById('vistasRestantes').textContent = vistasRestantes;
    document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";
    poblaBaner(banerUser);

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

    configurarBotonDetalles(true);
}
function habilitarAudioEnIOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Mostrar botón de play solo en iPhone/iPad
    const btnPlay = document.createElement("button");
    btnPlay.textContent = "▶️ Reproducir música";
    btnPlay.className = "btn btn-primary mt-3";
    btnPlay.onclick = () => {
        const player = document.getElementById("youtubePlayer");
        player.src += "&autoplay=1"; // Forzar autoplay después del toque
        btnPlay.remove(); // ocultar botón
    };

    document.querySelector("#reproductorYoutubeContainer")?.appendChild(btnPlay);
}


function normalizarReacciones(reactions) {
    const counts = {
        like: 0,
        love: 0,
        smile: 0,
        clap: 0,
        star: 0
    };

    return {
        counts: { ...counts, ...(reactions?.counts || {}) },
        selectedReaction: reactions?.selectedReaction || null
    };
}

async function cargarReacciones() {
    if (!currentMessageHash) return normalizarReacciones(currentReactions);

    const encodedId = encodeURIComponent(currentMessageHash);
    const response = await fetch(`/api/message/${encodedId}/reactions`);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudieron cargar las reacciones");
    }

    currentReactions = normalizarReacciones(data.reactions);
    return currentReactions;
}

function pintarReacciones(reactionsDiv) {
    const reactions = normalizarReacciones(currentReactions);

    reactionsDiv.querySelectorAll(".reaction-button").forEach(button => {
        const reactionType = button.dataset.reactionType;
        const total = reactions.counts[reactionType] || 0;
        const count = button.querySelector(".reaction-count");

        button.classList.toggle("active", reactions.selectedReaction === reactionType);
        if (count) count.textContent = total;
    });
}

async function guardarReaccion(reactionType, button, reactionsDiv) {
    if (!currentMessageHash) return;

    const encodedId = encodeURIComponent(currentMessageHash);
    const wasActive = button.classList.contains("active");
    const method = wasActive ? "DELETE" : "POST";
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (!wasActive) {
        const viewerName = document.getElementById("reactionViewerName")?.value || "";
        const comment = document.getElementById("reactionComment")?.value || "";

        options.body = JSON.stringify({
            reactionType,
            viewerName,
            comment
        });
    }

    button.disabled = true;

    try {
        const response = await fetch(`/api/message/${encodedId}/reactions`, options);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "No se pudo guardar la reaccion");
        }

        currentReactions = normalizarReacciones(data.reactions);
        pintarReacciones(reactionsDiv);
    } catch (error) {
        console.error(error);
        mensajeNoDisponible(error.message || "Error al guardar la reaccion");
    } finally {
        button.disabled = false;
    }
}

function agregarReacciones(container) {
    const reactionForm = document.createElement("div");
    reactionForm.className = "reaction-form";
    reactionForm.innerHTML = `
        <input
            id="reactionViewerName"
            class="reaction-input"
            type="text"
            maxlength="120"
            placeholder="Tu nombre (opcional)"
            autocomplete="name"
        >
        <textarea
            id="reactionComment"
            class="reaction-textarea"
            maxlength="1000"
            rows="3"
            placeholder="Comentario (opcional)"
        ></textarea>
    `;

    const reactionsDiv = document.createElement("div");
    reactionsDiv.className = "reactions";

    const reacciones = [
        { type: "like", icon: "fa-thumbs-up", label: "Me gusta" },
        { type: "love", icon: "fa-heart", label: "Me encanta" },
        { type: "smile", icon: "fa-face-smile", label: "Sonrisa" },
        { type: "clap", icon: "fa-hands-clapping", label: "Aplausos" },
        { type: "star", icon: "fa-star", label: "Especial" }
    ];

    reacciones.forEach(reaccion => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "reaction-button";
        button.dataset.reactionType = reaccion.type;
        button.innerHTML = `
            <i class="fa-solid ${reaccion.icon}"></i>
            <span>${reaccion.label}</span>
            <strong class="reaction-count">0</strong>
        `;

        button.onclick = () => {
            guardarReaccion(reaccion.type, button, reactionsDiv);
        };

        reactionsDiv.appendChild(button);
    });

    container.appendChild(reactionForm);
    container.appendChild(reactionsDiv);
    pintarReacciones(reactionsDiv);

    cargarReacciones()
        .then(() => pintarReacciones(reactionsDiv))
        .catch(error => console.error(error));
}






// Ejecutar al cargar la página
cargarMensaje();
habilitarAudioEnIOS();
