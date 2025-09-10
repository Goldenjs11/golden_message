

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