// Variables globales
let config = {};
let protectorIndex = 0;
let tiempoInactividad;

// Carga la configuración desde localStorage según el id en la URL
function cargarConfiguracion() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) {
    alert("No se especificó el ID del kiosco en la URL.");
    return null;
  }

  const data = localStorage.getItem("kioscos");
  if (!data) {
    alert("No hay configuración guardada.");
    return null;
  }

  const todos = JSON.parse(data);
  if (!todos[id]) {
    alert("No se encontró configuración para el kiosco: " + id);
    return null;
  }

  return todos[id];
}

// Aplica el estilo de fondo y logo
function aplicarEstilos() {
  const body = document.body;
  const contenedor = document.getElementById("contenedorBotones");
  
  // Aplicar fondo
  if (config.fondoUrl) {
    if (config.fondoUrl.startsWith("data:video")) {
      // Es un video
      const video = document.createElement("video");
      video.src = config.fondoUrl;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.style.position = "fixed";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.zIndex = "-1";
      body.appendChild(video);
    } else {
      // Es una imagen
      body.style.backgroundImage = `url(${config.fondoUrl})`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundAttachment = "fixed";
    }
  }
  
  // Aplicar logo
  if (config.logoUrl) {
    const logo = document.createElement("img");
    logo.src = config.logoUrl;
    logo.id = "logo";
    logo.style.position = "fixed";
    logo.style.top = "20px";
    logo.style.left = "20px";
    logo.style.maxWidth = "200px";
    logo.style.maxHeight = "100px";
    logo.style.zIndex = "100";
    body.appendChild(logo);
  }
  
  // Aplicar colores y tipografía al contenedor
  contenedor.style.fontFamily = config.tipografia || "sans-serif";
}

// Renderiza los botones principales
function renderBotones() {
  const contenedor = document.getElementById("contenedorBotones");
  contenedor.innerHTML = "";
  
  if (!config.botones || config.botones.length === 0) {
    contenedor.innerHTML = "<p>No hay botones configurados.</p>";
    return;
  }
  
  config.botones.forEach((boton, i) => {
    const btn = document.createElement("button");
    btn.textContent = boton.texto || "Botón " + (i + 1);
    btn.className = "kiosco-btn";
    btn.style.color = config.colorTexto || "#000";
    btn.style.backgroundColor = config.colorFondo || "#ccc";
    btn.style.fontFamily = config.tipografia || "sans-serif";
    btn.onclick = () => manejarClickBoton(boton);
    contenedor.appendChild(btn);
  });
}

// Maneja el click en un botón (URL o submenu)
function manejarClickBoton(boton) {
  if (boton.submenu && boton.submenu.length > 0) {
    mostrarSubmenu(boton.submenu);
  } else if (boton.url) {
    mostrarIframe(boton.url);
  }
}

// Muestra un submenu con botones y un botón para volver
function mostrarSubmenu(submenu) {
  const contenedor = document.getElementById("contenedorBotones");
  contenedor.innerHTML = "";
  
  submenu.forEach((boton, i) => {
    const btn = document.createElement("button");
    btn.textContent = boton.texto || "SubBotón " + (i + 1);
    btn.className = "kiosco-btn";
    btn.style.color = config.colorTexto || "#000";
    btn.style.backgroundColor = config.colorFondo || "#ccc";
    btn.style.fontFamily = config.tipografia || "sans-serif";
    btn.onclick = () => manejarClickBoton(boton);
    contenedor.appendChild(btn);
  });
  
  mostrarBotonVolver();
}

// Botón para volver al menú principal
function mostrarBotonVolver() {
  const contenedor = document.getElementById("contenedorBotones");
  const btnVolver = document.createElement("button");
  btnVolver.textContent = "Volver";
  btnVolver.className = "kiosco-btn volver-btn";
  btnVolver.onclick = () => renderBotones();
  contenedor.appendChild(btnVolver);
}

// Muestra el iframe con la URL indicada y oculta los botones
function mostrarIframe(url) {
  const contenedor = document.getElementById("contenedorBotones");
  const iframe = document.getElementById("iframeVisor");
  const banner = document.getElementById("banner");

  contenedor.classList.add("hidden");
  banner.classList.remove("hidden");
  iframe.classList.remove("hidden");

  iframe.src = url;
}

// Vuelve a la pantalla inicial de botones desde el iframe
function volverInicio() {
  const contenedor = document.getElementById("contenedorBotones");
  const iframe = document.getElementById("iframeVisor");
  const banner = document.getElementById("banner");

  iframe.src = "";
  iframe.classList.add("hidden");
  banner.classList.add("hidden");
  contenedor.classList.remove("hidden");
}

// Muestra el protector de pantalla con playlist (imágenes/videos)
function mostrarProtector() {
  const playlist = config.protectorLista || [];
  const protector = document.getElementById("protectorPantalla");

  if (playlist.length === 0) {
    ocultarProtector();
    return;
  }

  protector.classList.remove("hidden");
  protectorIndex = 0;
  mostrarItemProtector(playlist);
}

// Muestra un ítem (imagen o video) del protector de pantalla
function mostrarItemProtector(lista) {
  const protector = document.getElementById("protectorPantalla");
  protector.innerHTML = "";

  const src = lista[protectorIndex];
  const isVideo = src.startsWith("data:video");

  const elem = document.createElement(isVideo ? "video" : "img");
  elem.src = src;

  if (isVideo) {
    elem.autoplay = true;
    elem.muted = true;
    elem.loop = false;
    elem.onended = () => avanzarProtector(lista);
  } else {
    setTimeout(() => avanzarProtector(lista), 5000);
  }

  elem.style.maxWidth = "100%";
  elem.style.maxHeight = "100%";
  protector.appendChild(elem);
}

// Avanza al siguiente ítem del protector
function avanzarProtector(lista) {
  protectorIndex = (protectorIndex + 1) % lista.length;
  mostrarItemProtector(lista);
}

// Oculta el protector de pantalla y limpia su contenido
function ocultarProtector() {
  const protector = document.getElementById("protectorPantalla");
  protector.classList.add("hidden");
  protector.innerHTML = "";
}

// Reinicia el temporizador de inactividad para mostrar el protector
function reiniciarInactividad() {
  clearTimeout(tiempoInactividad);
  const tiempo = config.protectorTiempo || 60;
  tiempoInactividad = setTimeout(mostrarProtector, tiempo * 1000);
}

// Eventos para reiniciar el temporizador al detectar actividad del usuario
document.addEventListener("mousemove", reiniciarInactividad);
document.addEventListener("mousedown", reiniciarInactividad);
document.addEventListener("keypress", reiniciarInactividad);
document.addEventListener("touchstart", reiniciarInactividad);

// Ocultar protector al hacer click
document.getElementById("protectorPantalla").addEventListener("click", () => {
  ocultarProtector();
  reiniciarInactividad();
});

window.onload = () => {
  const cfg = cargarConfiguracion();
  if (!cfg) return;
  config = cfg;

  aplicarEstilos();
  ocultarProtector();
  reiniciarInactividad();
  renderBotones();

  document.getElementById("btnVolverInicio").onclick = volverInicio;
  document.getElementById("btnAtras").onclick = () => volverInicio();
};