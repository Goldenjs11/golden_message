let currentPage = 1;
let entriesPerPage = 10;
let messages = {};
let filteredCatalogoMessages = [];
let idUsuarioA = null;

const tbodyMessages = document.getElementById("tbody-messages");
const tableSearchInput = document.getElementById('table-search');
const entriesPerPageSelect = document.getElementById('entries-per-page');
const paginationControls = document.getElementById("pagination-controls");
const gmEmpty = document.getElementById("gm-empty");
const gmTableWrap = document.querySelector(".gm-table-wrap table");

const btnAgregar = document.getElementById('btn-agregar');
const btnAgregarEmpty = document.getElementById('btn-agregar-empty');
const btnBuscarForm = document.getElementById('btn-buscar');
const btnLimpiar = document.getElementById('btn-limpiar');
const btnExportar = document.getElementById('btn-exportar');

const statTotal = document.getElementById('stat-total');
const statActivos = document.getElementById('stat-activos');
const statCompartidos = document.getElementById('stat-compartidos');

document.addEventListener("DOMContentLoaded", async () => {
    cargarUsuarioDesdeSessionStorage();

    if (!idUsuarioA) {
        console.error("No se encontró el ID del usuario en sessionStorage.");
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({idUsuario: idUsuarioA})
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        messages = await response.json();
        filteredCatalogoMessages = messages.messages || [];

        actualizarEstadisticas(filteredCatalogoMessages);

        // Cargar la primera página
        cargarCatalogo();

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }

    // Botón Agregar (header y estado vacío)
    [btnAgregar, btnAgregarEmpty].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                window.location.href = '/admin/creacionmensajes';
            });
        }
    });

    // Botón Buscar
    if (btnBuscarForm) {
        btnBuscarForm.addEventListener('click', () => {
            currentPage = 1;
            cargarCatalogo(1, tableSearchInput.value);
        });
    }

    // Buscar también al presionar Enter en el campo
    if (tableSearchInput) {
        tableSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                cargarCatalogo(1, tableSearchInput.value);
            }
        });
    }

    // Botón Limpiar
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            tableSearchInput.value = "";
            currentPage = 1;
            cargarCatalogo();
        });
    }

    // Botón Exportar
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            console.log("Exportar no implementado aún");
        });
    }

    // Cambio de número de filas por página
    if (entriesPerPageSelect) {
        entriesPerPageSelect.addEventListener('change', () => {
            entriesPerPage = parseInt(entriesPerPageSelect.value);
            currentPage = 1;
            cargarCatalogo();
        });
    }
});




// 🔹 Renderiza la tabla con los datos recibidos
function renderizarTabla(dataToRender) {
    if (!tbodyMessages) return;
    tbodyMessages.innerHTML = "";

    const hayDatos = dataToRender.length > 0;
    if (gmTableWrap) gmTableWrap.classList.toggle("d-none", !hayDatos);
    if (gmEmpty) gmEmpty.classList.toggle("d-none", hayDatos);

    if (!hayDatos) return;

    dataToRender.forEach(item => {
        const tr = document.createElement("tr");

        // Botón editar
        const celdaBoton = tr.insertCell();
        celdaBoton.className = "gm-col-edit";
        celdaBoton.innerHTML = `
            <button onclick="editarFila('${item.id}')" type="button" class="btn btn-sm btn-outline-primary" title="Editar mensaje">
                <i class="bi bi-pencil-square"></i>
            </button>`;

        const tdDescripcion = document.createElement("td");
        tdDescripcion.textContent = item.title ?? "";

        const tdCompartido = document.createElement("td");
        tdCompartido.innerHTML = item.compartido
            ? `<span class="gm-badge gm-badge-compartido">Compartido</span>`
            : `<span class="gm-badge gm-badge-privado">Privado</span>`;

        const tdEstado = document.createElement("td");
        tdEstado.innerHTML = item.estado
            ? `<span class="gm-badge gm-badge-activo">Activo</span>`
            : `<span class="gm-badge gm-badge-inactivo">Inactivo</span>`;

        tr.appendChild(celdaBoton);
        tr.appendChild(tdDescripcion);
        tr.appendChild(tdCompartido);
        tr.appendChild(tdEstado);

        tbodyMessages.appendChild(tr);
    });
}


// 🔹 Calcula y pinta el resumen de estadísticas del header
function actualizarEstadisticas(data) {
    if (!statTotal || !statActivos || !statCompartidos) return;

    const total = data.length;
    const activos = data.filter(item => item.estado).length;
    const compartidos = data.filter(item => item.compartido).length;

    statTotal.textContent = total;
    statActivos.textContent = activos;
    statCompartidos.textContent = compartidos;
}


// 🔹 Carga datos según la página actual y búsqueda
function cargarCatalogo(page = 1, search = "") {
    currentPage = page;

    // Filtrar por búsqueda (si hay texto)
    let datosFiltrados = filteredCatalogoMessages.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    // Calcular datos para la página
    const start = (page - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const datosPagina = datosFiltrados.slice(start, end);

    // Renderizar tabla y paginación
    renderizarTabla(datosPagina);
    actualizarPaginacion(datosFiltrados.length);
}


// 🔹 Control de paginación
function actualizarPaginacion(totalItems) {
    if (!paginationControls) return;
    paginationControls.innerHTML = "";
    const totalPages = Math.ceil(totalItems / entriesPerPage);

    if (totalPages <= 1) return;

    // Botón anterior
    const liPrev = document.createElement("li");
    liPrev.classList.add("page-item");
    if (currentPage === 1) liPrev.classList.add("disabled");
    liPrev.innerHTML = `<a class="page-link" href="#" onclick="irAPagina(${currentPage - 1})">&laquo;</a>`;
    paginationControls.appendChild(liPrev);

    // Máximo 5 páginas visibles
    const maxPagesToShow = 5;
    let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    // Números de página
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        if (i === currentPage) li.classList.add("active");
        li.innerHTML = `<a class="page-link" href="#" onclick="irAPagina(${i})">${i}</a>`;
        paginationControls.appendChild(li);
    }

    // Botón siguiente
    const liNext = document.createElement("li");
    liNext.classList.add("page-item");
    if (currentPage === totalPages) liNext.classList.add("disabled");
    liNext.innerHTML = `<a class="page-link" href="#" onclick="irAPagina(${currentPage + 1})">&raquo;</a>`;
    paginationControls.appendChild(liNext);
}


function irAPagina(page) {

    if (page < 1 || page > Math.ceil(filteredCatalogoMessages.length / entriesPerPage)) return;
    cargarCatalogo(page); // Ya no pasa el searchQuery directamente
}



// 🔹 Redirección para editar fila
function editarFila(id) {
    window.location.href = `/admin/creacionmensajes?id=${id}`;
}


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