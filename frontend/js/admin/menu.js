

document.addEventListener("DOMContentLoaded", async () => {
    const infoUsuario = JSON.parse(sessionStorage.getItem('infoUsuario'));
    const permisos = JSON.parse(sessionStorage.getItem('permisos'));
    if (!infoUsuario) {
        window.location.href = "/"; // Redirigir al login si no hay info de usuario
        return;
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
      {id:1,name:'Carolina', subtitle:'Le dejó un mensaje de audio', color:'#ffd166'},
      {id:2,name:'Miguel', subtitle:'Compartió un mensaje privado', color:'#00e5c4'},
      {id:3,name:'Paula', subtitle:'Mensaje programado para hoy', color:'#a78bfa'},
      {id:4,name:'Equipo', subtitle:'Notificación del sistema', color:'#60a5fa'},
    ];

    const messages = [
      {id:101,title:'Feliz cumpleaños 🎉', preview:'¡Que este nuevo año esté lleno de éxitos y salud!', time:'hoy 09:30', owner:'Carolina', bg1:'#ffecd2', bg2:'#fcb69f'},
      {id:102,title:'Reunión agendada', preview:'Confirmado: reunión el martes 3pm.', time:'ayer 16:10', owner:'Miguel', bg1:'#d5fbe1', bg2:'#bfe9e0'},
      {id:103,title:'Promoción especial', preview:'Solo por hoy 50% en productos seleccionados.', time:'2 días', owner:'Paula', bg1:'#e6e9ff', bg2:'#d6ccff'},
    ];

    const contactsList = document.getElementById('contactsList');
    const messagesList = document.getElementById('messagesList');
    const viewer = document.getElementById('viewer');
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerSubtitle = document.getElementById('viewerSubtitle');
    const qrImage = document.getElementById('qrImage');
    const bannerMini = document.getElementById('bannerMini');

    function renderContacts(){
      contactsList.innerHTML = '';
      contacts.forEach(c=>{
        const el = document.createElement('div'); el.className='contact';
        el.innerHTML = `<div class='avatar' style='background:${c.color}'>${c.name.slice(0,2).toUpperCase()}</div>
                        <div class='meta'><strong>${c.name}</strong><small>${c.subtitle}</small></div>
                        <div style='font-size:12px;color:var(--muted)'>›</div>`;
        el.onclick = ()=>{openContact(c)};
        contactsList.appendChild(el);
      })
    }

    function renderMessages(){
      messagesList.innerHTML='';
      messages.forEach(m=>{
        const el = document.createElement('div'); el.className='card-msg';
        el.innerHTML = `<div class='left'></div><div class='body'><h4>${m.title}</h4><p>${m.preview}</p></div><div style='text-align:right;color:var(--muted);font-size:12px'>${m.time}</div>`;
        el.onclick = ()=>openMessage(m);
        messagesList.appendChild(el);
      })
    }

    function openContact(c){
      viewerTitle.textContent = c.name;
      viewerSubtitle.textContent = c.subtitle;
      viewer.innerHTML = `<div style='padding:12px;border-radius:8px;background:linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))'><p style='margin:0;color:var(--muted)'>Aquí podrás ver los mensajes entre tú y <strong>${c.name}</strong>. Prueba hacer clic en un mensaje para previsualizarlo.</p></div>`;
      bannerMini.querySelector('div').textContent = c.name;
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/m/${c.id}`;
    }

    function openMessage(m){
      viewerTitle.textContent = m.title;
      viewerSubtitle.textContent = m.owner + ' • ' + m.time;
      viewer.innerHTML = `<div style='padding:18px;border-radius:10px;background:linear-gradient(135deg, ${m.bg1}, ${m.bg2});color:#07212a'><h3 style='margin-top:0;margin-bottom:6px'>${m.title}</h3><p style='margin:0 0 12px 0;font-size:15px;color:#012'>${m.preview}</p><small style='color:rgba(1,1,1,0.6)'>Este es el contenido del mensaje — puedes aplicar animaciones, temporizadores y reglas de acceso (vistas limitadas, contraseña, etc.).</small></div>`;
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/message/${m.id}`;
    }

    function nuevoMensaje(){
      viewerTitle.textContent = 'Crear mensaje';
      viewerSubtitle.textContent = 'Rápido — privado — programable';
      viewer.innerHTML = `<div style='display:flex;flex-direction:column;gap:8px'><input placeholder='Título' style='padding:10px;border-radius:8px;border:0;'><textarea placeholder='Escribe tu mensaje...' style='min-height:120px;padding:12px;border-radius:8px;border:0;'></textarea><div style='display:flex;gap:8px'><button class='cta' onclick='alert(\'Mensaje creado (demo)\')'>Crear</button><button style='padding:10px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.03)'>Cancelar</button></div></div>`;
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://golden-message.app/new`;
    }

    // Inicializar
    renderContacts(); renderMessages();