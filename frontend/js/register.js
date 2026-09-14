const mensajeError = document.querySelector(".error");



document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault(); // Evitamos que el formulario recargue la página
            
            const name = document.getElementById("name").value;
            const lastname = document.getElementById("lastname").value;
            const email = document.getElementById("email").value;
            const user = document.getElementById("user").value;
            const telefono = document.getElementById("telefono").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                mensajeError.textContent = "Las contraseñas no coinciden";
                mensajeError.classList.remove("d-none");
                return;
            }

  
            try {
                // Enviamos la petición al backend
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, lastname, email, user, telefono, password })
                });

                const result = await response.json();

                if (result.status === "ok") {
                    const successModal = new bootstrap.Modal(document.getElementById("successModal"));
                    successModal.show();

                    const redirectBtn = document.getElementById("redirectBtn");
                    redirectBtn.addEventListener("click", () => {
                        window.location.href = result.redirect;
                    });
                } else {
                    mensajeError.textContent = result.message || "No se pudo completar el registro";
                    mensajeError.classList.remove("d-none");
                }
            } catch (error) {
                console.error("Error en el registro:", error);
                mensajeError.textContent = "Hubo un problema al registrar el usuario.";
                mensajeError.classList.remove("d-none");
            }
        });
    }
});
// 🔘 Cambiar entre modo claro y oscuro
const switchTheme = document.getElementById("theme-switch");
switchTheme.addEventListener("change", () => {
    document.body.setAttribute("data-theme", switchTheme.checked ? "dark" : "light");
});
