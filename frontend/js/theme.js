// js/theme.js — tema claro/oscuro compartido por todas las páginas.
// El <head> de cada página aplica el tema guardado antes del render;
// este script solo sincroniza y escucha los botones [data-theme-toggle].
(function () {
    const STORAGE_KEY = "theme";
    const DEFAULT_THEME = "dark";

    function leerTema() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        } catch (error) {
            return DEFAULT_THEME;
        }
    }

    function aplicarTema(tema) {
        const root = document.documentElement;
        root.setAttribute("data-theme", tema);
        root.setAttribute("data-bs-theme", tema);

        document.querySelectorAll("[data-theme-toggle]").forEach((boton) => {
            boton.setAttribute("aria-pressed", String(tema === "light"));
            boton.setAttribute("title", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
        });
    }

    function alternarTema() {
        const actual = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
        const nuevo = actual === "dark" ? "light" : "dark";
        try {
            localStorage.setItem(STORAGE_KEY, nuevo);
        } catch (error) {
            // almacenamiento no disponible: el cambio dura solo esta visita
        }
        aplicarTema(nuevo);
    }

    aplicarTema(leerTema());

    // Delegado: también funciona para botones insertados después (p. ej. el shell del panel)
    document.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-theme-toggle]");
        if (!boton) return;
        event.preventDefault();
        alternarTema();
    });

    document.addEventListener("DOMContentLoaded", () => aplicarTema(leerTema()));

    window.gmTheme = { aplicarTema, alternarTema };
})();
