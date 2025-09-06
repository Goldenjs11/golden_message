// js/theme.js
function setupThemeToggle() {
    const themeSwitch = document.getElementById("theme-switch");
    
    if (themeSwitch) {
        // Cargar el tema guardado en localStorage o usar 'light' como predeterminado
        const savedTheme = localStorage.getItem("theme") || "light";

        // ✅ Aplicar el tema solo al <html>
        document.documentElement.setAttribute("data-theme", savedTheme);

        // Actualizar el estado del checkbox
        themeSwitch.checked = savedTheme === "dark";

        // Escuchar el cambio en el toggle
        themeSwitch.addEventListener("change", () => {
            const newTheme = themeSwitch.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", setupThemeToggle);


let anims = [...document.querySelectorAll("[anim]")];
console.log(anims);
let click = (el, cb) => el.addEventListener("click", cb);
let toggle = (el) => el.classList.toggle("toggled");
let clickTog = (el) => click(el, () => toggle(el));
anims.map(clickTog);