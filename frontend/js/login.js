const mensajeError = document.querySelector(".error");
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
                console.log("Respuesta del backend:", resJson);

                if (resJson.status === "Error") {
                    mensajeError.textContent = resJson.message || "Error desconocido";
                    mensajeError.classList.toggle("escondido", false);
                    return;
                }

                if (resJson.status === "ok" && resJson.redirect) {
                    sessionStorage.setItem('infoUsuario', JSON.stringify(resJson.usuario));
                    window.location.href = resJson.redirect;
                }

            } catch (error) {
                console.error("Error en el login:", error);
                mensajeError.textContent = "Error interno: " + error.message;
                mensajeError.classList.toggle("escondido", false);
            }
        });
    }
});
