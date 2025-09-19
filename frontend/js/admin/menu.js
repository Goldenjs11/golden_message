let idUsuarioA = null;
let messagesd = {};
let filteredCatalogoMessages = [];
let currentGroupIndex = 0;
let groupedMessages = [];
let messageLinkSong = null;



document.addEventListener("DOMContentLoaded", async () => {
  cargarUsuarioDesdeSessionStorage();
  const infoUsuario = JSON.parse(sessionStorage.getItem('infoUsuario'));
  const permisos = JSON.parse(sessionStorage.getItem('permisos'));
  if (!infoUsuario) {
    window.location.href = "/"; // Redirigir al login si no hay info de usuario
    return;
  }
  if (!idUsuarioA) {
    console.error("No se encontró el ID del usuario en sessionStorage.");
    return;
  }

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuario: idUsuarioA, messageCompleto: true })
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    messagesd = await response.json();
    console.log("🚀 ~ messagesd:", messagesd)
    filteredCatalogoMessages = messagesd.messages || [];

    // Cargar la primera página
    renderMessages()

  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }


  if (!permisos || permisos.length === 0) {
    window.location.href = "/"; // Redirigir al login si no hay permisos
    return;
  }
  generarMenuLateral(permisos);


});


function generarMenuLateral(permisos) {
  const menuLateral = document.getElementById("menuLateral");
  menuLateral.innerHTML = ""; // limpiar antes de renderizar

  permisos.forEach(item => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = `
      <a href="${item.ruta}">
        <i class="fa-solid ${item.icono}"></i> ${item.nombre}
      </a>
    `;
    menuLateral.appendChild(li);
  });
}


// === Datos demo (sustituye por tu API) ===
const contacts = [
  { id: 1, name: 'Carolina', subtitle: 'Le dejó un mensaje de audio', color: '#ffd166' },
  { id: 2, name: 'Miguel', subtitle: 'Compartió un mensaje privado', color: '#00e5c4' },
  { id: 3, name: 'Paula', subtitle: 'Mensaje programado para hoy', color: '#a78bfa' },
  { id: 4, name: 'Equipo', subtitle: 'Notificación del sistema', color: '#60a5fa' },
];



const contactsList = document.getElementById('contactsList');
const messagesList = document.getElementById('messagesList');
const viewer = document.getElementById('viewer');
const viewerTitle = document.getElementById('viewerTitle');
const viewerSubtitle = document.getElementById('viewerSubtitle');
const qrImage = document.getElementById('qrImage');
const bannerMini = document.getElementById('bannerMini');

// ✅ Renderizar lista de contactos
function renderContacts() {
  contactsList.innerHTML = '';
  contacts.forEach(c => {
    const el = document.createElement('div');
    el.className = 'contact';

    el.innerHTML = `
      <div class="avatar" style="background:${c.color}">
        ${c.name.slice(0, 2).toUpperCase()}
      </div>
      <div class="meta">
        <strong>${c.name}</strong>
        <small>${c.subtitle}</small>
      </div>
      <div class="arrow">›</div>
    `;

    el.onclick = () => openContact(c);
    contactsList.appendChild(el);
  });
}

// ✅ Renderizar lista de mensajes desde backend (manteniendo time y compartido)
function renderMessages() {
  messagesList.innerHTML = '';

  if (!filteredCatalogoMessages || filteredCatalogoMessages.length === 0) {
    messagesList.innerHTML = `
      <div class="alert alert-info text-center">
        No tienes mensajes aún 📭
      </div>
    `;
    return;
  }
// Dentro de renderMessages()
filteredCatalogoMessages.forEach(m => {
  const fecha = m.created_at ? timeAgo(m.created_at) : 'hoy';

  const el = document.createElement('div');
  el.className = 'card-msg';
  el.setAttribute("data-id-message", m.id); // clave para observer

  el.innerHTML = `
    <div class="left"></div>
    <div class="body">
      <h4>${m.title}</h4>
      <div id="message-${m.id}"></div>
      <p>${m.preview || 'Sin descripción'}</p>
      <small class="badge ${m.compartido ? 'bg-success' : 'bg-secondary'}">
        ${m.compartido ? 'Compartido' : 'Privado'}
      </small>
    </div>
    <div class="time">${fecha}</div>
  `;

  el.onclick = () => openMessage(m);
  messagesList.appendChild(el);

  // Guardamos los detalles para usarlos en el observer
  el.dataset.details = JSON.stringify(m.details);
  el.dataset.linkSong = m.link_song || "";
});

// Al final de renderMessages()
activarObserver();


}


let lastActiveId = null;
let observer = null;

function activarObserver() {
  if (observer) observer.disconnect(); // limpiar si ya existe

  const options = {
    root: null, 
    threshold: 0.1 // basta con un poco de visibilidad
  };

  observer = new IntersectionObserver((entries) => {
    // Filtrar solo los visibles
    const visibles = entries.filter(e => e.isIntersecting);

    if (visibles.length === 0) return;

    // Calcular cuál está más cerca del centro de la pantalla
    let centroPantalla = window.innerHeight / 2;
    let masCercano = visibles.reduce((prev, curr) => {
      const rect = curr.target.getBoundingClientRect();
      const centroCard = rect.top + rect.height / 2;
      const distancia = Math.abs(centroPantalla - centroCard);

      const rectPrev = prev.target.getBoundingClientRect();
      const centroPrev = rectPrev.top + rectPrev.height / 2;
      const distanciaPrev = Math.abs(centroPantalla - centroPrev);

      return distancia < distanciaPrev ? curr : prev;
    });

    const card = masCercano.target;
    const idMessage = card.getAttribute("data-id-message");

    // Si ya está activo, no repetir
    if (lastActiveId === idMessage) return;

    // 👉 Limpiar mensaje anterior
    if (lastActiveId) {
      const oldContainer = document.getElementById(`contenedorMensajes-${lastActiveId}`);
      if (oldContainer) oldContainer.innerHTML = "";
      const oldIframe = document.getElementById(`youtubePlayer-${lastActiveId}`);
      if (oldIframe) oldIframe.src = ""; // parar video
    }

    lastActiveId = idMessage;

    const details = JSON.parse(card.dataset.details);
    const linkSong = card.dataset.linkSong;

    currentGroupIndex = 0;
    mostrarGrupo(details, currentGroupIndex, idMessage, linkSong);
  }, options);

  document.querySelectorAll('.card-msg').forEach(card => observer.observe(card));
}



function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // diferencia en segundos

  if (diff < 60) return "hace unos segundos";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "ayer";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}




// ✅ Abrir contacto
function openContact(c) {
  viewerTitle.textContent = c.name;
  viewerSubtitle.textContent = c.subtitle;

  viewer.innerHTML = `
    <div class="viewer-info">
      <p>
        Aquí podrás ver los mensajes entre tú y 
        <strong>${c.name}</strong>. 
        Prueba hacer clic en un mensaje para previsualizarlo.
      </p>
    </div>
  `;

  bannerMini.querySelector('div').textContent = c.name;
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/m/${c.id}`;
}

// ✅ Abrir mensaje
function openMessage(m) {
  viewerTitle.textContent = m.title;
  viewerSubtitle.textContent = `${m.owner} • ${m.time}`;

  viewer.innerHTML = `
    <div class="message-viewer" style="background:linear-gradient(135deg, ${m.bg1}, ${m.bg2})">
      <h3>${m.title}</h3>
      <p>${m.preview}</p>
      <small>Este es el contenido del mensaje — puedes aplicar animaciones, temporizadores y reglas de acceso.</small>
    </div>
  `;

  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/message/${m.id}`;
}

// ✅ Crear nuevo mensaje
function nuevoMensaje() {
  window.location.href = '/admin/creacionmensajes';
}


// Inicializar
renderContacts(); renderMessages();

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



/* Funcion Mostrar Mensajes */
function mostrarGrupo(messageDetails, index, idMessage, messageLinkSong) {
  groupedMessages = agruparPorPosition(messageDetails);

  // 👉 Si llegamos al final de los grupos → reiniciamos en 0 después de un pequeño delay
  if (index >= groupedMessages.length) {
    currentGroupIndex = 0;
    setTimeout(() => {
      mostrarGrupo(messageDetails, currentGroupIndex, idMessage, messageLinkSong);
    }, 1000); // 1 segundo de pausa antes de repetir todo
    return;
  }

  const grupo = groupedMessages[index];
  const container = document.getElementById(`message-${idMessage}`);

  // Si es la primera vez → creamos la estructura base con IDs únicos
  if (!document.getElementById(`contenedorMensajes-${idMessage}`)) {
    container.innerHTML = `
      <h3 class="text-primary text-center mb-3">📩 Detalles del mensaje</h3>
      <hr>
      <div id="contenedorMensajes-${idMessage}"></div>

      <!-- Reproductor de YouTube -->
      <div id="reproductorYoutubeContainer-${idMessage}" class="text-center mt-4">
          <iframe id="youtubePlayer-${idMessage}"
              width="100%" height="80"
              src="${messageLinkSong ? messageLinkSong : "https://www.youtube.com/embed/MATmOn-Nk5Y?autoplay=1&mute=0&loop=1&playlist=MATmOn-Nk5Y&controls=1&modestbranding=1&rel=0"}"
              title="Reproductor YouTube"
              frameborder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen>
          </iframe>
      </div>

      <div class="text-center mt-2 text-muted">
          <small id="contadorGrupos-${idMessage}"></small>
      </div>
    `;
  }

  const contenedorMensajes = document.getElementById(`contenedorMensajes-${idMessage}`);
  contenedorMensajes.innerHTML = "";

  const contador = document.getElementById(`contadorGrupos-${idMessage}`);
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

        setTimeout(() => {
          msgDiv.style.opacity = "0";
          setTimeout(() => {
            msgDiv.style.display = "none";

            // 👉 Cuando todos los mensajes de este grupo terminan, pasamos al siguiente automáticamente
            if (mensajesCompletados === mensajesOrdenados.length) {
              currentGroupIndex = index + 1;
              setTimeout(() => {
                mostrarGrupo(messageDetails, currentGroupIndex, idMessage, messageLinkSong);
              }, 500); // medio segundo antes de avanzar
            }

          }, 500);
        }, msg.display_time * 1000);
      });
    }, idx * 300);
  });
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