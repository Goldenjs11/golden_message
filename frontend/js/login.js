const mensajeError = document.querySelector(".error");
const mensajeErrorPermiso = document.querySelector(".error-permiso");
let infoUsuario;

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;

            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                    credentials: "include"
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    mensajeError.textContent = errorData.message || "Error en la solicitud de login";
                    mensajeError.classList.toggle("escondido", false);
                    return;
                }

                const resJson = await res.json();


                if (resJson.status === "Error") {
                    mensajeError.textContent = resJson.message || "Error desconocido";
                    mensajeError.classList.toggle("escondido", false);
                    return;
                }

                if (resJson.status === "ok" && resJson.redirect) {
                    sessionStorage.setItem('infoUsuario', JSON.stringify(resJson.usuario));
                    
                    const permisos = await obtenerPermisos();
                    if (permisos.length > 0) {
                        window.location.href = resJson.redirect;
                    } else {
                        mensajeErrorPermiso.innerHTML = "No tienes permisos suficientes";
                        mensajeErrorPermiso.classList.toggle("escondido", false);
                    }

                }

            } catch (error) {
                console.error("Error en el login:", error);
                mensajeError.textContent = "Error interno: " + error.message;
                mensajeError.classList.toggle("escondido", false);
            }
        });
    }
});




async function obtenerPermisos() {
    try {
        const response = await fetch('/api/permisos', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.status === "ok") {
            sessionStorage.setItem('permisos', JSON.stringify(data.permisos));
            return data.permisos;
        } else {
            mensajeErrorPermiso.innerHTML = data.message || "Error al obtener permisos";
            mensajeErrorPermiso.classList.toggle("escondido", false);
            return [];
        }
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        mensajeErrorPermiso.innerHTML = "Error interno: " + error.message;
        mensajeErrorPermiso.classList.toggle("escondido", false);
        return [];
    }
}