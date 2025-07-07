const selectKiosco = document.getElementById("selectKiosco");
const btnNuevoKiosco = document.getElementById("btnNuevoKiosco");
const colorFondo = document.getElementById("colorFondo");
const colorTexto = document.getElementById("colorTexto");
const tipografia = document.getElementById("tipografia");
const logoUrl = document.getElementById("logoUrl");
const fondoUrl = document.getElementById("fondoUrl");
const logoFile = document.getElementById("logoFile");
const fondoFile = document.getElementById("fondoFile");
const btnClearLogo = document.getElementById("btnClearLogo");
const btnClearFondo = document.getElementById("btnClearFondo");

const listaBotones = document.getElementById("listaBotones");
const btnAgregarBoton = document.getElementById("btnAgregarBoton");

const protectorTiempo = document.getElementById("protectorTiempo");
const fileProtector = document.getElementById("fileProtector");
const listaProtector = document.getElementById("listaProtector");

const btnGuardar = document.getElementById("btnGuardar");
const btnLanzarKiosco = document.getElementById("btnLanzarKiosco");

let kioscos = {};
let kioscoActual = null;

function guardarKioscosEnStorage() {
  localStorage.setItem("kioscos", JSON.stringify(kioscos));
}

function cargarKioscosDesdeStorage() {
  const data = localStorage.getItem("kioscos");
  if (data) kioscos = JSON.parse(data);
  else kioscos = {};
}

function refrescarSelect() {
  selectKiosco.innerHTML = "";
  Object.keys(kioscos).forEach(id => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    selectKiosco.appendChild(option);
  });
}

function cargarKiosco(id) {
  kioscoActual = id;
  const cfg = kioscos[id];
  if (!cfg) return;

  colorFondo.value = cfg.colorFondo || "#ffffff";
  colorTexto.value = cfg.colorTexto || "#000000";
  tipografia.value = cfg.tipografia || "";
  logoUrl.value = cfg.logoUrl || "";
  fondoUrl.value = cfg.fondoUrl || "";

  protectorTiempo.value = cfg.protectorTiempo || 60;

  cargarBotones(cfg.botones || []);
  cargarProtectorLista(cfg.protectorLista || []);
}

function cargarBotones(botones) {
  listaBotones.innerHTML = "";
  botones.forEach((boton, i) => {
    agregarBotonALista(boton.texto, boton.url, boton.submenu, i);
  });
}

function agregarBotonALista(texto = "", url = "", submenu = null, index = null) {
  const li = document.createElement("li");
  li.draggable = true;

  li.innerHTML = `
    <input type="text" class="btn-texto" placeholder="Texto" value="${texto}" />
    <input type="text" class="btn-url" placeholder="URL (vacío si es submenu)" value="${url}" />
    <button class="btn-eliminar">Eliminar</button>
  `;

  listaBotones.appendChild(li);

  // Eventos
  const inputTexto = li.querySelector(".btn-texto");
  const inputUrl = li.querySelector(".btn-url");
  const btnEliminar = li.querySelector(".btn-eliminar");

  btnEliminar.onclick = () => {
    li.remove();
  };

  // Drag & drop
  li.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", index);
    e.currentTarget.classList.add("dragging");
  });
  li.addEventListener("dragend", e => {
    e.currentTarget.classList.remove("dragging");
  });

  listaBotones.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = listaBotones.querySelector(".dragging");
    const afterElement = getDragAfterElement(listaBotones, e.clientY);
    if (afterElement == null) {
      listaBotones.appendChild(dragging);
    } else {
      listaBotones.insertBefore(dragging, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

btnAgregarBoton.onclick = () => {
  agregarBotonALista();
};

function cargarProtectorLista(lista) {
  listaProtector.innerHTML = "";
  lista.forEach((src, i) => {
    const li = document.createElement("li");
    li.textContent = src.startsWith("data:") ? "Archivo local" : src;
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => {
      li.remove();
    };
    li.appendChild(btnEliminar);
    li.dataset.src = src;
    listaProtector.appendChild(li);
  });
}

// Manejo de archivo de logo
logoFile.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (file) {
    const base64 = await fileToBase64(file);
    logoUrl.value = base64;
  }
});

// Manejo de archivo de fondo
fondoFile.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (file) {
    const base64 = await fileToBase64(file);
    fondoUrl.value = base64;
  }
});

// Botones para limpiar
btnClearLogo.onclick = () => {
  logoUrl.value = "";
  logoFile.value = "";
};

btnClearFondo.onclick = () => {
  fondoUrl.value = "";
  fondoFile.value = "";
};

fileProtector.addEventListener("change", async e => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const base64 = await fileToBase64(file);
    const li = document.createElement("li");
    li.textContent = file.name;
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => {
      li.remove();
    };
    li.appendChild(btnEliminar);
    listaProtector.appendChild(li);
    // Guardar base64 en atributo data para luego recolectar
    li.dataset.src = base64;
  }
  e.target.value = ""; // limpiar selección
});

async function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

btnGuardar.onclick = () => {
  if (!kioscoActual) {
    alert("Seleccioná o creá un kiosco primero.");
    return;
  }
  // Recolectar botones
  const botones = [];
  listaBotones.querySelectorAll("li").forEach(li => {
    const texto = li.querySelector(".btn-texto").value.trim();
    const url = li.querySelector(".btn-url").value.trim();
    if (texto) {
      botones.push({ texto, url, submenu: null });
    }
  });

  // Recolectar protectorLista
  const protectorLista = [];
  listaProtector.querySelectorAll("li").forEach(li => {
    if (li.dataset.src) protectorLista.push(li.dataset.src);
  });

  kioscos[kioscoActual] = {
    colorFondo: colorFondo.value,
    colorTexto: colorTexto.value,
    tipografia: tipografia.value,
    logoUrl: logoUrl.value.trim(),
    fondoUrl: fondoUrl.value.trim(),
    protectorTiempo: Number(protectorTiempo.value) || 60,
    protectorLista: protectorLista,
    botones: botones
  };

  guardarKioscosEnStorage();
  refrescarSelect();
  alert("Configuración guardada.");
};

btnNuevoKiosco.onclick = () => {
  const nuevoId = prompt("Ingrese el nombre/ID del nuevo kiosco:");
  if (!nuevoId) return;
  if (kioscos[nuevoId]) {
    alert("Ese kiosco ya existe.");
    return;
  }
  kioscos[nuevoId] = {
    colorFondo: "#ffffff",
    colorTexto: "#000000",
    tipografia: "",
    logoUrl: "",
    fondoUrl: "",
    protectorTiempo: 60,
    protectorLista: [],
    botones: []
  };
  guardarKioscosEnStorage();
  refrescarSelect();
  selectKiosco.value = nuevoId;
  cargarKiosco(nuevoId);
};

selectKiosco.addEventListener("change", e => {
  cargarKiosco(e.target.value);
});

// Inicialización
cargarKioscosDesdeStorage();
refrescarSelect();
if (selectKiosco.options.length > 0) {
  selectKiosco.value = selectKiosco.options[0].value;
  cargarKiosco(selectKiosco.value);
}

btnLanzarKiosco.onclick = () => {
  if (!kioscoActual) {
    alert("Seleccioná un kiosco primero");
    return;
  }
  const url = `kiosco.html?id=${encodeURIComponent(kioscoActual)}`;
  window.open(url, "_blank");
};