// Base de datos de Inventario (Cantidades iniciales)
let inventario = {
  "Masa base": 18,
  "Salsa (g)": 2000,
  "Queso (g)": 1200,
  "Pepperoni (porc)": 15,
  "Piña (porc)": 30,
  "Jamón (porc)": 40,
  "Pollo BBQ (porc)": 20,
  "Papas (porc)": 25,
  "Alitas (porc)": 30,
  "Gaseosa 1.5L": 10,
  "Cajas": 25
};

// Umbrales para alertas inteligentes del ERP
const umbralesInventario = {
  "Masa base": 20,
  "Salsa (g)": 1000,
  "Queso (g)": 1500,
  "Pepperoni (porc)": 20,
  "Gaseosa 1.5L": 15,
  "Cajas": 30
};

// Estandarización: Recetas y sus órdenes de producción
const recetas = {
  "Pizza Americana Familiar + Gaseosa": {
    ingredientes: { "Masa base": 1, "Salsa (g)": 150, "Queso (g)": 250, "Jamón (porc)": 1, "Gaseosa 1.5L": 1, "Cajas": 1 },
    pasos: ["Amasar y estirar masa", "Esparcir salsa y queso", "Distribuir jamón", "Hornear a 250°C", "Empacar con gaseosa"]
  },
  "Pizza Pepperoni Familiar": {
    ingredientes: { "Masa base": 1, "Salsa (g)": 150, "Queso (g)": 250, "Pepperoni (porc)": 1, "Cajas": 1 },
    pasos: ["Amasar y estirar masa", "Esparcir salsa y queso", "Distribuir pepperoni", "Hornear a 250°C", "Empacar en caja"]
  },
  "Combo Raúl Familiar": {
    ingredientes: { "Masa base": 1, "Salsa (g)": 150, "Queso (g)": 250, "Pepperoni (porc)": 1, "Papas (porc)": 1, "Gaseosa 1.5L": 1, "Cajas": 1 },
    pasos: ["Preparar pizza pepperoni", "Hornear pizza", "Freír papas", "Empacar combo completo"]
  }
};

const roleInfo = {
  cliente: { title: "Portal Cliente", desc: "Seguimiento de pedidos." },
  cajero: { title: "Cajero (Punto de Venta)", desc: "Registro y despacho." },
  cocina: { title: "Línea de Producción", desc: "Preparación y calidad." },
  motorizado: { title: "Logística y Reparto", desc: "Rutas y entregas." },
  admin: { title: "Administración (ERP)", desc: "Control total, financiero y stock." }
};

let currentRole = null;
let selectedPedido = null;
let mapa = null, rutaControl = null, marcadorTienda = null, marcadorCliente = null;

let pedidos = [
  { id: "PR-1001", cliente: "Luis Herrera", telefono: "999111222", direccion: "Av. Universitaria 1500, San Miguel", producto: "Pizza Americana Familiar + Gaseosa", pago: "Yape", indicaciones: "Enviar con ají.", estado: "recibido", motorizado: "-" },
  { id: "PR-1002", cliente: "Rosa Delgado", telefono: "988777444", direccion: "Jr. Lima 345, Pueblo Libre", producto: "Pizza Pepperoni Familiar", pago: "Tarjeta", indicaciones: "Sin orégano.", estado: "en preparación", motorizado: "-" },
  { id: "PR-1003", cliente: "Andrés Salazar", telefono: "955222111", direccion: "Calle Las Flores 811, Magdalena", producto: "Combo Raúl Familiar", pago: "Efectivo", indicaciones: "Pagar con 100 soles.", estado: "entregado", motorizado: "Miguel R." }
];

/* --- AUTH Y ERP NAV --- */
function toggleAuth(type) {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const btnSubmit = document.getElementById('authSubmitBtn');

  if (type === 'login') {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    btnSubmit.textContent = 'Ingresar al Sistema';
  } else {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    btnSubmit.textContent = 'Crear Cuenta';
  }
}

function iniciarSesion(e) {
  e.preventDefault();
  
  // 1. Capturamos los elementos del DOM
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  
  // 2. Extraemos los valores
  const email = emailInput.value;
  const password = passwordInput.value; // ¡Variable declarada!

  // 3. Lógica de validación
  // Se ha usado '1234' para ser coherente con el original y las expectativas más comunes, pero se puede cambiar.
  if (email.toLowerCase() === 'admin@pizzaraul.com' && (password === '1234' || password === 'admin123')) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    // Si es admin, mostramos el menú ERP
    document.getElementById('erpNav').classList.remove('hidden');
    cambiarVistaERP('admin');
    toast("Bienvenido Administrador");
  } else {
    // Lógica para usuarios normales u otros correos
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    document.getElementById('erpNav').classList.add('hidden');
    cambiarVistaERP('cajero');
    toast("Sesión iniciada");
  }
}

function logout() {
  currentRole = null; selectedPedido = null;
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
  document.getElementById('authForm').reset();
  limpiarDetalles();
  toast("Sesión cerrada");
}

function cambiarVistaERP(vistaDestino) {
  currentRole = vistaDestino;
  document.getElementById("roleTitle").textContent = roleInfo[vistaDestino].title;
  document.getElementById("roleDesc").textContent = roleInfo[vistaDestino].desc;
  document.getElementById("headerSubtitle").textContent = roleInfo[vistaDestino].desc;

  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(vistaDestino + 'View').classList.remove("hidden");
  
  if (vistaDestino === "motorizado" || vistaDestino === "admin") {
    setTimeout(inicializarMapa, 300);
  }
  renderAll();
}

/* --- RENDERERS --- */
function renderAll() {
  renderCliente(); renderCajero(); renderCocina(); renderMotorizado(); renderAdmin(); renderInventario();
  if (selectedPedido) {
    const p = pedidos.find(x => x.id === selectedPedido);
    if (p) renderDetallePedido(p);
  }
}

function renderCliente() {
  const box = document.getElementById("seguimientoCliente");
  if (!box) return;
  box.innerHTML = pedidos.slice().reverse().slice(0, 3).map(p => `
    <div class="order-tracking">
      <h3>${p.id} - ${p.producto}</h3>
      <p><strong>Cliente:</strong> ${p.cliente}<br><strong>Estado:</strong> ${badge(p.estado)}</p>
      <div class="tracking-line">
        <div class="tracking-step ${isActive(p.estado, ['recibido','en preparación','listo','preparado','asignado','en reparto','entregado'])}">Recibido</div>
        <div class="tracking-step ${isActive(p.estado, ['en preparación','listo','preparado','asignado','en reparto','entregado'])}">Cocina</div>
        <div class="tracking-step ${isActive(p.estado, ['asignado','en reparto','entregado'])}">Reparto</div>
        <div class="tracking-step ${isActive(p.estado, ['entregado'])}">Entregado</div>
      </div>
    </div>
  `).join("");
}

function renderCajero() {
  setText("cajKpiRecibidos", pedidos.filter(p => p.estado === "recibido").length);
  setText("cajKpiPendientes", pedidos.filter(p => p.estado === "en preparación").length);
  setText("cajKpiListos", pedidos.filter(p => ["listo", "preparado"].includes(p.estado)).length);
  setText("cajKpiReparto", pedidos.filter(p => p.estado === "en reparto").length);

  document.getElementById("tablaCajero").innerHTML = pedidos.map(p => `
    <tr><td>${p.id}</td><td>${p.cliente}</td><td>${badge(p.estado)}</td>
    <td><button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ver</button></td></tr>
  `).join("");
}

function renderCocina() {
  const pend = pedidos.filter(p => ["recibido", "en preparación", "listo"].includes(p.estado));
  document.getElementById("tablaCocina").innerHTML = pend.map(p => `
    <tr><td>${p.id}</td><td>${p.producto}</td><td>${badge(p.estado)}</td>
    <td><button class="btn blue" onclick="seleccionarPedido('${p.id}')">Receta</button>
    <button class="btn" onclick="prepararPedido('${p.id}')">Preparar</button></td></tr>
  `).join("");
}

function renderMotorizado() {
  const lista = pedidos.filter(p => ["preparado", "asignado", "en reparto"].includes(p.estado));
  document.getElementById("tablaMotorizado").innerHTML = lista.map(p => `
    <tr><td>${p.id}</td><td>${p.cliente}</td><td>${badge(p.estado)}</td>
    <td><button class="btn blue" onclick="seleccionarPedido('${p.id}')">Ruta</button></td></tr>
  `).join("");
}

function renderAdmin() {
  setText("admTotal", pedidos.length);
  setText("admEntregados", pedidos.filter(p => p.estado === "entregado").length);
  setText("admPreparacion", pedidos.filter(p => p.estado === "en preparación").length);
  setText("admReparto", pedidos.filter(p => p.estado === "en reparto").length);

  document.getElementById("tablaAdmin").innerHTML = pedidos.map(p => `
    <tr><td>${p.id}</td><td>${p.cliente}</td><td>${badge(p.estado)}</td><td>${p.motorizado}</td>
    <td><button class="btn blue" onclick="seleccionarPedido('${p.id}')">Auditar</button></td></tr>
  `).join("");
}

/* --- MÓDULO FINANCIERO / REPORTES --- */
function cierreCaja() {
  toast("💰 Procesando Cierre de Caja...");
  setTimeout(() => { toast("✅ Cierre exitoso. Total reportado: S/ 3,450.00."); }, 1800);
}

function generarReportePDF() {
  toast("📄 Compilando datos operativos y financieros...");
  setTimeout(() => { toast("✅ Reporte_PizzaRaul_Operaciones.pdf exportado con éxito."); }, 2000);
}

/* --- INVENTARIO INTELIGENTE --- */
function renderInventario() {
  const html = Object.keys(inventario).map(item => {
    const cantidad = inventario[item];
    const umbral = umbralesInventario[item] || 15;
    const alerta = cantidad <= umbral;
    const btn = alerta ? `<button class="btn-solicitar" onclick="solicitarAbastecimiento('${item}')">Solicitar Insumo</button>` : '';

    return `<div class="inv-item ${alerta ? 'low' : ''}">${item}<span>${cantidad}</span>${btn}</div>`;
  }).join("");

  const contCocina = document.getElementById("inventarioCocina");
  const contAdmin = document.getElementById("inventoryContainer");
  if (contCocina) contCocina.innerHTML = html;
  if (contAdmin) contAdmin.innerHTML = html;
}

function solicitarAbastecimiento(insumo) {
  toast(`📡 Enviando solicitud de [${insumo}] a Central / Sede principal...`);
  setTimeout(() => {
    inventario[insumo] += 50; 
    renderInventario(); 
    toast(`✅ Abastecimiento recibido: +50 unidades de ${insumo}.`);
  }, 2500);
}

/* --- ACCIONES --- */
function crearPedidoCliente() {
  const p = {
    id: "PR-" + Math.floor(1000+Math.random()*9000), cliente: document.getElementById("cliNombre").value,
    telefono: document.getElementById("cliTelefono").value, direccion: document.getElementById("cliDireccion").value,
    producto: document.getElementById("cliProducto").value, pago: document.getElementById("cliPago").value,
    indicaciones: document.getElementById("cliIndicaciones").value, estado: "recibido", motorizado: "-"
  };
  pedidos.push(p); selectedPedido = p.id; renderAll(); toast("Pedido registrado.");
}

function registrarDesdeCaja() {
  const p = {
    id: "PR-" + Math.floor(1000+Math.random()*9000), cliente: document.getElementById("cajNombre").value,
    telefono: document.getElementById("cajTelefono").value, direccion: document.getElementById("cajDireccion").value,
    producto: document.getElementById("cajProducto").value, pago: document.getElementById("cajPago").value,
    indicaciones: "Validado en caja.", estado: "recibido", motorizado: "-"
  };
  pedidos.push(p); selectedPedido = p.id; renderAll(); toast("Pedido registrado en caja.");
}

function seleccionarPedido(id) {
  selectedPedido = id; const p = pedidos.find(x => x.id === id);
  renderDetallePedido(p); renderAll();
  if (currentRole === "motorizado" || currentRole === "admin") { setTimeout(() => dibujarRutaEnMapa(p), 250); }
}

function enviarACocina() {
  const p = pedidos.find(x => x.id === selectedPedido);
  if(p && p.estado === "recibido") { p.estado = "en preparación"; renderAll(); toast("Enviado a cocina."); }
}
function prepararPedido(id) {
  const p = pedidos.find(x => x.id === id); p.estado = "en preparación"; selectedPedido = id; renderAll(); toast("Inicia preparación.");
}
function asignarMotorizado() {
  const p = pedidos.find(x => x.id === selectedPedido) || pedidos.find(x => ["listo", "preparado"].includes(x.estado));
  if(p) { p.estado = "asignado"; p.motorizado = "Miguel R."; selectedPedido = p.id; renderAll(); toast("Motorizado asignado."); }
}
function registrarSalida() {
  const p = pedidos.find(x => x.id === selectedPedido);
  if(p) { p.estado = "en reparto"; renderAll(); toast("Salió a reparto."); }
}
function registrarEntrega() {
  const p = pedidos.find(x => x.id === selectedPedido);
  if(p) { p.estado = "entregado"; renderAll(); toast("Entregado al cliente."); }
}

function validarDespacho() {
  const checks = [...document.querySelectorAll(".receta-check")];
  if(checks.length > 0 && !checks.every(c => c.checked)) { toast("Completa el checklist."); return; }
  const p = pedidos.find(x => x.id === selectedPedido);
  if(!p) return;
  const rec = recetas[p.producto];
  if (rec) { for (let i in rec.ingredientes) { inventario[i] = Math.max(0, inventario[i] - rec.ingredientes[i]); } }
  p.estado = "preparado"; renderAll(); toast("Orden completada. Inventario descontado.");
  const res = document.getElementById("checkResultado");
  if(res) res.innerHTML = `<div class="success-box">Orden validada. Inventario actualizado.</div>`;
}

/* --- DETALLES Y MAPA --- */
function renderDetallePedido(p) {
  const html = `
    <div class="order-detail">
      <div class="order-detail-header"><h3>${p.id}</h3><p>${p.producto}</p></div>
      <div class="order-detail-body">
        <div class="detail-item"><span>Cliente</span><strong>${p.cliente}</strong></div>
        <div class="detail-item full-detail"><span>Dirección</span><strong>${p.direccion}</strong></div>
        <div class="detail-item"><span>Estado</span><strong>${badge(p.estado)}</strong></div>
      </div>
    </div>
  `;
  ['Cajero', 'Motorizado', 'Admin'].forEach(v => { const el = document.getElementById(`detalle${v}`); if(el) el.innerHTML = html; });
  const dCoc = document.getElementById("detalleCocina");
  if(dCoc) {
    dCoc.innerHTML = html;
    document.getElementById("recetaChecklistContainer").classList.remove("hidden");
    const rec = recetas[p.producto] || { ingredientes:{}, pasos:["Preparar","Empacar"] };
    document.getElementById("checklistReceta").innerHTML = rec.pasos.map((paso, i) => `<label><span>${i+1}. ${paso}</span><input type="checkbox" class="check receta-check"></label>`).join("");
  }
}

function inicializarMapa() {
  const md = document.getElementById("mapaRuta");
  if (!md || typeof L === "undefined") return;
  if (mapa) { setTimeout(() => mapa.invalidateSize(), 200); return; }
  mapa = L.map("mapaRuta").setView([-12.0772, -77.0826], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapa);
  marcadorTienda = L.marker([-12.0772, -77.0826]).addTo(mapa).bindPopup("🍕 Pizza Raúl").openPopup();
  setTimeout(() => mapa.invalidateSize(), 300);
}

function optimizarRuta() {
  const p = pedidos.find(x => x.id === selectedPedido);
  if (!p) return;
  inicializarMapa();
  if (rutaControl) mapa.removeControl(rutaControl);
  if (marcadorCliente) mapa.removeLayer(marcadorCliente);
  
  const dest = p.direccion.toLowerCase().includes("san miguel") ? [-12.0764, -77.0928] : [-12.0818, -77.0756];
  marcadorCliente = L.marker(dest).addTo(mapa).bindPopup(`📍 ${p.cliente}`).openPopup();
  
  rutaControl = L.Routing.control({
    waypoints: [L.latLng(-12.0772, -77.0826), L.latLng(dest[0], dest[1])],
    routeWhileDragging: false, show: false,
    lineOptions: { styles: [{ color: "#e5092a", weight: 6, opacity: 0.9 }] },
    createMarker: () => null
  }).addTo(mapa);
  
  const ri = document.getElementById("rutaInfo");
  if (ri) ri.innerHTML = `<strong>Ruta calculada para ${p.id}</strong><br>Distancia: ~4.5 km<br>Tiempo: ~18 min`;
  toast("Ruta calculada en el mapa.");
}

function badge(e) { return `<span class="badge ${e === 'recibido'?'recibido':e==='en preparación'?'preparacion':e==='en reparto'?'reparto':e==='entregado'?'entregado':'listo'}">${e.toUpperCase()}</span>`; }
function isActive(c, l) { return l.includes(c) ? "active" : ""; }
function setText(id, v) { const e = document.getElementById(id); if(e) e.textContent = v; }
function limpiarDetalles() { ['Cajero','Cocina','Motorizado','Admin'].forEach(v => { const e = document.getElementById(`detalle${v}`); if(e) e.innerHTML = "Selecciona una orden."; }); }
function toast(m) { const b = document.getElementById("toast"); b.textContent = m; b.classList.add("show"); setTimeout(() => b.classList.remove("show"), 2800); }