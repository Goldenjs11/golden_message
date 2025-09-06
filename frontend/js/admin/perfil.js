const usernameInput = document.getElementById("username");
const usernameDisplay = document.getElementById("usernameDisplay");
const bannerPreview = document.getElementById("bannerPreview");
const bannerBg = document.getElementById("bannerBg");
const bannerText = document.getElementById("bannerText");
let idUsuarioA;
let usuario;

document.addEventListener("DOMContentLoaded", async () => {
  cargarUsuarioDesdeSessionStorage();
  datosUsuario();
});

async function datosUsuario() {
  if (!idUsuarioA) {
    console.error("No se encontró el ID del usuario en sessionStorage.");
    return;
  }
  try {
    const response = await fetch(`/api/user/${idUsuarioA}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    usuario = data.user[0]; // ✅ Obtenemos solo el objeto de usuario

    console.log("🚀 ~ usuario:", usuario);

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


}

function normalizarUrl(url) {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}


// ✅ Cambiar nombre en vivo cuando el usuario edite el input
usernameInput.addEventListener("input", () => {
  usernameDisplay.textContent = usernameInput.value || "Usuario";
});

// ✅ Cambiar colores en vivo
bannerBg.addEventListener("input", () => {
  bannerPreview.style.setProperty("--banner-bg", bannerBg.value);
});
bannerText.addEventListener("input", () => {
  bannerPreview.style.setProperty("--banner-text", bannerText.value);
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
