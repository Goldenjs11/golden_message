const usernameInput = document.getElementById("username");
const usernameDisplay = document.getElementById("usernameDisplay");
const bannerPreview = document.getElementById("bannerPreview");
const bannerBg1 = document.getElementById("bannerBg1");
const bannerBg2 = document.getElementById("bannerBg2");
const bannerText1 = document.getElementById("bannerText1");
const bannerText2 = document.getElementById("bannerText2");
const avatarInitial = document.getElementById("avatarInitial");
const shareBadge = document.getElementById("shareStatusBadge");
const shareSelect = document.getElementById("username_public_share");
let idUsuarioA;
let usuario;


// 📌 Guardamos los datos del usuario original
let usuarioOriginal = {};

document.addEventListener("DOMContentLoaded", async () => {
  cargarUsuarioDesdeSessionStorage();
  datosUsuario();
  actualizarAvatar();
  actualizarBadge();
});

async function datosUsuario() {
  if (!idUsuarioA) {
    console.error("No se encontró el ID del usuario en sessionStorage.");
    return;
  }
  try {
    const response = await fetch(`/api/user/${idUsuarioA}`);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    usuario = data.user[0]; // ✅ Obtenemos solo el objeto de usuario


    if (usuario) {
      cargarDatosEditarMenssage(usuario);
    }

  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
}

function cargarDatosEditarMenssage(usuario) {
  // ✅ Llenamos los inputs con la info del usuario
  document.getElementById('username').value = usuario.username_public || '';
  document.getElementById('name').value = usuario.name || '';
  document.getElementById('last_name').value = usuario.last_name || '';
  document.getElementById('email').value = usuario.email || '';
  document.getElementById('telefono').value = usuario.telefono || '';
  document.getElementById('facebook_link').value = usuario.facebook_link || '';
  document.getElementById('instagram_link').value = usuario.instagram_link || '';
  document.getElementById('username_public_share').value = usuario.username_public_share || '';

  // ✅ Cargamos los colores guardados del banner (o los valores por defecto de los inputs)
  bannerBg1.value = usuario.banner_bg1 || bannerBg1.value;
  bannerBg2.value = usuario.banner_bg2 || bannerBg2.value;
  bannerText1.value = usuario.banner_text1 || bannerText1.value;
  bannerText2.value = usuario.banner_text2 || bannerText2.value;

  bannerPreview.style.background = `linear-gradient(45deg, ${bannerBg1.value}, ${bannerBg2.value})`;
  usernameDisplay.style.background = `linear-gradient(45deg, ${bannerText1.value}, ${bannerText2.value})`;
  usernameDisplay.style.webkitBackgroundClip = "text";
  usernameDisplay.style.webkitTextFillColor = "transparent";

  // ✅ Mostramos el nombre del usuario en el banner
  usernameDisplay.textContent = usuario.username_public || "Usuario";
  // ✅ Actualizamos los enlaces del banner
  const facebookPreview = document.getElementById('facebookLinkPreview');
  const instagramPreview = document.getElementById('instagramLinkPreview');

  if (usuario.facebook_link) {
    facebookPreview.setAttribute("href", normalizarUrl(usuario.facebook_link));
    facebookPreview.style.display = "inline-block";
  } else {
    facebookPreview.style.display = "none";
  }

  if (usuario.instagram_link) {
    instagramPreview.setAttribute("href", normalizarUrl(usuario.instagram_link));
    instagramPreview.style.display = "inline-block";
  } else {
    instagramPreview.style.display = "none";
  }

    // 📌 Guardamos copia de datos originales
  usuarioOriginal = { ...usuario };

  // ✅ Sincronizamos avatar y badge con los datos ya cargados
  actualizarAvatar();
  actualizarBadge();
}

function normalizarUrl(url) {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

// ✅ Inicial del avatar a partir del nombre público de usuario
function actualizarAvatar() {
  if (!avatarInitial) return;
  const valor = (usernameInput.value || "").trim();
  avatarInitial.textContent = valor ? valor.charAt(0).toUpperCase() : "U";
}

// ✅ Estado del badge "compartir perfil"
function actualizarBadge() {
  if (!shareBadge || !shareSelect) return;
  const activo = shareSelect.value === "true";
  shareBadge.textContent = activo ? "Activo" : "Inactivo";
  shareBadge.classList.toggle("is-active", activo);
}

// ✅ Cambiar nombre en vivo cuando el usuario edite el input
usernameInput.addEventListener("input", () => {
  usernameDisplay.textContent = usernameInput.value || "Usuario";
  actualizarAvatar();
});

shareSelect?.addEventListener("change", actualizarBadge);

// ✅ Cambiar colores en vivo
// ✅ Escuchar cambios en los colores del fondo
[bannerBg1, bannerBg2].forEach(input => {
  input.addEventListener("input", () => {
    bannerPreview.style.background = `linear-gradient(45deg, ${bannerBg1.value}, ${bannerBg2.value})`;
  });
});
[bannerText1, bannerText2].forEach(input => {
  input.addEventListener("input", () => {
    usernameDisplay.style.background = `linear-gradient(45deg, ${bannerText1.value}, ${bannerText2.value})`;
    usernameDisplay.style.webkitBackgroundClip = "text";
    usernameDisplay.style.webkitTextFillColor = "transparent";
  });
});

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



// 📌 Función para detectar cambios y enviarlos
async function guardarCambios() {
  if (!usuarioOriginal) return;

  const nuevosDatos = {
    username_public: document.getElementById('username').value.trim(),
    name: document.getElementById('name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    facebook_link: document.getElementById('facebook_link').value.trim(),
    instagram_link: document.getElementById('instagram_link').value.trim(),
    username_public_share: document.getElementById('username_public_share').value,
    banner_bg1: bannerBg1.value,
    banner_bg2: bannerBg2.value,
    banner_text1: bannerText1.value,
    banner_text2: bannerText2.value
  };


    // ✅ Validación de enlaces
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

  if (nuevosDatos.facebook_link && !urlRegex.test(nuevosDatos.facebook_link)) {
    mostrarAlerta("⚠️ El enlace de Facebook no es válido", "warning");
    return;
  }

  if (nuevosDatos.instagram_link && !urlRegex.test(nuevosDatos.instagram_link)) {
    mostrarAlerta("⚠️ El enlace de Instagram no es válido", "warning");
    return;
  }

  // ✅ Comparar con original
  let cambios = {};
  for (let key in nuevosDatos) {
    if (nuevosDatos[key] !== (usuarioOriginal[key] || "")) {
      cambios[key] = nuevosDatos[key];
    }
  }

  if (Object.keys(cambios).length === 0) {
    console.log("⚠️ No hay cambios para guardar.");
    return;
  }

  try {
    const response = await fetch(`/api/user/${idUsuarioA}`, {
      method: "PUT", // o PATCH según tu backend
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
     mostrarAlerta("Perfil actualizado correctamente ✅", "success");

    // 🔄 Actualizar snapshot original
    usuarioOriginal = { ...usuarioOriginal, ...cambios };

  } catch (error) {
    mostrarAlerta("Error al guardar cambios ❌", "danger");
  }
}

// 📌 Escuchar el submit del formulario
document.getElementById("formPerfil").addEventListener("submit", (e) => {
  e.preventDefault();
  guardarCambios();
});

function mostrarAlerta(mensaje, tipo = "success", tiempo = 3000) {
  const alertContainer = document.getElementById("alertContainer");

  alertContainer.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // ⏳ Eliminar automáticamente después de unos segundos
  setTimeout(() => {
    const alerta = alertContainer.querySelector(".alert");
    if (alerta) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alerta);
      bsAlert.close();
    }
  }, tiempo);
}