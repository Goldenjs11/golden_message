let detailIndex = 1;
let idMensaje = null;

const DEFAULT_DETAIL = {
    id: "",
    detail: "",
    position: "",
    priority: "2",
    display_time: "5",
    font_size: "18",
    font_family: "Arial",
    background_color: "#ffffff",
    background_color2: "#ffffff",
    text_color: "#000000",
    text_color2: "#000000"
};

const inputIdMessage = document.getElementById("message_id");
const detailsContainer = document.getElementById("detailsContainer");
const addDetailBtn = document.getElementById("addDetail");
const createQuickDetailsBtn = document.getElementById("createQuickDetails");
const quickDetailsInput = document.getElementById("quickDetails");
const detailsCounter = document.getElementById("detailsCounter");
const btnCrearDetalles = document.getElementById("submitDetails");
const btnActualizarDetalles = document.getElementById("updateDetails");

document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarioDesdeSessionStorage();
    verificarEditarMenssage();
    crearDetallesMenssage();
    updateDetailsCounter();
});

function cargarUsuarioDesdeSessionStorage() {
    const storedInfoUsuario = sessionStorage.getItem("infoUsuario");
    if (!storedInfoUsuario) return;

    try {
        const infoUsuario = JSON.parse(storedInfoUsuario);
        idUsuarioA = infoUsuario.id || null;
    } catch (error) {
        console.error("Error al parsear infoUsuario:", error);
    }
}

function crearDetallesMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    const idMensajeNuevo = urlParams.get("idnuevo");
    if (!idMensajeNuevo) return;

    inputIdMessage.value = idMensajeNuevo;
}

async function verificarEditarMenssage() {
    const urlParams = new URLSearchParams(window.location.search);
    idMensaje = urlParams.get("id");

    if (!idMensaje) return;

    inputIdMessage.value = idMensaje;

    try {
        const response = await fetch(`/api/detailsone/${idMensaje}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();

        if (!data.message || Object.keys(data.message).length === 0) {
            return;
        }

        btnCrearDetalles.classList.add("d-none");
        btnActualizarDetalles.classList.remove("d-none");
        btnActualizarDetalles.addEventListener("click", updateDetails);

        cargarDetallesMenssage(data.message);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function cargarDetallesMenssage(details) {
    detailsContainer.innerHTML = "";
    detailIndex = 1;

    const detalles = Array.isArray(details) ? details : [details];
    detalles
        .sort((a, b) => {
            const positionA = Number(a.position) || 0;
            const positionB = Number(b.position) || 0;
            const priorityA = Number(a.priority) || 0;
            const priorityB = Number(b.priority) || 0;

            if (positionA === positionB) return priorityA - priorityB;
            return positionA - positionB;
        })
        .forEach((detail) => addDetailCard(detail));

    updateDetailsCounter();
}

function addDetailCard(detail = {}) {
    const currentIndex = detailIndex;
    const data = {
        ...DEFAULT_DETAIL,
        ...detail,
        position: detail.position || currentIndex
    };

    detailsContainer.insertAdjacentHTML("beforeend", createDetailHTML(data, currentIndex));
    detailIndex++;
    updateDetailsCounter();
}

function createDetailHTML(detail, index) {
    const detailText = escapeHtml(detail.detail || "");

    return `
        <div class="detail-card" data-index="${index}">
            <div class="detail-card-main">
                <div class="detail-number">${index}</div>
                <div class="detail-text-field">
                    <label class="form-label fw-semibold">Texto del detalle</label>
                    <textarea class="form-control" name="detail[]" rows="2" placeholder="Escribe el detalle..." required>${detailText}</textarea>
                </div>
                <button type="button" class="btn btn-outline-danger removeDetail" title="Eliminar detalle">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

            <button type="button" class="advanced-toggle" aria-expanded="false">
                <i class="fa-solid fa-sliders"></i> Opciones avanzadas
            </button>

            <div class="advanced-options d-none">
                <input type="hidden" name="detailid[]" value="${escapeHtml(detail.id || "")}">

                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Orden</label>
                        <input type="number" class="form-control" name="position[]" min="1" value="${escapeHtml(detail.position)}" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tipo</label>
                        <select name="priority[]" class="form-select">
                            <option value="1" ${detail.priority == 1 ? "selected" : ""}>Encabezado</option>
                            <option value="2" ${detail.priority == 2 ? "selected" : ""}>Contenido</option>
                            <option value="3" ${detail.priority == 3 ? "selected" : ""}>Cierre</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Tiempo (seg)</label>
                        <input type="number" class="form-control" name="display_time[]" min="1" value="${escapeHtml(detail.display_time)}" required>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Tamaño de fuente</label>
                        <input type="number" name="font_size[]" class="form-control" value="${escapeHtml(detail.font_size)}" min="10" max="48">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Fuente</label>
                        <select class="form-select" name="font_family[]">
                            ${fontOption("Arial", detail.font_family)}
                            ${fontOption("Verdana", detail.font_family)}
                            ${fontOption("Tahoma", detail.font_family)}
                            ${fontOption("Georgia", detail.font_family)}
                            ${fontOption("Courier New", detail.font_family)}
                            ${fontOption("Times New Roman", detail.font_family)}
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Color de fondo</label>
                        <input type="color" name="background_color[]" class="form-control form-control-color" value="${colorValue(detail.background_color, "#ffffff")}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Fondo secundario</label>
                        <input type="color" name="background_color2[]" class="form-control form-control-color" value="${colorValue(detail.background_color2, "#ffffff")}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Color del texto</label>
                        <input type="color" name="text_color[]" class="form-control form-control-color" value="${colorValue(detail.text_color, "#000000")}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Texto secundario</label>
                        <input type="color" name="text_color2[]" class="form-control form-control-color" value="${colorValue(detail.text_color2, "#000000")}">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function fontOption(font, selectedFont) {
    return `<option value="${font}" ${selectedFont === font ? "selected" : ""}>${font}</option>`;
}

function colorValue(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDetailCards() {
    return Array.from(document.querySelectorAll(".detail-card"));
}

function collectDetails(includeIds = false) {
    return getDetailCards().map((card, index) => {
        const detail = {
            detail: card.querySelector("textarea[name='detail[]']").value.trim(),
            position: card.querySelector("input[name='position[]']").value || index + 1,
            priority: card.querySelector("select[name='priority[]']").value,
            display_time: card.querySelector("input[name='display_time[]']").value,
            font_size: card.querySelector("input[name='font_size[]']").value,
            font_family: card.querySelector("select[name='font_family[]']").value,
            background_color: card.querySelector("input[name='background_color[]']").value,
            background_color2: card.querySelector("input[name='background_color2[]']").value,
            text_color: card.querySelector("input[name='text_color[]']").value,
            text_color2: card.querySelector("input[name='text_color2[]']").value
        };

        if (includeIds) {
            detail.id = card.querySelector("input[name='detailid[]']").value || null;
        }

        return detail;
    });
}

function validateDetails(details, actionText) {
    if (details.length === 0) {
        showToast(`Debes agregar al menos un detalle antes de ${actionText}.`, "warning");
        return false;
    }

    if (details.some((detail) => !detail.detail)) {
        showToast("Todos los detalles deben tener texto.", "warning");
        return false;
    }

    return true;
}

function updateDetailsCounter() {
    const total = getDetailCards().length;

    if (!detailsCounter) return;

    detailsCounter.textContent = total === 0
        ? "Aun no hay detalles."
        : `${total} detalle${total === 1 ? "" : "s"} listo${total === 1 ? "" : "s"} para guardar.`;
}

function renumberDetails() {
    getDetailCards().forEach((card, index) => {
        const newIndex = index + 1;
        card.dataset.index = newIndex;
        card.querySelector(".detail-number").textContent = newIndex;
        card.querySelector("input[name='position[]']").value = newIndex;
    });

    detailIndex = getDetailCards().length + 1;
    updateDetailsCounter();
}

addDetailBtn.addEventListener("click", () => {
    addDetailCard();
});

createQuickDetailsBtn.addEventListener("click", () => {
    const lines = quickDetailsInput.value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        showToast("Escribe al menos un detalle en la caja de texto.", "warning");
        return;
    }

    lines.forEach((detail) => addDetailCard({ detail }));
    quickDetailsInput.value = "";
    showToast(`${lines.length} detalle${lines.length === 1 ? "" : "s"} agregado${lines.length === 1 ? "" : "s"}.`, "success");
});

detailsContainer.addEventListener("click", (e) => {
    const removeButton = e.target.closest(".removeDetail");
    const advancedButton = e.target.closest(".advanced-toggle");

    if (removeButton) {
        removeButton.closest(".detail-card").remove();
        renumberDetails();
        return;
    }

    if (advancedButton) {
        const options = advancedButton.nextElementSibling;
        const isOpen = !options.classList.contains("d-none");

        options.classList.toggle("d-none", isOpen);
        advancedButton.setAttribute("aria-expanded", String(!isOpen));
    }
});

btnCrearDetalles.addEventListener("click", async (e) => {
    e.preventDefault();

    const details = collectDetails(false);
    if (!validateDetails(details, "enviar")) return;

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
            showToast("Detalles creados correctamente", "success");
            detailsContainer.innerHTML = "";
            detailIndex = 1;
            updateDetailsCounter();
        } else {
            showToast("Error: " + (result.message || "Ocurrio un problema"), "error");
        }
    } catch (error) {
        showToast("Hubo un error al enviar los datos.", "error");
    }
});

async function updateDetails(e) {
    e.preventDefault();

    const details = collectDetails(true);
    if (!validateDetails(details, "actualizar")) return;

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
            showToast("Detalles actualizados correctamente", "success");
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showToast("Error: " + (result.message || "Ocurrio un problema"), "error");
        }
    } catch (error) {
        showToast("Hubo un error al enviar los datos.", "error");
    }
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast-message toast-${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
