let detailIndex = 1;
let idMensaje = null;

let inputIdMessage = document.getElementById("message_id");

const detailsContainer = document.getElementById("detailsContainer");
const addDetailBtn = document.getElementById("addDetail");
const btnCrearDetalles = document.getElementById('submitDetails');
const btnActualizarDetalles = document.getElementById('updateDetails');


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

        // Aseguramos que data.message exista y tenga contenido
        if (!data.message || Object.keys(data.message).length === 0) {
            return;
        }
        btnCrearDetalles.classList.add('d-none');
        btnActualizarDetalles.classList.remove('d-none');
        btnActualizarDetalles.addEventListener("click", updateDetails);

        // Si hay datos, cargarlos en el formulario
        cargarDetallesMenssage(data.message);

    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

async function updateDetails(e) {
    e.preventDefault();

    const detailCards = document.querySelectorAll(".detail-card");

    if (detailCards.length === 0) {
        showToast("Debes agregar al menos un detalle antes de actualizar.", "warning");
        return;
    }

    // Construimos el array de objetos
    const details = Array.from(detailCards).map((card) => {
        return {
            id: card.querySelector("input[name='detailid[]']").value || null, // Si existe ID, lo usamos; si no, es un nuevo detalle
            detail: card.querySelector("textarea[name='detail[]']").value,
            position: card.querySelector("input[name='position[]']").value,
            priority: card.querySelector("select[name='priority[]']").value,
            display_time: card.querySelector("input[name='display_time[]']").value,
            font_size: card.querySelector("input[name='font_size[]']").value,
            font_family: card.querySelector("select[name='font_family[]']").value,
            background_color: card.querySelector("input[name='background_color[]']").value,
            background_color2: card.querySelector("input[name='background_color2[]']").value,
            text_color: card.querySelector("input[name='text_color[]']").value,
            text_color2: card.querySelector("input[name='text_color2[]']").value
        };
    });

    const bodyData = {
        message_id: inputIdMessage.value,
        details
    };

    try {
        const response = await fetch(`/api/updatedetails/${inputIdMessage.value}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast("Detalles actualizados correctamente ✅", "success");
            setTimeout(() => {
                location.reload();
            }, 3000);
        } else {
            showToast("Error: " + (result.message || "Ocurrió un problema"), "error");
        }
    } catch (error) {
        showToast("Hubo un error al enviar los datos.", "error");
    }
}




function cargarDetallesMenssage(details) {
    detailsContainer.innerHTML = ""; // Limpiar contenedor
    detailIndex = 1;
    // Si details no es un array, lo convertimos en uno
    const detalles = Array.isArray(details) ? details : [details];
    // Ordenar primero por position, luego por priority
    detalles.sort((a, b) => {
        if (a.position === b.position) {
            return a.priority - b.priority;  // Si la posición es igual, ordena por prioridad
        }
        return a.position - b.position; // Orden principal por posición
    });

    detalles.forEach(detail => {
        const detailHTML = `
            <div class="card mb-3 border-0 shadow-sm detail-card p-3" data-index="${detailIndex}">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <h6 class="text-primary fw-bold mb-0">📝 Detalle #${detailIndex}</h6>
                    <button type="button" class="btn btn-danger btn-sm removeDetail shadow-sm">Eliminar</button>
                </div>
                <!-- ID oculto del mensaje principal -->
                <input type="hidden" name="detailid[]" value="${detail.id}">

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
                        <input type="number" class="form-control shadow-sm" name="display_time[]" min="1" value="${detail.display_time || 5}" required>
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

                    <!-- Colores de fondo -->
                    <div class="row mt-1">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Color de fondo</label>
                            <input type="color" name="background_color[]" class="form-control form-control-color shadow-sm"
                                value="${detail.background_color || "#ffffff"}"
                                data-bs-toggle="tooltip"
                                title="Si seleccionas este y el siguiente color, se generará un degradado.">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Color de fondo (opcional)</label>
                            <input type="color" name="background_color2[]" class="form-control form-control-color shadow-sm"
                                value="${detail.background_color2 || "#ffffff"}"
                                data-bs-toggle="tooltip"
                                title="Úsalo junto al anterior para crear un degradado.">
                        </div>

                        <!-- Texto explicativo para ambos inputs -->
                        <div class="col-12 mt-1">
                            <small class="text-muted d-block text-center">
                                Si eliges ambos colores, se aplicará un degradado.  
                                Si solo seleccionas uno, será color sólido.
                            </small>
                        </div>
                    </div>

                    <!-- Colores del texto -->
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Color del texto</label>
                            <input type="color" name="text_color[]" class="form-control form-control-color shadow-sm"
                                value="${detail.text_color || "#000000"}"
                                data-bs-toggle="tooltip"
                                title="Si seleccionas este y el siguiente color, el texto tendrá degradado.">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Color del texto (opcional)</label>
                            <input type="color" name="text_color2[]" class="form-control form-control-color shadow-sm"
                                value="${detail.text_color2 || "#ffffffff"}"
                                data-bs-toggle="tooltip"
                                title="Úsalo junto al anterior para crear un degradado en el texto.">
                        </div>

                        <!-- Texto explicativo para ambos inputs -->
                        <div class="col-12 mt-1">
                            <small class="text-muted d-block text-center">
                                Selecciona los dos colores para un degradado,  
                                o solo uno para un color sólido.
                            </small>
                        </div>
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

            <!-- ID oculto del detalle mensaje -->
            <input type="hidden" name="detailid[]" value="">

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
                    <input type="number" class="form-control shadow-sm" name="display_time[]" min="1" value="5" required>
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

            <!-- Colores de fondo -->
            <div class="row mt-1">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color de fondo 1</label>
                    <input type="color" name="background_color[]" class="form-control form-control-color shadow-sm" value="#ffffff">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color de fondo 2 <span class="text-muted">(opcional)</span></label>
                    <input type="color" name="background_color2[]" class="form-control form-control-color shadow-sm" value="">
                </div>

                <!-- Texto explicativo centrado para los dos inputs -->
                <div class="col-12 mt-1">
                    <small class="text-muted d-block text-center">
                        Si seleccionas los dos colores, el fondo será un gradiente.  
                        Si solo eliges uno, será un color sólido.
                    </small>
                </div>
            </div>

            <!-- Colores del texto -->
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color del texto 1</label>
                    <input type="color" name="text_color[]" class="form-control form-control-color shadow-sm" value="#000000">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">Color del texto 2 <span class="text-muted">(opcional)</span></label>
                    <input type="color" name="text_color2[]" class="form-control form-control-color shadow-sm" value="">
                </div>

                <!-- Texto explicativo centrado para los dos inputs -->
                <div class="col-12 mt-1">
                    <small class="text-muted d-block text-center">
                        Si seleccionas los dos colores, el texto tendrá un degradado.  
                        Si solo eliges uno, será un color sólido.
                    </small>
                </div>
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
        showToast("Debes agregar al menos un detalle antes de enviar.", "warning");
        return;
    }

    // Construimos un arreglo de objetos
    const details = Array.from(detailCards).map((card) => {
        return {
            detail: card.querySelector("textarea[name='detail[]']").value,
            position: card.querySelector("input[name='position[]']").value,
            priority: card.querySelector("select[name='priority[]']").value,
            display_time: card.querySelector("input[name='display_time[]']").value,
            font_size: card.querySelector("input[name='font_size[]']").value,
            font_family: card.querySelector("select[name='font_family[]']").value,
            background_color: card.querySelector("input[name='background_color[]']").value,
            background_color2: card.querySelector("input[name='background_color2[]']").value,
            text_color: card.querySelector("input[name='text_color[]']").value,
            text_color2: card.querySelector("input[name='text_color2[]']").value
        };
    });

    const bodyData = {
        message_id: inputIdMessage.value,
        details
    };

    try {
        const response = await fetch("/api/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast("Detalles creados correctamente ✅", "success");
            detailsContainer.innerHTML = ""; // Limpia los detalles
            detailIndex = 1; // Reinicia el contador
        } else {
            showToast("Error: " + (result.message || "Ocurrió un problema"), "error");
        }
    } catch (error) {
       showToast("Hubo un error al enviar los datos.", "error");

    }
});

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Eliminar automáticamente después de 4s
  setTimeout(() => {
    toast.remove();
  }, 10000);
}