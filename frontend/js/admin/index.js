let currentPage = 1;
let entriesPerPage = 10;
let messages = {};
let filteredCatalogoMessages = [];

const tbodyMessages = document.getElementById("tbody-messages");
const tableSearchInput = document.getElementById('table-search');
const entriesPerPageSelect = document.getElementById('entries-per-page');
const paginationControls = document.getElementById("pagination-controls");

const btnAgregar = document.getElementById('btn-agregar');
const btnBuscarForm = document.getElementById('btn-buscar');
const btnLimpiar = document.getElementById('btn-limpiar');
const btnExportar = document.getElementById('btn-exportar');

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        messages = await response.json();
        console.log(messages);
        filteredCatalogoMessages = messages.messages || [];

        // Cargar la primera página
        cargarCatalogo();

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }

    // Botón Agregar
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            window.location.href = '/admin/creacionmensajes';
        });
    }

    // Botón Buscar
    if (btnBuscarForm) {
        btnBuscarForm.addEventListener('click', () => {
            currentPage = 1;
            cargarCatalogo(1, tableSearchInput.value);
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
    if (dataToRender.length === 0) {
        tbodyMessages.innerHTML = `<tr><td colspan="4" class="text-center">No existen datos para mostrar</td></tr>`;
        return;
    }


    dataToRender.forEach(item => {
        const tr = document.createElement("tr");

        // Botón editar
        const celdaBoton = tr.insertCell();
        celdaBoton.innerHTML = `
            <button onclick="editarFila('${item.id}')" type="button" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil-square"></i>
            </button>`;

        const tdCodigo = document.createElement("td");
        tdCodigo.textContent = item.id ?? "";

        const tdDescripcion = document.createElement("td");
        tdDescripcion.textContent = item.title ?? "";

        const tdEstado = document.createElement("td");
        tdEstado.textContent = item.estado ? "Activo" : "Inactivo";

        tr.appendChild(celdaBoton);
        tr.appendChild(tdCodigo);
        tr.appendChild(tdDescripcion);
        tr.appendChild(tdEstado);

        tbodyMessages.appendChild(tr);
    });
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
