function irAAdmin() {
  window.location.href = "admin.html";
}

function cargarKioscosDisponibles() {
  const data = localStorage.getItem("kioscos");
  const lista = document.getElementById("listaKioscos");

  if (!data) {
    lista.innerHTML = "<li>No hay kioscos configurados.</li>";
    return;
  }

  const kioscos = JSON.parse(data);
  const nombres = Object.keys(kioscos);
  if (nombres.length === 0) {
    lista.innerHTML = "<li>No hay kioscos configurados.</li>";
    return;
  }

  nombres.forEach(nombre => {
    const li = document.createElement("li");
    li.textContent = nombre;
    li.onclick = () => {
      window.location.href = `kiosco.html?id=${encodeURIComponent(nombre)}`;
    };
    lista.appendChild(li);
  });
}

cargarKioscosDisponibles();
