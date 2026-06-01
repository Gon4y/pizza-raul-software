const roleInfo = {
  cliente: {
    title: "Cliente",
    desc: "Seguimiento de pedidos y registro de compras."
  },
  cajero: {
    title: "Cajero",
    desc: "Registro, validación, cocina y despacho."
  },
  cocinero: {
    title: "Cocina",
    desc: "Preparación de pedidos y control de calidad."
  },
  motorizado: {
    title: "Motorizado",
    desc: "Rutas asignadas, salida y confirmación de entrega."
  },
  admin: {
    title: "Administrador",
    desc: "Indicadores, reportes y control de operación."
  }
};

let currentRole = null;
let selectedPedido = null;

let mapa = null;
let rutaControl = null;
let marcadorTienda = null;
let marcadorCliente = null;

let pedidos = [
  {
    id: "PR-1001",
    cliente: "Luis Herrera",
    telefono: "999111222",
    direccion: "Av. Universitaria 1500, San Miguel",
    producto: "Pizza Americana Familiar + Gaseosa",
    pago: "Yape",
    indicaciones: "Enviar con ají y servilletas.",
    estado: "recibido",
    motorizado: "-"
  },
  {
    id: "PR-1002",
    cliente: "Rosa Delgado",
    telefono: "988777444",
    direccion: "Jr. Lima 345, Pueblo Libre",
    producto: "Pizza Pepperoni Familiar",
    pago: "Tarjeta",
    indicaciones: "Sin orégano.",
    estado: "en preparación",
    motorizado: "-"
  },
  {
    id: "PR-1003",
    cliente: "Andrés Salazar",
    telefono: "955222111",
    direccion: "Calle Las Flores 811, Magdalena",
    producto: "Combo Raúl Familiar",
    pago: "Efectivo",
    indicaciones: "Pagar con 100 soles.",
    estado: "en reparto",
    motorizado: "Miguel R."
  },
  {
    id: "PR-1004",
    cliente: "Diana Paredes",
    telefono: "944888111",
    direccion: "Av. La Marina 620, San Miguel",
    producto: "Pizza Hawaiana + Alitas",
    pago: "Plin",
    indicaciones: "Departamento 501.",
    estado: "entregado",
    motorizado: "Jorge V."
  },
  {
    id: "PR-1005",
    cliente: "María Torres",
    telefono: "912456789",
    direccion: "Jr. Las Begonias 120, Pueblo Libre",
    producto: "Pizza Suprema Familiar + Bebida",
    pago: "Tarjeta",
    indicaciones: "Entregar en recepción.",
    estado: "asignado",
    motorizado: "Miguel R."
  },
  {
    id: "PR-1006",
    cliente: "Raúl Gutiérrez",
    telefono: "966333222",
    direccion: "Av. Brasil 980, Magdalena",
    producto: "Pizza BBQ Chicken + Papas",
    pago: "Yape",
    indicaciones: "Llamar antes de llegar.",
    estado: "preparado",
    motorizado: "-"
  }
];

function login(role) {
  currentRole = role;

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("roleTitle").textContent = roleInfo[role].title;
  document.getElementById("roleDesc").textContent = roleInfo[role].desc;
  document.getElementById("headerSubtitle").textContent = roleInfo[role].desc;

  hideAllViews();

  if (role === "cliente") showOnly("clienteView");
  if (role === "cajero") showOnly("cajeroView");
  if (role === "cocinero") showOnly("cocinaView");

  if (role === "motorizado") {
    showOnly("motorizadoView");
    setTimeout(inicializarMapa, 300);
  }

  if (role === "admin") showOnly("adminView");

  renderAll();
  toast("Sesión iniciada como " + roleInfo[role].title);
}

function logout() {
  currentRole = null;
  selectedPedido = null;

  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");

  limpiarDetalles();
  toast("Sesión cerrada");
}

function hideAllViews() {
  document.querySelectorAll(".view").forEach(view => view.classList.add("hidden"));
}

function showOnly(viewId) {
  document.getElementById(viewId).classList.remove("hidden");
}

function renderAll() {
  renderCliente();
  renderCajero();
  renderCocina();
  renderMotorizado();
  renderAdmin();

  if (selectedPedido) {
    const pedido = pedidos.find(p => p.id === selectedPedido);
    if (pedido) renderDetallePedido(pedido);
  }
}

function renderCliente() {
  const box = document.getElementById("seguimientoCliente");
  if (!box) return;

  const ultimos = pedidos.slice().reverse().slice(0, 3);

  box.innerHTML = ultimos.map(p => `
    <div class="order-tracking">
      <h3>${p.id} - ${p.producto}</h3>
      <p>
        <strong>Cliente:</strong> ${p.cliente}<br>
        <strong>Dirección:</strong> ${p.direccion}<br>
        <strong>Estado:</strong> ${badge(p.estado)}
      </p>

      <div class="tracking-line">
        <div class="tracking-step ${isActive(p.estado, ['recibido','en preparación','listo','preparado','asignado','en reparto','entregado'])}">
          Recibido
        </div>
        <div class="tracking-step ${isActive(p.estado, ['en preparación','listo','preparado','asignado','en reparto','entregado'])}">
          Preparación
        </div>
        <div class="tracking-step ${isActive(p.estado, ['listo','preparado','asignado','en reparto','entregado'])}">
          Listo
        </div>
        <div class="tracking-step ${isActive(p.estado, ['asignado','en reparto','entregado'])}">
          Reparto
        </div>
        <div class="tracking-step ${isActive(p.estado, ['entregado'])}">
          Entregado
        </div>
      </div>
    </div>
  `).join("");
}

function renderCajero() {
  setText("cajKpiRecibidos", pedidos.filter(p => p.estado === "recibido").length);
  setText("cajKpiPendientes", pedidos.filter(p => p.estado === "en preparación").length);
  setText("cajKpiListos", pedidos.filter(p => ["listo", "preparado"].includes(p.estado)).length);
  setText("cajKpiReparto", pedidos.filter(p => p.estado === "en reparto").length);

  const tbody = document.getElementById("tablaCajero");
  if (!tbody) return;

  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${badge(p.estado)}</td>
      <td>
        <button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ver detalle</button>
      </td>
    </tr>
  `).join("");
}

function renderCocina() {
  const tbody = document.getElementById("tablaCocina");
  if (!tbody) return;

  const cocinaPedidos = pedidos.filter(p =>
    ["recibido", "en preparación", "listo"].includes(p.estado)
  );

  if (cocinaPedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No hay pedidos pendientes en cocina.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cocinaPedidos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.producto}</td>
      <td>${p.indicaciones}</td>
      <td>${badge(p.estado)}</td>
      <td>
        <button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ver</button>
        <button class="btn" onclick="prepararPedido('${p.id}')">Preparar</button>
        <button class="btn green" onclick="pedidoListo('${p.id}')">Listo</button>
      </td>
    </tr>
  `).join("");
}

function renderMotorizado() {
  const tbody = document.getElementById("tablaMotorizado");
  if (!tbody) return;

  const lista = pedidos.filter(p =>
    ["preparado", "asignado", "en reparto"].includes(p.estado)
  );

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No tienes pedidos asignados por el momento.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${p.direccion}</td>
      <td>${badge(p.estado)}</td>
      <td>
        <button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ver entrega</button>
      </td>
    </tr>
  `).join("");
}

function renderAdmin() {
  setText("admTotal", pedidos.length);
  setText("admEntregados", pedidos.filter(p => p.estado === "entregado").length);
  setText("admPreparacion", pedidos.filter(p => p.estado === "en preparación").length);
  setText("admReparto", pedidos.filter(p => p.estado === "en reparto").length);

  const tbody = document.getElementById("tablaAdmin");
  if (!tbody) return;

  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${badge(p.estado)}</td>
      <td>${p.motorizado}</td>
      <td>
        <button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ver detalle</button>
      </td>
    </tr>
  `).join("");
}

function crearPedidoCliente() {
  const pedido = {
    id: generarId(),
    cliente: document.getElementById("cliNombre").value,
    telefono: document.getElementById("cliTelefono").value,
    direccion: document.getElementById("cliDireccion").value,
    producto: document.getElementById("cliProducto").value,
    pago: document.getElementById("cliPago").value,
    indicaciones: document.getElementById("cliIndicaciones").value,
    estado: "recibido",
    motorizado: "-"
  };

  if (!pedido.cliente || !pedido.telefono || !pedido.direccion) {
    toast("Completa los datos obligatorios del pedido.");
    return;
  }

  pedidos.push(pedido);
  selectedPedido = pedido.id;
  renderAll();
  toast("Pedido registrado correctamente.");
}

function registrarDesdeCaja() {
  const pedido = {
    id: generarId(),
    cliente: document.getElementById("cajNombre").value,
    telefono: document.getElementById("cajTelefono").value,
    direccion: document.getElementById("cajDireccion").value,
    producto: document.getElementById("cajProducto").value,
    pago: document.getElementById("cajPago").value,
    indicaciones: "Pedido validado desde caja.",
    estado: "recibido",
    motorizado: "-"
  };

  if (!pedido.cliente || !pedido.telefono || !pedido.direccion) {
    toast("Validación fallida: faltan datos del cliente o entrega.");
    return;
  }

  pedidos.push(pedido);
  selectedPedido = pedido.id;
  renderAll();
  toast("Pedido registrado y validado.");
}

function seleccionarPedido(id) {
  selectedPedido = id;
  const pedido = pedidos.find(p => p.id === id);

  renderDetallePedido(pedido);
  renderAll();

  if (currentRole === "motorizado") {
    setTimeout(() => dibujarRutaEnMapa(pedido), 250);
  }

  toast("Pedido seleccionado: " + pedido.id + " - " + pedido.cliente);
}

function enviarACocina() {
  const pedido = obtenerSeleccionado();

  if (!pedido) return;

  if (pedido.estado !== "recibido") {
    toast("Solo se puede enviar a cocina un pedido recibido.");
    return;
  }

  pedido.estado = "en preparación";
  renderAll();
  toast("Pedido enviado a cocina.");
}

function prepararPedido(id) {
  const pedido = pedidos.find(p => p.id === id);
  pedido.estado = "en preparación";
  selectedPedido = id;
  renderAll();
  toast("Cocina inició preparación del pedido.");
}

function pedidoListo(id) {
  const pedido = pedidos.find(p => p.id === id);
  pedido.estado = "listo";
  selectedPedido = id;
  renderAll();
  toast("Pedido marcado como listo.");
}

function validarDespacho() {
  const checks = [...document.querySelectorAll(".check")];
  const ok = checks.every(c => c.checked);
  const resultado = document.getElementById("checkResultado");

  if (!ok) {
    resultado.innerHTML = `
      <div class="error-box">
        No se puede validar el pedido. Falta completar el checklist.
      </div>
    `;
    toast("Checklist incompleto.");
    return;
  }

  let pedido = obtenerSeleccionado(false);

  if (!pedido) {
    pedido = pedidos.find(p => p.estado === "listo");
  }

  if (!pedido) {
    resultado.innerHTML = `
      <div class="error-box">
        No hay pedido listo para validar.
      </div>
    `;
    return;
  }

  pedido.estado = "preparado";

  resultado.innerHTML = `
    <div class="success-box">
      Pedido ${pedido.id} validado correctamente. Listo para reparto.
    </div>
  `;

  checks.forEach(c => c.checked = false);
  renderAll();
  toast("Pedido validado antes del despacho.");
}

function asignarMotorizado() {
  let pedido = obtenerSeleccionado(false);

  if (!pedido) {
    pedido = pedidos.find(p => ["listo", "preparado"].includes(p.estado));
  }

  if (!pedido) {
    toast("No hay pedidos listos o preparados para asignar.");
    return;
  }

  pedido.estado = "asignado";
  pedido.motorizado = "Miguel R.";
  selectedPedido = pedido.id;

  renderAll();
  toast("Pedido asignado a motorizado.");
}

function optimizarRuta() {
  const pedido = obtenerSeleccionado();

  if (!pedido) return;

  dibujarRutaEnMapa(pedido);

  document.getElementById("rutaInfo").innerHTML = `
    <strong>Ruta sugerida para ${pedido.id}</strong><br>
    Cliente: ${pedido.cliente}<br>
    Dirección: ${pedido.direccion}<br>
    Zona: ${obtenerDistrito(pedido.direccion)}<br>
    Distancia estimada: ${calcularDistanciaSimulada(pedido.direccion)} km<br>
    Tiempo estimado: ${calcularTiempoRuta(pedido.direccion)} minutos<br>
    Tráfico estimado: moderado<br>
    Recomendación: seguir la ruta sugerida y confirmar la entrega al llegar.
  `;

  toast("Ruta calculada correctamente en el mapa.");
}

function registrarSalida() {
  const pedido = obtenerSeleccionado();

  if (!pedido) return;

  if (!["asignado", "preparado"].includes(pedido.estado)) {
    toast("El pedido debe estar asignado antes de registrar salida.");
    return;
  }

  pedido.estado = "en reparto";
  renderAll();
  toast("Salida registrada.");
}

function registrarEntrega() {
  const pedido = obtenerSeleccionado();

  if (!pedido) return;

  if (pedido.estado !== "en reparto") {
    toast("Solo se puede entregar un pedido que esté en reparto.");
    return;
  }

  pedido.estado = "entregado";
  renderAll();
  toast("Entrega confirmada.");
}

function generarReporte() {
  toast("Reporte operativo generado.");
}

/* DETALLE */

function renderDetallePedido(pedido) {
  if (!pedido) return;

  const htmlDetalle = crearHtmlDetallePedido(pedido);

  const detalleCajero = document.getElementById("detalleCajero");
  const detalleCocina = document.getElementById("detalleCocina");
  const detalleMotorizado = document.getElementById("detalleMotorizado");
  const detalleAdmin = document.getElementById("detalleAdmin");

  if (detalleCajero) detalleCajero.innerHTML = htmlDetalle;
  if (detalleCocina) detalleCocina.innerHTML = htmlDetalle;
  if (detalleMotorizado) detalleMotorizado.innerHTML = crearHtmlDetalleEntrega(pedido);
  if (detalleAdmin) detalleAdmin.innerHTML = htmlDetalle;
}

function crearHtmlDetallePedido(pedido) {
  return `
    <div class="order-detail">
      <div class="order-detail-header">
        <h3>${pedido.id}</h3>
        <p>${pedido.producto}</p>
      </div>

      <div class="order-detail-body">
        <div class="detail-item">
          <span>Cliente</span>
          <strong>${pedido.cliente}</strong>
        </div>

        <div class="detail-item">
          <span>Teléfono</span>
          <strong>${pedido.telefono}</strong>
        </div>

        <div class="detail-item full-detail">
          <span>Dirección de entrega</span>
          <strong>${pedido.direccion}</strong>
        </div>

        <div class="detail-item">
          <span>Método de pago</span>
          <strong>${pedido.pago}</strong>
        </div>

        <div class="detail-item">
          <span>Estado actual</span>
          <strong>${badge(pedido.estado)}</strong>
        </div>

        <div class="detail-item">
          <span>Motorizado</span>
          <strong>${pedido.motorizado}</strong>
        </div>

        <div class="detail-item">
          <span>Tiempo estimado</span>
          <strong>${calcularTiempoEstimado(pedido.estado)}</strong>
        </div>

        <div class="detail-item full-detail">
          <span>Indicaciones</span>
          <strong>${pedido.indicaciones}</strong>
        </div>
      </div>

      <div class="status-history">
        <h4>Historial del pedido</h4>
        ${crearTimeline(pedido.estado)}
      </div>
    </div>
  `;
}

function crearHtmlDetalleEntrega(pedido) {
  return `
    <div class="order-detail">
      <div class="order-detail-header">
        <h3>${pedido.id}</h3>
        <p>Entrega asignada</p>
      </div>

      <div class="order-detail-body">
        <div class="detail-item">
          <span>Cliente</span>
          <strong>${pedido.cliente}</strong>
        </div>

        <div class="detail-item">
          <span>Teléfono</span>
          <strong>${pedido.telefono}</strong>
        </div>

        <div class="detail-item full-detail">
          <span>Dirección</span>
          <strong>${pedido.direccion}</strong>
        </div>

        <div class="detail-item">
          <span>Estado</span>
          <strong>${badge(pedido.estado)}</strong>
        </div>

        <div class="detail-item">
          <span>Pago</span>
          <strong>${pedido.pago}</strong>
        </div>

        <div class="detail-item full-detail">
          <span>Indicaciones de entrega</span>
          <strong>${pedido.indicaciones}</strong>
        </div>
      </div>
    </div>
  `;
}

function crearTimeline(estadoActual) {
  const estados = [
    "recibido",
    "en preparación",
    "listo",
    "preparado",
    "asignado",
    "en reparto",
    "entregado"
  ];

  const indexActual = estados.indexOf(estadoActual);

  return `
    <div class="timeline">
      ${estados.map((estado, index) => `
        <div class="timeline-item">
          <span class="timeline-dot ${index <= indexActual ? "done" : ""}"></span>
          <span>${formatearEstado(estado)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function formatearEstado(estado) {
  const nombres = {
    "recibido": "Pedido recibido",
    "en preparación": "Pedido en preparación",
    "listo": "Pedido listo",
    "preparado": "Pedido validado para despacho",
    "asignado": "Pedido asignado a motorizado",
    "en reparto": "Pedido en reparto",
    "entregado": "Pedido entregado"
  };

  return nombres[estado] || estado;
}

function calcularTiempoEstimado(estado) {
  const tiempos = {
    "recibido": "45 - 55 min",
    "en preparación": "35 - 45 min",
    "listo": "25 - 30 min",
    "preparado": "20 - 25 min",
    "asignado": "18 - 22 min",
    "en reparto": "10 - 18 min",
    "entregado": "Finalizado"
  };

  return tiempos[estado] || "Por calcular";
}

/* MAPA CON RUTA REAL */

function inicializarMapa() {
  const mapaDiv = document.getElementById("mapaRuta");
  if (!mapaDiv) return;

  if (typeof L === "undefined") {
    mapaDiv.innerHTML = "No se pudo cargar el mapa. Verifica tu conexión a internet.";
    return;
  }

  if (mapa) {
    setTimeout(() => mapa.invalidateSize(), 200);
    return;
  }

  const pizzaRaul = [-12.0772, -77.0826];

  mapa = L.map("mapaRuta").setView(pizzaRaul, 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(mapa);

  marcadorTienda = L.marker(pizzaRaul)
    .addTo(mapa)
    .bindPopup("🍕 Pizza Raúl<br>Local principal");

  marcadorTienda.openPopup();

  setTimeout(() => mapa.invalidateSize(), 300);
}

function obtenerCoordenadasCliente(direccion) {
  const texto = direccion.toLowerCase();

  if (texto.includes("san miguel")) return [-12.0764, -77.0928];
  if (texto.includes("pueblo libre")) return [-12.0769, -77.0677];
  if (texto.includes("magdalena")) return [-12.0916, -77.0715];
  if (texto.includes("la marina")) return [-12.0785, -77.0859];

  return [-12.0818, -77.0756];
}

function dibujarRutaEnMapa(pedido) {
  inicializarMapa();

  if (!mapa) return;

  const origen = [-12.0772, -77.0826];
  const destino = obtenerCoordenadasCliente(pedido.direccion);

  if (rutaControl) {
    mapa.removeControl(rutaControl);
  }

  if (marcadorCliente) {
    mapa.removeLayer(marcadorCliente);
  }

  marcadorCliente = L.marker(destino)
    .addTo(mapa)
    .bindPopup(`📍 Cliente<br>${pedido.cliente}<br>${pedido.direccion}`);

  rutaControl = L.Routing.control({
    waypoints: [
      L.latLng(origen[0], origen[1]),
      L.latLng(destino[0], destino[1])
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    show: false,
    lineOptions: {
      styles: [
        {
          color: "#e5092a",
          weight: 6,
          opacity: 0.9
        }
      ]
    },
    createMarker: function () {
      return null;
    }
  }).addTo(mapa);

  marcadorCliente.openPopup();

  setTimeout(() => mapa.invalidateSize(), 200);
}

function obtenerDistrito(direccion) {
  const texto = direccion.toLowerCase();

  if (texto.includes("san miguel")) return "San Miguel";
  if (texto.includes("pueblo libre")) return "Pueblo Libre";
  if (texto.includes("magdalena")) return "Magdalena";
  if (texto.includes("la marina")) return "La Marina";

  return "Destino del cliente";
}

function calcularDistanciaSimulada(direccion) {
  const texto = direccion.toLowerCase();

  if (texto.includes("san miguel")) return "3.2";
  if (texto.includes("pueblo libre")) return "4.8";
  if (texto.includes("magdalena")) return "5.6";
  if (texto.includes("la marina")) return "2.9";

  return "4.5";
}

function calcularTiempoRuta(direccion) {
  const texto = direccion.toLowerCase();

  if (texto.includes("san miguel")) return "14";
  if (texto.includes("pueblo libre")) return "18";
  if (texto.includes("magdalena")) return "22";
  if (texto.includes("la marina")) return "12";

  return "20";
}

/* UTILIDADES */

function obtenerSeleccionado(show = true) {
  if (!selectedPedido) {
    if (show) toast("Selecciona primero un pedido.");
    return null;
  }

  const pedido = pedidos.find(p => p.id === selectedPedido);

  if (!pedido && show) {
    toast("No se encontró el pedido seleccionado.");
  }

  return pedido;
}

function generarId() {
  return "PR-" + Math.floor(1000 + Math.random() * 9000);
}

function badge(estado) {
  const classMap = {
    "recibido": "recibido",
    "en preparación": "preparacion",
    "listo": "listo",
    "preparado": "preparado",
    "asignado": "asignado",
    "en reparto": "reparto",
    "entregado": "entregado",
    "incidencia": "incidencia"
  };

  return `<span class="badge ${classMap[estado]}">${estado.toUpperCase()}</span>`;
}

function isActive(current, list) {
  return list.includes(current) ? "active" : "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function limpiarDetalles() {
  const detalleCajero = document.getElementById("detalleCajero");
  const detalleCocina = document.getElementById("detalleCocina");
  const detalleMotorizado = document.getElementById("detalleMotorizado");
  const detalleAdmin = document.getElementById("detalleAdmin");
  const rutaInfo = document.getElementById("rutaInfo");

  if (detalleCajero) detalleCajero.innerHTML = "Selecciona una orden para visualizar información completa del pedido.";
  if (detalleCocina) detalleCocina.innerHTML = "Selecciona un pedido para ver productos, indicaciones y control de preparación.";
  if (detalleMotorizado) detalleMotorizado.innerHTML = "Selecciona un pedido para ver la información de entrega.";
  if (detalleAdmin) detalleAdmin.innerHTML = "Selecciona un pedido para ver el detalle administrativo.";
  if (rutaInfo) rutaInfo.innerHTML = "Selecciona un pedido asignado para calcular la ruta.";
}

function toast(msg) {
  const box = document.getElementById("toast");
  box.textContent = msg;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, 2800);
}