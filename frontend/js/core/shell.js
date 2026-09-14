// js/core/shell.js — layout común del panel: sidebar con los módulos
// permitidos (sessionStorage.permisos), cuenta, tema y cierre de sesión.
// Uso: <div class="gm-app" id="gm-app"><main class="gm-main">…</main></div>
(function () {
    const app = document.getElementById("gm-app");
    if (!app) return;

    const infoUsuario = leerSesion("infoUsuario");
    if (!infoUsuario) {
        window.location.href = "/login";
        return;
    }

    const permisos = leerSesion("permisos") || [];
    const rutaActual = normalizarRuta(app.dataset.active || window.location.pathname);

    app.prepend(crearSidebar(), crearTopbar());

    function leerSesion(clave) {
        try {
            return JSON.parse(sessionStorage.getItem(clave));
        } catch (error) {
            console.error(`Error al parsear ${clave}:`, error);
            return null;
        }
    }

    function normalizarRuta(ruta) {
        return (ruta || "").toLowerCase().replace(/\/+$/, "") || "/";
    }

    function crearElemento(tag, className, texto) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (texto) el.textContent = texto;
        return el;
    }

    function crearIcono(icono) {
        const i = document.createElement("i");
        i.className = `fa-solid ${icono || "fa-circle"}`;
        i.setAttribute("aria-hidden", "true");
        return i;
    }

    function crearMarca() {
        const marca = crearElemento("a", "gm-brand");
        marca.href = "/admin";
        marca.append(crearElemento("span", "gm-monogram", "GM"));
        const nombre = crearElemento("span", "gm-brand-name", "Golden Message");
        nombre.append(crearElemento("small", "", "Panel privado"));
        marca.append(nombre);
        return marca;
    }

    function crearBotonTema() {
        const boton = crearElemento("button", "gm-theme-toggle");
        boton.type = "button";
        boton.setAttribute("data-theme-toggle", "");
        boton.setAttribute("aria-label", "Cambiar tema");
        boton.append(crearIcono("fa-moon"), crearIcono("fa-sun"));
        return boton;
    }

    function esItemCerrarSesion(item) {
        const nombre = (item.nombre || "").toLowerCase();
        const ruta = (item.ruta || "").toLowerCase();
        return nombre.includes("cerrar") || nombre.includes("salir") || ruta.includes("logout");
    }

    function crearItemNav(item) {
        const li = document.createElement("li");
        const link = crearElemento("a", "gm-nav-link");
        link.href = item.ruta || "#";
        link.append(crearIcono(item.icono), crearElemento("span", "", item.nombre || ""));

        if (normalizarRuta(item.ruta) === rutaActual) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }

        li.append(link);
        return li;
    }

    function crearSidebar() {
        const aside = crearElemento("aside", "gm-sidebar offcanvas-lg offcanvas-start");
        aside.id = "gmSidebar";
        aside.tabIndex = -1;
        aside.setAttribute("aria-label", "Navegación del panel");

        const header = crearElemento("div", "offcanvas-header");
        header.append(crearMarca());
        const cerrar = crearElemento("button", "btn-close");
        cerrar.type = "button";
        cerrar.setAttribute("data-bs-dismiss", "offcanvas");
        cerrar.setAttribute("data-bs-target", "#gmSidebar");
        cerrar.setAttribute("aria-label", "Cerrar menú");
        header.append(cerrar);

        const inner = crearElemento("div", "gm-sidebar-inner offcanvas-body");

        const head = crearElemento("div", "gm-sidebar-head");
        head.append(crearMarca());
        inner.append(head);

        const nav = crearElemento("nav");
        nav.append(crearElemento("p", "gm-nav-label", "Menú"));
        const lista = crearElemento("ul", "gm-nav");
        permisos.filter((item) => !esItemCerrarSesion(item)).forEach((item) => lista.append(crearItemNav(item)));
        nav.append(lista);
        inner.append(nav);

        const foot = crearElemento("div", "gm-sidebar-foot");
        const cuenta = crearElemento("div", "gm-account");
        const nombreCuenta = infoUsuario.username || "Mi cuenta";
        cuenta.append(crearElemento("span", "gm-account-avatar", nombreCuenta.charAt(0).toUpperCase()));
        const meta = crearElemento("div", "gm-account-meta");
        meta.append(crearElemento("strong", "", nombreCuenta));
        meta.append(crearElemento("small", "", infoUsuario.email || ""));
        cuenta.append(meta, crearBotonTema());
        foot.append(cuenta);

        const salir = crearElemento("button", "gm-nav-link gm-logout");
        salir.type = "button";
        salir.append(crearIcono("fa-arrow-right-from-bracket"), crearElemento("span", "", "Cerrar sesión"));
        salir.addEventListener("click", cerrarSesion);
        foot.append(salir);

        inner.append(foot);
        aside.append(header, inner);
        return aside;
    }

    function crearTopbar() {
        const topbar = crearElemento("header", "gm-topbar");
        topbar.append(crearMarca());

        const acciones = crearElemento("div", "d-flex align-items-center gap-2");
        acciones.append(crearBotonTema());
        const menu = crearElemento("button", "gm-icon-btn");
        menu.type = "button";
        menu.setAttribute("data-bs-toggle", "offcanvas");
        menu.setAttribute("data-bs-target", "#gmSidebar");
        menu.setAttribute("aria-controls", "gmSidebar");
        menu.setAttribute("aria-label", "Abrir menú");
        menu.append(crearIcono("fa-bars"));
        acciones.append(menu);

        topbar.append(acciones);
        return topbar;
    }

    async function cerrarSesion(event) {
        event.preventDefault();

        const boton = event.currentTarget;
        boton.disabled = true;
        boton.setAttribute("aria-busy", "true");
        let timeoutId;

        try {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
                signal: controller.signal
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            clearTimeout(timeoutId);
            sessionStorage.clear();
            window.location.href = "/login";
        }
    }
})();
