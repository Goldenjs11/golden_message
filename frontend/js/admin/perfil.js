const usernameInput = document.getElementById("username");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const bannerPreview = document.getElementById("bannerPreview");
  const bannerBg = document.getElementById("bannerBg");
  const bannerText = document.getElementById("bannerText");

  // Cambiar nombre en vivo
  usernameInput.addEventListener("input", () => {
    usernameDisplay.textContent = usernameInput.value || "Usuario";
  });

  // Cambiar colores en vivo
  bannerBg.addEventListener("input", () => {
    bannerPreview.style.setProperty("--banner-bg", bannerBg.value);
  });
  bannerText.addEventListener("input", () => {
    bannerPreview.style.setProperty("--banner-text", bannerText.value);
  });

  // Simular guardado
  document.getElementById("formPerfil").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ Perfil actualizado correctamente.");
  });