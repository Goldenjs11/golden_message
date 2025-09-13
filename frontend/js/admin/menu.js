let idUsuarioA = null;
let messagesd = {};
let filteredCatalogoMessages = [];

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
      body: JSON.stringify({ idUsuario: idUsuarioA })
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    messagesd = await response.json();
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

  filteredCatalogoMessages.forEach(m => {
    const fecha = m.created_at ? timeAgo(m.created_at) : 'hoy';

    const el = document.createElement('div');
    el.className = 'card-msg';

    el.innerHTML = `
    <div class="left"></div>
    <div class="body">
      <h4>${m.title}</h4>
      <p>${m.preview || 'Sin descripción'}</p>
      <small class="badge ${m.compartido ? 'bg-success' : 'bg-secondary'}">
        ${m.compartido ? 'Compartido' : 'Privado'}
      </small>
    </div>
    <div class="time">${fecha}</div>
  `;

    el.onclick = () => openMessage(m);
    messagesList.appendChild(el);
  });

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

// Ejemplo:
console.log(timeAgo('2025-09-07T03:50:51.111Z'));


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
  viewerTitle.textContent = 'Crear mensaje';
  viewerSubtitle.textContent = 'Rápido — privado — programable';

  viewer.innerHTML = `
    <div class="new-message">
      <input placeholder="Título" class="input-title">
      <textarea placeholder="Escribe tu mensaje..." class="input-message"></textarea>
      <div class="actions">
        <button class="cta" onclick="alert('Mensaje creado (demo)')">Crear</button>
        <button class="cancel">Cancelar</button>
      </div>
    </div>
  `;

  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/new`;
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