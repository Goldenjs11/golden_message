

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
    generarMenu(permisos);
});

    



function generarMenu(permisos) {


    if (!Array.isArray(permisos) || permisos.length === 0) {
        console.error("Error: 'permisos' no es un array válido o está vacío.");
        return;
    }

     permisos.sort((a, b) => a.id - b.id);



    const menu = document.getElementById("menu");
    if (!menu) {
        console.error("Error: No se encontró el elemento con ID 'primer-pantalla'.");
        return;
    }


    // Generar dinámicamente las cards
    permisos.forEach(item => {
        const cardHTML = `
            <div class="col-md-4">
                <div class="card dashboard-card text-center">
                    <div class="card-body">
                        <i class="fa-solid ${item.icono} fa-3x text-${item.color} mb-3"></i>
                        <h5 class="card-title">${item.nombre}</h5>
                        <p class="card-text text-muted">${item.contenido}</p>
                        <a href="${item.ruta}" class="btn btn-${item.color}">${item.boton}</a>
                    </div>
                </div>
            </div>
        `;
        menu.innerHTML += cardHTML;
    });
}