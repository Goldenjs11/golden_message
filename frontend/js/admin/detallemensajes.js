let detailIndex = 1;
let idMensaje = null;

let inputIdMessage = document.getElementById("message_id");

const detailsContainer = document.getElementById("detailsContainer");
const addDetailBtn = document.getElementById("addDetail");


document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarioDesdeSessionStorage();
    verificarEditarMenssage();
    crearDetallesMenssage();
});

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
function crearDetallesMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    let idMensajeNuevo = urlParams.get('idnuevo');
    if (!idMensajeNuevo) return; // Si no hay id, no seguimos
    inputIdMessage.value = idMensajeNuevo; // Asignar el ID al campo ocult
}


async function verificarEditarMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    idMensaje = urlParams.get('id');


    if (!idMensaje) return; // Si no hay id, no seguimos
    inputIdMessage.value = idMensaje; // Asignar el ID al campo oculto
    try {
        const response = await fetch(`/api/detailsone/${idMensaje}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        // Si la respuesta es 404, no hay detalles
        if (response.status === 404) {
            return;
        }

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        console.log("🚀 ~ verificarEditarMenssage ~ data:", data)

        // Aseguramos que data.message exista y tenga contenido
        if (!data.message || Object.keys(data.message).length === 0) {
            return;
        }

        // Si hay datos, cargarlos en el formulario
        cargarDetallesMenssage(data.message);

    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}


function cargarDetallesMenssage(details) {
    console.log("🚀 ~ cargarDetallesMenssage ~ details:", details)
    detailsContainer.innerHTML = ""; // Limpiar contenedor
    detailIndex = 1;
    // Si details no es un array, lo convertimos en uno
    const detalles = Array.isArray(details) ? details : [details];

    detalles.forEach(detail => {
        const detailHTML = `
            <div class="card mb-3 border-0 shadow-sm detail-card p-3" data-index="${detailIndex}">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <h6 class="text-primary fw-bold mb-0">📝 Detalle #${detailIndex}</h6>
                    <button type="button" class="btn btn-danger btn-sm removeDetail shadow-sm">Eliminar</button>
                </div>

                <!-- Campo de texto del detalle -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Texto del detalle</label>
                    <textarea class="form-control shadow-sm" name="detail[]" rows="2" required>${detail.detail || ''}</textarea>
                </div>

                <div class="row g-3">
                    <!-- Orden del detalle -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Orden</label>
                        <input type="number" class="form-control shadow-sm" name="position[]" min="1" value="${detail.position || detailIndex}" required>
                    </div>
                    <!-- Prioridad -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Prioridad</label>
                        <select name="priority[]" class="form-select shadow-sm">
                            <option value="1" ${detail.priority == 1 ? 'selected' : ''}>Alta</option>
                            <option value="2" ${detail.priority == 2 ? 'selected' : ''}>Media</option>
                            <option value="3" ${detail.priority == 3 ? 'selected' : ''}>Baja</option>
                        </select>
                    </div>

                    <!-- Tiempo máximo en pantalla -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Tiempo en pantalla (seg)</label>
                        <input type="number" class="form-control shadow-sm" name="screen_time[]" min="1" value="${detail.screen_time || 5}" required>
                    </div>

                    <!-- Tamaño de fuente -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Tamaño de fuente</label>
                        <input type="number" name="font_size[]" class="form-control shadow-sm" value="${detail.font_size || 16}" min="10" max="48">
                    </div>

                    <!-- Selector de fuente -->
                    <div class="col-md-12">
                        <label class="form-label fw-semibold">Fuente</label>
                        <select class="form-select shadow-sm" name="font_family[]">
                            <option value="Arial" ${detail.font_family === "Arial" ? "selected" : ""}>Arial</option>
                            <option value="Verdana" ${detail.font_family === "Verdana" ? "selected" : ""}>Verdana</option>
                            <option value="Tahoma" ${detail.font_family === "Tahoma" ? "selected" : ""}>Tahoma</option>
                            <option value="Georgia" ${detail.font_family === "Georgia" ? "selected" : ""}>Georgia</option>
                            <option value="Courier New" ${detail.font_family === "Courier New" ? "selected" : ""}>Courier New</option>
                            <option value="Times New Roman" ${detail.font_family === "Times New Roman" ? "selected" : ""}>Times New Roman</option>
                        </select>
                    </div>

                    <!-- Color de fondo -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Color de fondo</label>
                        <input type="color" name="background_color[]" class="form-control form-control-color shadow-sm" value="${detail.background_color || "#ffffff"}">
                    </div>

                    <!-- Color del texto -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Color del texto</label>
                        <input type="color" name="text_color[]" class="form-control form-control-color shadow-sm" value="${detail.text_color || "#000000"}">
                    </div>

                    <!-- Imagen opcional -->
                    <div class="col-md-12">
                        <label class="form-label fw-semibold">Imagen (opcional)</label>
                        <input type="file" class="form-control shadow-sm" name="image[]" accept="image/*">
                        ${detail.image ? `<img src="http://localhost:4000/${detail.image.replace(/\\/g, "/")}" alt="Imagen detalle" class="img-fluid mt-2 border rounded shadow-sm" style="max-height: 120px;">` : ""}
                    </div>
                </div>
            </div>
        `;

        detailsContainer.insertAdjacentHTML("beforeend", detailHTML);
        detailIndex++;
    });
}



addDetailBtn.addEventListener("click", () => {
    const detailHTML = `
        <div class="card mb-3 border-0 shadow-sm detail-card p-3" data-index="${detailIndex}">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 class="text-primary fw-bold mb-0">📝 Detalle #${detailIndex}</h6>
                <button type="button" class="btn btn-danger btn-sm removeDetail shadow-sm">Eliminar</button>
            </div>

            <!-- Campo de texto del detalle -->
            <div class="mb-3">
                <label class="form-label fw-semibold">Texto del detalle</label>
                <textarea class="form-control shadow-sm" name="detail[]" rows="2" placeholder="Escribe el detalle..." required></textarea>
            </div>

            <div class="row g-3">
                <!-- Orden del detalle -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Orden</label>
                    <input type="number" class="form-control shadow-sm" name="position[]" min="1" value="${detailIndex}" required>
                </div>
                <!-- Prioridad -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Prioridad</label>
                    <select name="priority[]" class="form-select shadow-sm">
                        <option value="1">Alta</option>
                        <option value="2" selected>Media</option>
                        <option value="3">Baja</option>
                    </select>
                </div>

                <!-- Tiempo máximo en pantalla -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tiempo en pantalla (seg)</label>
                    <input type="number" class="form-control shadow-sm" name="screen_time[]" min="1" value="5" required>
                </div>

                <!-- Tamaño de fuente -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tamaño de fuente</label>
                    <input type="number" name="font_size[]" class="form-control shadow-sm" value="16" min="10" max="48">
                </div>

                <!-- Selector de fuente -->
                <div class="col-md-12">
                    <label class="form-label fw-semibold">Fuente</label>
                    <select class="form-select shadow-sm" name="font_family[]">
                        <option value="Arial" selected>Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Times New Roman">Times New Roman</option>
                    </select>
                </div>

                <!-- Color de fondo -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color de fondo</label>
                    <input type="color" name="background_color[]" class="form-control form-control-color shadow-sm" value="#ffffff">
                </div>

                <!-- Color del texto -->
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color del texto</label>
                    <input type="color" name="text_color[]" class="form-control form-control-color shadow-sm" value="#000000">
                </div>



                <!-- Imagen opcional -->
                <div class="col-md-12">
                    <label class="form-label fw-semibold">Imagen (opcional)</label>
                    <input type="file" class="form-control shadow-sm" name="image[]" accept="image/*">
                </div>
            </div>
        </div>
    `;

    detailsContainer.insertAdjacentHTML("beforeend", detailHTML);
    detailIndex++;
});

// Eliminar detalles dinámicamente
detailsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("removeDetail")) {
        e.target.closest(".detail-card").remove();
    }
});



// Seleccionamos el formulario y el botón de envío
const submitBtn = document.getElementById("submitDetails");

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Obtenemos todos los detalles dinámicos
    const detailCards = document.querySelectorAll(".detail-card");

    if (detailCards.length === 0) {
        alert("Debes agregar al menos un detalle antes de enviar.");
        return;
    }

    // Construimos un arreglo de objetos
    const details = Array.from(detailCards).map((card) => {
        return {
            detail: card.querySelector("textarea[name='detail[]']").value,
            position: card.querySelector("input[name='position[]']").value,
            priority: card.querySelector("select[name='priority[]']").value,
            screen_time: card.querySelector("input[name='screen_time[]']").value,
            font_size: card.querySelector("input[name='font_size[]']").value,
            font_family: card.querySelector("select[name='font_family[]']").value,
            background_color: card.querySelector("input[name='background_color[]']").value,
            text_color: card.querySelector("input[name='text_color[]']").value,
        };
    });

    const bodyData = {
        message_id: inputIdMessage.value,
        details
    };

    try {
        const response = await fetch("http://localhost:4000/api/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Detalles enviados correctamente ✅");
            console.log(result);
            detailsContainer.innerHTML = ""; // Limpia los detalles
            detailIndex = 1; // Reinicia el contador
        } else {
            alert("Error: " + (result.message || "Ocurrió un problema"));
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al enviar los datos.");
    }
});

