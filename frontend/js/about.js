 // Rutas relativas desde frontend/pages/about.html a frontend/assets/videos/
    const videos = [
      "../assets/videos/853819-hd_1920_1080_25fps.mp4",
      "../assets/videos/4961910-uhd_2160_3840_25fps.mp4",
      "../assets/videos/5725846-uhd_2160_3840_25fps.mp4",
      "../assets/videos/6121434-hd_1080_1920_30fps.mp4",
      "../assets/videos/7560165-uhd_2160_3840_25fps.mp4",
      "../assets/videos/9017890-uhd_2160_3840_24fps.mp4"
    ];

    // comprueba que existan archivos en consola (debug rápido)


    let currentIndex = 0;
    const leftVid = document.getElementById("leftVid");
    const centerVid = document.getElementById("centerVid");
    const rightVid = document.getElementById("rightVid");
    const gallery = document.getElementById("videoGallery");
    const leftWrap = document.getElementById("leftWrap");
    const rightWrap = document.getElementById("rightWrap");

    // Carga las fuentes en los elementos de video (usa video.src para mayor compatibilidad)
    function applySources() {
      leftVid.src = videos[(currentIndex) % videos.length];
      centerVid.src = videos[(currentIndex + 1) % videos.length];
      rightVid.src = videos[(currentIndex + 2) % videos.length];

      // Recargar y reproducir central si es posible
      leftVid.load();
      centerVid.load();
      rightVid.load();

      // Intenta reproducir; si el navegador bloquea autoplay, el usuario podrá usar controls
      centerVid.play().catch(err => {
        console.warn("Autoplay bloqueado o no permitido: ", err);
        // no hacemos más: el control aparece para que el usuario inicie
      });
    }

    // Rotar al siguiente (suave)
    function rotateNext() {
      gallery.classList.add("fading");            // atenuar suavemente
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % videos.length;
        applySources();
        // quitar atenuación para volver a ver
        setTimeout(() => gallery.classList.remove("fading"), 80);
      }, 420); // espera la atenuación antes de cambiar contenidos
    }

    // Rotar al anterior (suave)
    function rotatePrev() {
      gallery.classList.add("fading");
      setTimeout(() => {
        currentIndex = (currentIndex - 1 + videos.length) % videos.length;
        applySources();
        setTimeout(() => gallery.classList.remove("fading"), 80);
      }, 420);
    }

    // Inicializar
    function initGallery() {
  
      applySources();

      // cuando termine el central -> siguiente
      centerVid.addEventListener("ended", () => {
        rotateNext();
      });

      // clicks en laterales
      leftWrap.addEventListener("click", () => {
        rotatePrev();
      });
      rightWrap.addEventListener("click", () => {
        rotateNext();
      });

      // Si quieres que al tocar el centro se pause/reproduzca:
      centerVid.addEventListener("click", () => {
        if (centerVid.paused) centerVid.play().catch(()=>{});
        else centerVid.pause();
      });
    }

    // Ejecutar cuando DOM esté listo
    document.addEventListener("DOMContentLoaded", initGallery);