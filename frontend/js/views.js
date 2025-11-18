let messageDetails = [];    // Mensajes completos
let groupedMessages = [];     // Mensajes agrupados por position
let currentGroupIndex = 0;    // Índice del grupo actual
let datosBanerUsuario;
let autoTimeout = null;
let messageLinkSong = null;

function cargarMensaje() {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');


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

            const { message, messagedetails, banerUser } = data.content;
            messageLinkSong = message.link_song;
            datosBanerUsuario = banerUser;
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

            document.getElementById("btnVerDetalles").addEventListener("click", () => {
                currentGroupIndex = 0;
                mostrarGrupo(currentGroupIndex);
            });
        })
        .catch(err => {
            console.error(err);
            mensajeNoDisponible("Error al cargar el mensaje");
        });
}

function poblaBaner(datosBaner) {
    console.log("🚀 ~ poblaBaner ~ datosBaner:", datosBaner)

    if (datosBaner) {

        document.getElementById('usernameDisplay').textContent = datosBaner.username_public || "Anonimo";
        const facebookPreview = document.getElementById('facebookLinkPreview');
        const instagramPreview = document.getElementById('instagramLinkPreview');

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
        const container = document.querySelector(".card");
        container.innerHTML = `
            <div class="alert alert-success text-center rounded-4 p-4">
                🎉 ¡Has visto todo el total del mensaje!
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
                    botonContainer.classList.remove("d-none");

                    // 👇 Bloque de reacciones con gris + dorado
                    // Agregar reacciones solo si estamos en el último grupo
                    if (index === groupedMessages.length - 1) {
                        agregarReacciones(contenedorMensajes, "gray-gold");
                    }
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
        fetch(`/api/message/${encodedId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    modal.hide();
                    actualizarVistaConMensaje(result.content.message, result.content.messagedetails, result.vistasRestantes);
                    messageLinkSong = result.content.message.link_song;
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


function agregarReacciones(container, theme = "gray-gold") {
    const reactionsDiv = document.createElement("div");
    reactionsDiv.className = "reactions mt-3 d-flex gap-4 justify-content-center";

    const emotes = ["👍", "❤️", "😂", "👏", "🔥"];

    emotes.forEach(emote => {
        const span = document.createElement("span");
        span.className = `reaction-emote ${theme}`;
        span.textContent = emote;

        span.onclick = () => {
            span.classList.toggle("active");
        };

        reactionsDiv.appendChild(span);
    });

    container.appendChild(reactionsDiv);
}






// Ejecutar al cargar la página
cargarMensaje();
habilitarAudioEnIOS();
