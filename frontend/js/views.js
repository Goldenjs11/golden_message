function cargarMensaje() {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');

    if (!messageId) {
        alert("Falta el ID del mensaje");
        return;
    }

    fetch(`/api/message/${messageId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            const { message, messagedetails } = data.content;
            let vistasRestantes = data.vistasRestantes;

            // Mostrar datos del mensaje
            document.getElementById('messageTitle').textContent = message.title;
            document.getElementById('vistasRestantes').textContent = vistasRestantes;
            document.getElementById('messageStatus').textContent = message.estado ? "Activo ✅" : "Inactivo ❌";

            // Mostrar QR si existe
            if (message.qr_code) {
                document.getElementById('qrContainer').style.display = 'block';
                document.getElementById('qrImage').src = message.qr_code;
            }

            // Mostrar enlace
            document.getElementById('messageLink').textContent = "Link al mensaje";
            document.getElementById('messageLink').href = message.link;

            // Mostrar alerta si las vistas están por agotarse
            const alertVistas = document.getElementById('alertVistas');
            if (vistasRestantes <= 2) {
                alertVistas.classList.remove("d-none");
            }

            // Si ya no hay vistas, pedimos contraseña
            if (vistasRestantes <= 0) {
                mostrarModalPassword(messageId);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error al cargar el mensaje");
        });
}

function mostrarModalPassword(messageId) {
    const modal = new bootstrap.Modal(document.getElementById('modalPassword'));
    modal.show();

    const btnCheck = document.getElementById('btnCheckPassword');
    btnCheck.addEventListener('click', () => {
        const password = document.getElementById('inputPassword').value.trim();

        if (!password) {
            document.getElementById('errorPassword').textContent = "La contraseña es obligatoria";
            document.getElementById('errorPassword').classList.remove("d-none");
            return;
        }

        fetch(`/api/message/${messageId}/verify-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                location.reload();
            } else {
                document.getElementById('errorPassword').textContent = "Contraseña incorrecta ❌";
                document.getElementById('errorPassword').classList.remove("d-none");
            }
        })
        .catch(err => console.error(err));
    });
}

// Ejecutar al cargar la página
cargarMensaje();

    document.addEventListener("DOMContentLoaded", () => {
        const btnVerDetalles = document.getElementById("btnVerDetalles");

        btnVerDetalles.addEventListener("click", () => {
            const messageId = new URLSearchParams(window.location.search).get("id");
            if (messageId) {
                window.location.href = `/viewsmessage?id=${messageId}`;
            } else {
                alert("⚠️ No se pudo encontrar el ID del mensaje.");
            }
        });
    });
