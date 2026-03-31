const PWD = "oba2025";
const FB = {
  apiKey: "AIzaSyAUUgLnKnh1xUbCjis4nPoEzoLLrJp9loY",
  authDomain: "intranet-oba.firebaseapp.com",
  projectId: "intranet-oba",
  storageBucket: "intranet-oba.firebasestorage.app",
  messagingSenderId: "603055689454",
  appId: "1:603055689454:web:4e25c2a58f6a42c9c0adff"
};

const SECS = ["Bienvenida", "Huerta", "Bosque", "Afluente", "Corral", "Acantilado", "Monte Bajo", "Llanura", "Rivera", "Postres"];
const CATS = ["Bienvenida", "Huerta", "Bosque", "Afluente", "Corral", "Acantilado", "Monte Bajo", "Llanura", "Rivera", "Postres", "Base/Fermentos"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const SKILLS = ["Mise en place", "Fondos y salsas", "Carnes", "Pescados", "Pastelería", "Fermentos", "Limpieza y orden", "Trabajo en equipo"];
const ALERGEN_LIST = ["Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja", "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Dióxido de azufre", "Altramuces", "Moluscos"];
const COLLECTIONS = ["recipes", "ingredientes", "menu", "avisos", "proyectos", "eventos", "proveedores", "practicantes"];
const LOCAL_KEY = "oba_intranet_v3";
const GROQ = "https://api.groq.com/openai/v1/chat/completions";
const IASUGS = [
  "¿Qué platos tenemos en Bosque?",
  "Genera ficha de un plato con trucha",
  "Calcula pedido para 40 cubiertos",
  "¿Ingredientes para la Torcaz en Nabos?",
  "Ideas para plato de temporada con setas",
  "Redacta aviso para el equipo",
  "Traduce al inglés: Cuajada de Castañas",
  "Sugiere maridaje para el pase de Huerta"
];

const DR = [
  {
    id: 1,
    nombre: "Espárrago con Salsa de Acederas",
    seccion: "Huerta",
    temporada: "Primavera",
    descripcion: "Espárrago de temporada con salsa de acederas.",
    ingredientes: [{ i: "Espárragos frescos", c: "", u: "kg" }, { i: "Acederas", c: "", u: "manojo" }],
    pasos: ["Limpiar y pelar los espárragos.", "Elaborar salsa de acederas.", "Emplatar al pase."],
    notas: "Cambia semanalmente."
  },
  {
    id: 2,
    nombre: "Cuajada de Castañas con Aceite de Pino",
    seccion: "Bosque",
    temporada: "Otoño",
    descripcion: "Cuajada de castañas con aceite de pino al final.",
    ingredientes: [
      { i: "Castañas", c: "", u: "kg" },
      { i: "Agua de setas", c: "", u: "ml" },
      { i: "Aceite de pino", c: "", u: "ml" }
    ],
    pasos: ["Elaborar base de cuajada.", "Añadir agua de setas.", "Servir con aceite de pino al final."],
    notas: ""
  },
  {
    id: 3,
    nombre: "Truchas en Manteca",
    seccion: "Afluente",
    temporada: "Todo el año",
    descripcion: "Trucha confitada en manteca de cerdo.",
    ingredientes: [{ i: "Trucha de río", c: "", u: "ud" }, { i: "Manteca de cerdo", c: "", u: "g" }, { i: "Ajo", c: "", u: "diente" }],
    pasos: ["Limpiar y filetear la trucha.", "Confitar en manteca a baja temperatura.", "Servir con jugo de manteca."],
    notas: ""
  },
  {
    id: 4,
    nombre: "Gallina Dorada en Pebre",
    seccion: "Corral",
    temporada: "Todo el año",
    descripcion: "Pechuga de gallina, albóndiga con azafrán y andrajos.",
    ingredientes: [{ i: "Gallina entera", c: "", u: "ud" }, { i: "Azafrán", c: "", u: "g" }, { i: "Perejil", c: "", u: "manojo" }],
    pasos: ["Dorar la gallina.", "Preparar albóndigas con azafrán.", "Elaborar andrajos.", "Emplatar con beurre blanc."],
    notas: ""
  },
  {
    id: 5,
    nombre: "Torcaz en Nabos",
    seccion: "Acantilado",
    temporada: "Otoño-Invierno",
    descripcion: "Paloma torcaz en shio koji con nabo.",
    ingredientes: [{ i: "Paloma torcaz", c: "", u: "ud" }, { i: "Nabos", c: "", u: "kg" }, { i: "Shio koji", c: "", u: "g" }],
    pasos: ["Marinar la paloma en shio koji 24-48h.", "Asar a la brasa.", "Cocinar nabos en manteca."],
    notas: ""
  },
  {
    id: 6,
    nombre: "Oveja a la Etelvina",
    seccion: "Llanura",
    temporada: "Todo el año",
    descripcion: "Royal de oveja, lengua en roner y seso frito.",
    ingredientes: [{ i: "Oveja", c: "", u: "kg" }, { i: "Suero de calostro", c: "", u: "ml" }],
    pasos: ["Preparar royal de oveja.", "Cocer lengua en roner 72h.", "Freír el seso."],
    notas: ""
  },
  {
    id: 7,
    nombre: "Pâté de Fruit",
    seccion: "Postres",
    temporada: "Todo el año",
    descripcion: "Pâté de fruit con tomillo y melisa.",
    ingredientes: [
      { i: "Agua", c: "500", u: "ml" },
      { i: "Azúcar", c: "360", u: "g" },
      { i: "Pectina", c: "14", u: "g" },
      { i: "Glucosa", c: "100", u: "g" }
    ],
    pasos: ["Infusionar tomillo en agua.", "Mezclar azúcar con pectina.", "Cocer hasta 106°C.", "Añadir ácido cítrico y verter en moldes."],
    notas: "Temperatura: 106°C."
  }
];

const DI = [
  { id: 1, ing: "Trucha de río", platos: "Truchas en manteca", cat: "Afluente", prov: "", cant: "" },
  { id: 2, ing: "Paloma torcaz", platos: "Torcaz en nabos", cat: "Acantilado", prov: "", cant: "" },
  { id: 3, ing: "Gallina entera", platos: "Gallina dorada en pebre", cat: "Corral", prov: "", cant: "" },
  { id: 4, ing: "Espárragos frescos", platos: "Pase huerta", cat: "Huerta", prov: "", cant: "" },
  { id: 5, ing: "Acederas", platos: "Salsa de acederas", cat: "Huerta", prov: "", cant: "" },
  { id: 6, ing: "Colmenillas", platos: "Escabeche de colmenillas", cat: "Bosque", prov: "", cant: "" },
  { id: 7, ing: "Castañas", platos: "Cuajada de castañas", cat: "Bosque", prov: "", cant: "" },
  { id: 8, ing: "Shio koji", platos: "Paloma torcaz · Entresijos", cat: "Base/Fermentos", prov: "", cant: "" },
  { id: 9, ing: "Mantequilla", platos: "Beurre blanc · Holandesa", cat: "Base/Fermentos", prov: "", cant: "" },
  { id: 10, ing: "Pectina", platos: "Pâté de fruit", cat: "Base/Fermentos", prov: "", cant: "" }
];

const DEFAULTS = {
  recipes: DR,
  ingredientes: DI,
  menu: [{ id: 1, plato: "Espárrago con Salsa de Acederas", seccion: "Huerta", estado: "activo", fecha: today(), nota: "Cambia según cosecha" }],
  avisos: [{ id: 1, titulo: "Bienvenida a la intranet OBA", texto: "Aquí encontraréis recetas, pedidos, avisos y novedades del restaurante.", urgente: false, fecha: today(), autor: "Dirección" }],
  proyectos: [
    { id: 1, nombre: "Alita de pollo rellena", descripcion: "Receta por testear.", estado: "testeo", responsable: "Cocina", fecha: today(), notas: "" },
    { id: 2, nombre: "Menú maridaje NATURA", descripcion: "Desarrollar los 8 maridajes por sección.", estado: "activo", responsable: "Sala + Cocina", fecha: today(), notas: "" }
  ],
  eventos: [{ id: 1, titulo: "Inicio temporada", fecha: today(), tipo: "especial", urgente: false, nota: "" }],
  proveedores: [],
  practicantes: []
};

let db = null;
let storageMode = "local";
let D = cloneDefaults();
let nid = 500;
let cY = new Date().getFullYear();
let cM = new Date().getMonth();
let pedT = "lista";
let pedSort = false;
let activeRecipeId = null;
let iaH = [];
let deferredPrompt = null;
let printRecipeMarkup = "";

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function safeText(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function today() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function logoWhiteUrl() {
  return new URL("./icons/oba-logo-white.png", location.href).href;
}

function computeNextId() {
  const ids = COLLECTIONS.flatMap((col) => (D[col] || []).map((item) => Number(item.id) || 0)).filter(Boolean);
  nid = ids.length ? Math.max(...ids) + 1 : 500;
}

function updateStorageStatus() {
  const el = document.getElementById("ls-sub");
  if (!el) return;
  el.textContent = storageMode === "firebase" ? "Intranet conectada" : "Modo local activo";
}

function showError(message) {
  const sub = document.getElementById("ls-sub");
  const form = document.getElementById("lf");
  if (sub) sub.innerHTML = `<span style="color:#f2aca4">Error: ${safeText(message)}</span>`;
  if (form) {
    form.innerHTML = `<button class="primary-btn" onclick="location.reload()">Reintentar</button>`;
    form.style.display = "flex";
  }
}

function showLoginForm() {
  updateStorageStatus();
  const form = document.getElementById("lf");
  if (form) form.style.display = "flex";
  if (sessionStorage.getItem("oba-auth") === "1") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("visible");
    startApp();
  }
}

async function initData() {
  try {
    const canUseFirebase = typeof firebase !== "undefined" && location.protocol !== "file:";
    if (canUseFirebase) {
      firebase.initializeApp(FB);
      db = firebase.firestore();
      await loadFromFirebase();
      storageMode = "firebase";
    } else {
      loadFromLocal();
      storageMode = "local";
    }
  } catch (error) {
    console.warn("Firebase no disponible, usando local:", error);
    storageMode = "local";
    loadFromLocal();
  }
  computeNextId();
  showLoginForm();
}

function loadFromLocal() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) {
    D = cloneDefaults();
    persistLocal();
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    D = cloneDefaults();
    COLLECTIONS.forEach((col) => {
      if (Array.isArray(parsed[col])) D[col] = parsed[col];
    });
  } catch (error) {
    console.warn("Error leyendo localStorage:", error);
    D = cloneDefaults();
    persistLocal();
  }
}

function persistLocal() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(D));
}

async function loadFromFirebase() {
  const cols = [...COLLECTIONS];
  for (const col of cols) {
    const snap = await db.collection(col).get();
    if (snap.empty) {
      D[col] = JSON.parse(JSON.stringify(DEFAULTS[col]));
      await saveCol(col);
    } else {
      const items = snap.docs.map((doc) => doc.data()).sort((a, b) => (a._i || 0) - (b._i || 0));
      D[col] = items.map(({ _i, ...rest }) => rest);
    }
  }

  cols.forEach((col) => {
    db.collection(col).onSnapshot((snap) => {
      if (snap.empty) return;
      const items = snap.docs.map((doc) => doc.data()).sort((a, b) => (a._i || 0) - (b._i || 0));
      D[col] = items.map(({ _i, ...rest }) => rest);
      computeNextId();
      renderAll();
    });
  });
}

async function saveCol(col) {
  const batch = db.batch();
  const snap = await db.collection(col).get();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  D[col].forEach((item, index) => {
    const id = item.id != null ? String(item.id) : String(index);
    batch.set(db.collection(col).doc(id), { ...item, _i: index });
  });
  await batch.commit();
}

function save(col) {
  computeNextId();
  if (storageMode === "firebase" && db) {
    saveCol(col).catch((error) => console.warn("Save error:", error));
  } else {
    persistLocal();
  }
  renderAll();
}

function login() {
  const input = document.getElementById("pwd");
  const errorEl = document.getElementById("le");
  if (!input) return;
  if (input.value === PWD) {
    sessionStorage.setItem("oba-auth", "1");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("visible");
    startApp();
  } else if (errorEl) {
    errorEl.textContent = "Contraseña incorrecta";
    setTimeout(() => {
      errorEl.textContent = "";
    }, 2000);
  }
}

function logout() {
  sessionStorage.removeItem("oba-auth");
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app").classList.remove("visible");
  const pwd = document.getElementById("pwd");
  if (pwd) pwd.value = "";
}

function startApp() {
  const label = formatLongDate(new Date());
  document.getElementById("hdate").textContent = label;
  document.getElementById("ifecha").textContent = `${label}. Todo lo importante está aquí, sin perderse en pestañas.`;
  renderAll();
  const hash = location.hash;
  if (hash.startsWith("#receta-")) {
    const id = Number(hash.replace("#receta-", ""));
    if (!Number.isNaN(id)) {
      setTimeout(() => {
        sp("recetario");
        oRD(id);
      }, 250);
    }
  }
}

function renderAll() {
  if (!document.getElementById("app").classList.contains("visible")) return;
  rInicio();
  rRec();
  rPedLista();
  if (pedT === "resumen") rPedRes();
  if (pedT === "prov") rPedProv();
  rMenu();
  calRender();
  rPrac();
  rProj();
  rAv();
}

function sp(id) {
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`panel-${id}`)?.classList.add("active");
  document.querySelector(`.nav-btn[data-panel="${id}"]`)?.classList.add("active");
}

function bsec(section) {
  const map = { Bosque: "bosque", Afluente: "fluvial", Rivera: "fluvial", Corral: "corral", Caza: "caza", Acantilado: "caza", "Monte Bajo": "caza", Llanura: "corral", Postres: "postre", Huerta: "huerta", Bienvenida: "base" };
  return `<span class="badge b-${map[section] || "base"}">${safeText(section)}</span>`;
}

function bcat(category) {
  const map = { Bosque: "bosque", Afluente: "fluvial", Rivera: "fluvial", Corral: "corral", Caza: "caza", Acantilado: "caza", "Monte Bajo": "caza", Llanura: "corral", Postre: "postre", Postres: "postre", Huerta: "huerta", Bienvenida: "base", "Base/Fermentos": "base" };
  return `<span class="badge b-${map[category] || "base"}">${safeText(category)}</span>`;
}

function oModal(html) {
  document.getElementById("mi").innerHTML = html;
  document.getElementById("modal").classList.add("open");
  setTimeout(() => {
    document.querySelector("#mi input, #mi textarea, #mi select")?.focus();
  }, 60);
}

function cModal() {
  document.getElementById("modal").classList.remove("open");
}

function rInicio() {
  const urgent = D.avisos.filter((item) => item.urgente);
  document.getElementById("iurg").innerHTML = urgent.length
    ? urgent.map((item) => `<div class="notice urgent"><strong>${safeText(item.titulo)}</strong><div>${safeText(item.texto)}</div><div class="nd">${safeText(item.autor)} · ${safeText(item.fecha)}</div></div>`).join("")
    : `<div class="notice"><strong>Todo en orden</strong><div>No hay avisos urgentes ahora mismo.</div></div>`;

  const stats = [
    { label: "Platos en recetario", value: D.recipes.length, section: "recetario" },
    { label: "Ingredientes activos", value: D.ingredientes.length, section: "pedidos" },
    { label: "Practicantes activos", value: D.practicantes.filter((item) => item.estado === "activo").length, section: "practicantes" },
    { label: "Proyectos activos", value: D.proyectos.filter((item) => item.estado === "activo").length, section: "proyectos" }
  ];

  document.getElementById("icards").innerHTML = stats.map((stat) => `
    <button class="stat-card" onclick="sp('${stat.section}')">
      <div class="eyebrow">OBA</div>
      <strong>${stat.value}</strong>
      <span>${safeText(stat.label)}</span>
    </button>`).join("");

  const activeMenu = D.menu.filter((item) => item.estado === "activo").slice(0, 3);
  const upcoming = [...D.eventos]
    .filter((event) => event.fecha >= today())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 4);
  const lastNotice = D.avisos[D.avisos.length - 1];

  let feed = "";
  if (activeMenu.length) {
    feed += `<div class="notice"><strong>Menú activo</strong><div>${activeMenu.map((item) => `${safeText(item.plato)} (${safeText(item.seccion)})`).join(" · ")}</div></div>`;
  }
  if (upcoming.length) {
    feed += upcoming.map((item) => `<div class="notice"><strong>${safeText(item.titulo)}</strong><div>${safeText(item.nota || "Evento programado")}</div><div class="nd">${safeText(item.fecha)}</div></div>`).join("");
  }
  if (lastNotice) {
    feed += `<div class="notice"><strong>Último aviso</strong><div>${safeText(lastNotice.titulo)}</div><div class="nd">${safeText(lastNotice.autor)} · ${safeText(lastNotice.fecha)}</div></div>`;
  }
  document.getElementById("today-feed").innerHTML = feed || `<div class="notice"><strong>Sin actividad pendiente</strong><div>No hay elementos destacados para hoy.</div></div>`;
}

function rRec() {
  const q = (document.getElementById("rsearch")?.value || "").toLowerCase();
  const cat = document.getElementById("rcat")?.value || "";
  const list = D.recipes.filter((recipe) => {
    const matchesSearch = !q || recipe.nombre.toLowerCase().includes(q) || recipe.seccion.toLowerCase().includes(q) || (recipe.descripcion || "").toLowerCase().includes(q);
    const matchesCat = !cat || recipe.seccion === cat;
    return matchesSearch && matchesCat;
  });

  document.getElementById("rcards").innerHTML = list.length ? list.map((recipe) => {
    const subs = recipe.subrecetas || [];
    return `
      <article class="card">
        ${bsec(recipe.seccion)}
        <h3>${safeText(recipe.nombre)}</h3>
        <p>${safeText(recipe.descripcion || "Sin descripción")}</p>
        <div class="cmeta">
          ${recipe.temporada ? `Temporada: ${safeText(recipe.temporada)}` : ""}
          ${recipe.tiempoElaboracion ? ` · ${safeText(recipe.tiempoElaboracion)}` : ""}
          ${recipe.raciones ? ` · ${safeText(recipe.raciones)} raciones` : ""}
          ${subs.length ? `<br>+ ${subs.length} subreceta${subs.length > 1 ? "s" : ""}` : ""}
        </div>
        <div class="ca">
          <button class="btn btn-s" onclick="oRD(${recipe.id})">Ver ficha</button>
          <button class="btn btn-o btn-s" onclick="oRM(${recipe.id})">Editar</button>
          <button class="btn btn-s btn-d" onclick="dRec(${recipe.id})">Eliminar</button>
        </div>
      </article>`;
  }).join("") : `<div class="notice"><strong>Sin resultados</strong><div>No se encontraron platos con ese filtro.</div></div>`;
}

function buildFichaHTML(recipe) {
  const subs = recipe.subrecetas || [];
  const alerg = recipe.alergenos || [];
  const photo = recipe.foto ? `<img src="${recipe.foto}" alt="${safeText(recipe.nombre)}" style="width:100%;max-height:280px;object-fit:cover;border-radius:24px;margin-bottom:20px">` : "";
  const ingredients = (recipe.ingredientes || []).length ? `
    <div class="rs">
      <h4>Ingredientes principales</h4>
      <div class="ig">
        <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
        ${(recipe.ingredientes || []).map((item) => `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(item.c || "—")}</div><div>${safeText(item.u || "")}</div>`).join("")}
      </div>
    </div>` : "";
  const subsHtml = subs.map((sub) => `
    <div class="rs">
      <h4>Subreceta · ${safeText(sub.nombre)}</h4>
      ${sub.descripcion ? `<p style="margin-bottom:10px;color:#5e5a54">${safeText(sub.descripcion)}</p>` : ""}
      ${(sub.ingredientes || []).length ? `
        <div class="ig" style="margin-bottom:14px">
          <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
          ${(sub.ingredientes || []).map((item) => `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(item.c || "—")}</div><div>${safeText(item.u || "")}</div>`).join("")}
        </div>` : ""}
      ${(sub.pasos || []).length ? `<ol class="sl">${sub.pasos.map((step, index) => `<li><div class="sn">${index + 1}</div><div>${safeText(step)}</div></li>`).join("")}</ol>` : ""}
    </div>`).join("");
  const steps = (recipe.pasos || []).length ? `
    <div class="rs">
      <h4>Elaboración final</h4>
      <ol class="sl">${recipe.pasos.map((step, index) => `<li><div class="sn">${index + 1}</div><div>${safeText(step)}</div></li>`).join("")}</ol>
    </div>` : "";
  const alergHtml = alerg.length ? `
    <div class="rs">
      <h4>Alérgenos</h4>
      <div class="ca">${alerg.map((item) => `<span class="badge" style="border-color:#b84337;color:#b84337">${safeText(item)}</span>`).join("")}</div>
    </div>` : "";

  return `
    <div class="recipe-brand">
      <img class="logo-mark logo-mark-black" src="${logoWhiteUrl()}" alt="OBA">
    </div>
    ${photo}
    <div class="rs">
      <h4>Información general</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
        ${recipe.seccion ? `<div><strong>Sección:</strong> ${safeText(recipe.seccion)}</div>` : ""}
        ${recipe.temporada ? `<div><strong>Temporada:</strong> ${safeText(recipe.temporada)}</div>` : ""}
        ${recipe.raciones ? `<div><strong>Raciones:</strong> ${safeText(recipe.raciones)}</div>` : ""}
        ${recipe.tiempoElaboracion ? `<div><strong>Tiempo:</strong> ${safeText(recipe.tiempoElaboracion)}</div>` : ""}
        ${recipe.temperatura ? `<div><strong>Temperatura:</strong> ${safeText(recipe.temperatura)}</div>` : ""}
      </div>
      ${recipe.descripcion ? `<p style="margin-top:12px">${safeText(recipe.descripcion)}</p>` : ""}
    </div>
    ${ingredients}
    ${subsHtml}
    ${steps}
    ${alergHtml}
    ${recipe.notas ? `<div class="notice"><strong>Notas</strong><div>${safeText(recipe.notas)}</div></div>` : ""}`;
}

function oRD(id) {
  const recipe = D.recipes.find((item) => item.id === id);
  if (!recipe) return;
  activeRecipeId = id;
  history.replaceState(null, "", `#receta-${id}`);
  document.getElementById("rdtit").textContent = recipe.nombre;
  printRecipeMarkup = buildFichaHTML(recipe);
  document.getElementById("rdbody").innerHTML = printRecipeMarkup;
  document.getElementById("rdet").classList.add("open");
}

function printFicha() {
  if (!activeRecipeId) return;
  const recipe = D.recipes.find((item) => item.id === activeRecipeId);
  if (!recipe) return;
  const printLogo = logoWhiteUrl();
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${safeText(recipe.nombre)}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;line-height:1.5;color:#111}
      h1{font-size:28px;margin-bottom:12px}
      h4{font-size:12px;text-transform:uppercase;letter-spacing:.12em;border-bottom:1px solid #ddd;padding-bottom:8px;margin:18px 0 12px}
      .notice{padding:12px 14px;border-left:4px solid #5f7f4c;background:#eef3ea}
      .ig{display:grid;grid-template-columns:1fr auto auto;gap:8px 14px}
      .sl{list-style:none;padding:0}
      .sl li{display:flex;gap:10px;margin-bottom:10px;padding:10px;background:#f6f4ee}
      .sn{font-weight:700;color:#405735}
      img{max-width:100%;display:block}
      .recipe-brand{display:none}
      .print-brand{position:fixed;top:24px;right:24px}
      .print-brand img{width:104px;height:auto;display:block;filter:invert(1);background:transparent;border:none;box-shadow:none}
    </style>
  </head>
  <body>
    <div class="print-brand"><img src="${printLogo}" alt="OBA"></div>
    <h1>${safeText(recipe.nombre)}</h1>
    ${printRecipeMarkup}
  </body>
  </html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
}

function cRD() {
  document.getElementById("rdet").classList.remove("open");
  history.replaceState(null, "", "#");
  activeRecipeId = null;
}

function oRM(id) {
  const recipe = id ? D.recipes.find((item) => item.id === id) : null;
  const subs = recipe?.subrecetas || [];
  const alerg = recipe?.alergenos || [];
  oModal(`
    <h3>${recipe ? "Editar plato" : "Nuevo plato"}</h3>
    <div class="fr"><label>Nombre *</label><input id="rn" value="${safeText(recipe?.nombre || "")}"></div>
    <div class="fr"><label>Sección</label><select id="rs">${SECS.map((section) => `<option${recipe?.seccion === section ? " selected" : ""}>${section}</option>`).join("")}</select></div>
    <div class="fr"><label>Temporada</label><input id="rt" value="${safeText(recipe?.temporada || "")}"></div>
    <div class="fr"><label>Descripción</label><textarea id="rd">${safeText(recipe?.descripcion || "")}</textarea></div>
    <div class="fr"><label>Raciones</label><input id="rrac" value="${safeText(recipe?.raciones || "")}" placeholder="Ej: 4"></div>
    <div class="fr"><label>Tiempo de elaboración</label><input id="rtiem" value="${safeText(recipe?.tiempoElaboracion || "")}" placeholder="Ej: 2h 30m"></div>
    <div class="fr"><label>Temperatura de servicio</label><input id="rtemp" value="${safeText(recipe?.temperatura || "")}" placeholder="Ej: 65°C"></div>
    <div class="fr"><label>Foto del plato</label><input type="file" id="rfoto-file" accept="image/*"></div>
    <div class="fr"><label>Alérgenos</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
        ${ALERGEN_LIST.map((item) => `<label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:12px"><input type="checkbox" id="al_${item.replace(/\s/g, "_")}" ${alerg.includes(item) ? "checked" : ""}> ${item}</label>`).join("")}
      </div>
    </div>
    <div class="fr"><label>Ingredientes principales (nombre|cantidad|unidad)</label><textarea id="ri">${recipe ? recipe.ingredientes.map((item) => `${item.i}|${item.c}|${item.u}`).join("\n") : ""}</textarea></div>
    <div class="fr"><label>Subrecetas</label>
      <div id="subs-container">${subs.map((sub, index) => subEditorHtml(sub, index)).join("")}</div>
      <button class="secondary-btn" type="button" onclick="addSub()">Añadir subreceta</button>
    </div>
    <div class="fr"><label>Elaboración final (un paso por línea)</label><textarea id="rp">${recipe ? recipe.pasos.join("\n") : ""}</textarea></div>
    <div class="fr"><label>Notas</label><input id="rno" value="${safeText(recipe?.notas || "")}"></div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sRec(${id || "null"})">Guardar</button>
    </div>`);
  window._subCount = subs.length;
}

function subEditorHtml(sub = {}, index) {
  return `
    <div class="sub-block" data-idx="${index}" style="padding:12px;border-radius:18px;background:#fff;margin-bottom:10px;box-shadow:inset 0 0 0 1px #d7d0c5">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>Subreceta ${index + 1}</strong>
        <button class="btn btn-s btn-d" type="button" onclick="removeSub(${index})">Eliminar</button>
      </div>
      <input id="sn_${index}" placeholder="Nombre" value="${safeText(sub.nombre || "")}" style="margin-bottom:8px">
      <textarea id="sd_${index}" placeholder="Descripción" style="margin-bottom:8px">${safeText(sub.descripcion || "")}</textarea>
      <textarea id="si_${index}" placeholder="Ingredientes (nombre|cant|unidad)" style="margin-bottom:8px">${(sub.ingredientes || []).map((item) => `${item.i}|${item.c}|${item.u}`).join("\n")}</textarea>
      <textarea id="sp_${index}" placeholder="Elaboración (un paso por línea)">${(sub.pasos || []).join("\n")}</textarea>
    </div>`;
}

function addSub() {
  const index = window._subCount || 0;
  document.getElementById("subs-container").insertAdjacentHTML("beforeend", subEditorHtml({}, index));
  window._subCount = index + 1;
}

function removeSub(index) {
  document.querySelector(`.sub-block[data-idx="${index}"]`)?.remove();
}

function sRec(id) {
  const name = document.getElementById("rn").value.trim();
  if (!name) return alert("El nombre es obligatorio");

  const subrecetas = [];
  document.querySelectorAll(".sub-block").forEach((block) => {
    const idx = block.dataset.idx;
    const subName = document.getElementById(`sn_${idx}`)?.value.trim();
    if (!subName) return;
    subrecetas.push({
      nombre: subName,
      descripcion: document.getElementById(`sd_${idx}`)?.value || "",
      ingredientes: (document.getElementById(`si_${idx}`)?.value || "").split("\n").filter(Boolean).map((line) => {
        const [i, c, u] = line.split("|");
        return { i: i || "", c: c || "", u: u || "" };
      }),
      pasos: (document.getElementById(`sp_${idx}`)?.value || "").split("\n").filter(Boolean)
    });
  });

  const alergenos = ALERGEN_LIST.filter((item) => document.getElementById(`al_${item.replace(/\s/g, "_")}`)?.checked);
  const currentPhoto = id ? D.recipes.find((item) => item.id === id)?.foto || "" : "";
  const fileInput = document.getElementById("rfoto-file");

  const doSave = (photoData) => {
    const payload = {
      nombre: name,
      seccion: document.getElementById("rs").value,
      temporada: document.getElementById("rt").value,
      descripcion: document.getElementById("rd").value,
      raciones: document.getElementById("rrac").value,
      tiempoElaboracion: document.getElementById("rtiem").value,
      temperatura: document.getElementById("rtemp").value,
      foto: photoData,
      alergenos,
      ingredientes: document.getElementById("ri").value.split("\n").filter(Boolean).map((line) => {
        const [i, c, u] = line.split("|");
        return { i: i || "", c: c || "", u: u || "" };
      }),
      subrecetas,
      pasos: document.getElementById("rp").value.split("\n").filter(Boolean),
      notas: document.getElementById("rno").value
    };
    if (id) Object.assign(D.recipes.find((item) => item.id === id), payload);
    else D.recipes.push({ id: nid++, ...payload });
    save("recipes");
    cModal();
  };

  if (fileInput?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = (event) => doSave(event.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    doSave(currentPhoto);
  }
}

function dRec(id) {
  if (!confirm("¿Eliminar este plato?")) return;
  D.recipes = D.recipes.filter((item) => item.id !== id);
  save("recipes");
}

function pedSearch() {
  return (document.getElementById("ped-search")?.value || "").toLowerCase().trim();
}

function onPedSearch() {
  if (pedT === "lista") rPedLista();
  if (pedT === "resumen") rPedRes();
  if (pedT === "prov") rPedProv();
}

function toggleSort() {
  pedSort = !pedSort;
  const btn = document.getElementById("pt-sort");
  if (btn) btn.textContent = pedSort ? "A→Z ✓" : "A→Z";
  onPedSearch();
}

function pedTab(tab) {
  pedT = tab;
  ["lista", "resumen", "prov"].forEach((item) => {
    document.getElementById(`pp-${item}`).style.display = item === tab ? "block" : "none";
    document.getElementById(`pt-${item}`)?.classList.toggle("active", item === tab);
  });
  onPedSearch();
}

function rPedLista() {
  const q = pedSearch();
  let items = q ? D.ingredientes.filter((item) => item.ing.toLowerCase().includes(q) || (item.prov || "").toLowerCase().includes(q) || (item.platos || "").toLowerCase().includes(q)) : D.ingredientes;
  if (pedSort) items = [...items].sort((a, b) => a.ing.localeCompare(b.ing, "es"));

  document.getElementById("pp-lista").innerHTML = `
    <div class="table-shell">
      <table>
        <thead>
          <tr>
            <th style="width:24%">Ingrediente</th>
            <th style="width:22%">Platos</th>
            <th style="width:14%">Categoría</th>
            <th style="width:22%">Proveedor</th>
            <th style="width:12%">Cantidad</th>
            <th style="width:6%"></th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td style="font-weight:700">${safeText(item.ing)}</td>
              <td>${safeText(item.platos || "")}</td>
              <td>${bcat(item.cat)}</td>
              <td>${D.proveedores.length ? `
                <select onchange="uIng(${item.id},'prov',this.value)">
                  ${D.proveedores.map((prov) => `<option value="${safeText(prov.nombre)}"${item.prov === prov.nombre ? " selected" : ""}>${safeText(prov.nombre)}</option>`).join("")}
                  <option value=""${!item.prov ? " selected" : ""}>—</option>
                </select>` :
                `<input type="text" value="${safeText(item.prov || "")}" onchange="uIng(${item.id},'prov',this.value)">`}
              </td>
              <td><input type="text" value="${safeText(item.cant || "")}" onchange="uIng(${item.id},'cant',this.value)"></td>
              <td><button class="btn btn-s btn-d" onclick="dIng(${item.id})">×</button></td>
            </tr>`).join("") || `<tr><td colspan="6">Sin resultados</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function uIng(id, field, value) {
  const ing = D.ingredientes.find((item) => item.id === id);
  if (!ing) return;
  ing[field] = value;
  save("ingredientes");
}

function dIng(id) {
  if (!confirm("¿Eliminar ingrediente?")) return;
  D.ingredientes = D.ingredientes.filter((item) => item.id !== id);
  save("ingredientes");
}

function rPedRes() {
  const q = pedSearch();
  const grouped = {};
  D.ingredientes.forEach((item) => {
    if (!item.prov) return;
    if (!grouped[item.prov]) grouped[item.prov] = [];
    grouped[item.prov].push(item);
  });

  let entries = Object.entries(grouped);
  if (q) entries = entries.filter(([prov, items]) => prov.toLowerCase().includes(q) || items.some((item) => item.ing.toLowerCase().includes(q)));
  if (pedSort) entries.sort((a, b) => a[0].localeCompare(b[0], "es"));

  const html = entries.length ? entries.map(([prov, items]) => {
    const filteredItems = q && !prov.toLowerCase().includes(q) ? items.filter((item) => item.ing.toLowerCase().includes(q)) : items;
    const provider = D.proveedores.find((item) => item.nombre === prov);
    return `
      <div class="pb">
        <div class="pbh">
          <span>${safeText(prov)}</span>
          <div class="ca">
            <button class="primary-btn" onclick="envWA('${safeText(prov).replace(/'/g, "\\'")}','${safeText(provider?.tel || "")}')">WhatsApp</button>
          </div>
        </div>
        <div class="pi">${filteredItems.map((item) => `
          <div class="pr">
            <span style="font-weight:700">${safeText(item.ing)}</span>
            <span>${bcat(item.cat)}</span>
            <span style="text-align:right">${safeText(item.cant || "—")}</span>
          </div>`).join("")}</div>
      </div>`;
  }).join("") : `<div class="notice"><strong>Sin proveedores</strong><div>Asigna proveedores desde la vista de lista.</div></div>`;

  const withoutProvider = D.ingredientes.filter((item) => !item.prov);
  document.getElementById("pp-resumen").innerHTML = html + (!q && withoutProvider.length ? `<div class="notice"><strong>${withoutProvider.length} ingredientes sin proveedor</strong><div>${withoutProvider.map((item) => safeText(item.ing)).join(", ")}</div></div>` : "");
}

function envWA(provider, phone) {
  const items = D.ingredientes.filter((item) => item.prov === provider);
  const message = encodeURIComponent([
    "Pedido OBA",
    formatLongDate(new Date()),
    "",
    ...items.map((item) => `• ${item.ing}${item.cant ? " — " + item.cant : ""}`)
  ].join("\n"));
  const number = String(phone || "").replace(/\s/g, "");
  window.open(number ? `https://wa.me/34${number}?text=${message}` : `https://wa.me/?text=${message}`, "_blank");
}

function rPedProv() {
  const q = pedSearch();
  let items = q ? D.proveedores.filter((item) => item.nombre.toLowerCase().includes(q) || (item.tel || "").includes(q)) : D.proveedores;
  if (pedSort) items = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  document.getElementById("pp-prov").innerHTML = `
    <button class="primary-btn" style="margin-bottom:14px" onclick="oPM('prov')">Añadir proveedor</button>
    ${items.length ? items.map((item, index) => `
      <div class="pc">
        <div class="pt">${safeText(item.nombre)}</div>
        ${item.tel ? `<div class="nd">Tel: ${safeText(item.tel)}</div>` : ""}
        ${item.nota ? `<div style="margin-top:8px">${safeText(item.nota)}</div>` : ""}
        <div class="ca" style="margin-top:12px">
          <button class="btn btn-o btn-s" onclick="eProv(${index})">Editar</button>
          <button class="btn btn-s btn-d" onclick="dProv(${index})">Eliminar</button>
        </div>
      </div>`).join("") : `<div class="notice"><strong>Sin proveedores</strong><div>Añade el primero para ordenar mejor los pedidos.</div></div>`}`;
}

function oPM(type) {
  if (type === "ing") {
    oModal(`
      <h3>Nuevo ingrediente</h3>
      <div class="fr"><label>Nombre *</label><input id="in"></div>
      <div class="fr"><label>Platos donde se usa</label><input id="ip"></div>
      <div class="fr"><label>Categoría</label><select id="ic">${CATS.map((cat) => `<option>${cat}</option>`).join("")}</select></div>
      <div class="fr"><label>Proveedor</label><select id="iv"><option value="">— sin asignar —</option>${D.proveedores.map((item) => `<option value="${safeText(item.nombre)}">${safeText(item.nombre)}</option>`).join("")}</select></div>
      <div class="fr"><label>Cantidad/semana</label><input id="iq" placeholder="Ej: 2 kg"></div>
      <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sIng()">Guardar</button></div>`);
  } else {
    oModal(`
      <h3>Nuevo proveedor</h3>
      <div class="fr"><label>Nombre *</label><input id="pn"></div>
      <div class="fr"><label>Teléfono</label><input id="pt" placeholder="612 345 678"></div>
      <div class="fr"><label>Notas</label><textarea id="pno"></textarea></div>
      <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sProv(-1)">Guardar</button></div>`);
  }
}

function sIng() {
  const name = document.getElementById("in").value.trim();
  if (!name) return alert("El nombre es obligatorio");
  D.ingredientes.push({
    id: nid++,
    ing: name,
    platos: document.getElementById("ip").value || "Sin especificar",
    cat: document.getElementById("ic").value,
    prov: document.getElementById("iv").value,
    cant: document.getElementById("iq").value
  });
  save("ingredientes");
  cModal();
}

function eProv(index) {
  const prov = D.proveedores[index];
  oModal(`
    <h3>Editar proveedor</h3>
    <div class="fr"><label>Nombre *</label><input id="pn" value="${safeText(prov.nombre)}"></div>
    <div class="fr"><label>Teléfono</label><input id="pt" value="${safeText(prov.tel || "")}"></div>
    <div class="fr"><label>Notas</label><textarea id="pno">${safeText(prov.nota || "")}</textarea></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sProv(${index})">Guardar</button></div>`);
}

function sProv(index) {
  const name = document.getElementById("pn").value.trim();
  if (!name) return alert("El nombre es obligatorio");
  const payload = { id: nid++, nombre: name, tel: document.getElementById("pt").value.trim(), nota: document.getElementById("pno").value.trim() };
  if (index === -1) {
    if (D.proveedores.find((item) => item.nombre === name)) return alert("Ya existe un proveedor con ese nombre");
    D.proveedores.push(payload);
  } else {
    const oldName = D.proveedores[index].nombre;
    D.ingredientes.forEach((item) => {
      if (item.prov === oldName) item.prov = name;
    });
    payload.id = D.proveedores[index].id || payload.id;
    D.proveedores[index] = payload;
    save("ingredientes");
  }
  save("proveedores");
  cModal();
}

function dProv(index) {
  if (!confirm("¿Eliminar proveedor?")) return;
  const name = D.proveedores[index].nombre;
  D.ingredientes.forEach((item) => {
    if (item.prov === name) item.prov = "";
  });
  D.proveedores.splice(index, 1);
  save("proveedores");
  save("ingredientes");
}

function rMenu() {
  document.getElementById("mbody").innerHTML = D.menu.length ? D.menu.map((item) => `
    <div class="pc">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div>
          <div class="pt">${safeText(item.plato)}</div>
          ${bsec(item.seccion)}
          ${item.nota ? `<p style="margin-top:10px;color:#5e5a54">${safeText(item.nota)}</p>` : ""}
          <div class="nd">${safeText(item.fecha)}</div>
        </div>
        <span class="ps s-${item.estado === "activo" ? "activo" : "pausado"}">${safeText(item.estado)}</span>
      </div>
      <div class="ca" style="margin-top:14px">
        <button class="btn btn-s btn-o" onclick="oMM(${item.id})">Editar</button>
        <button class="btn btn-s btn-d" onclick="dMenu(${item.id})">Eliminar</button>
      </div>
    </div>`).join("") : `<div class="notice"><strong>Sin cambios esta semana</strong><div>Añade un movimiento de carta cuando haga falta.</div></div>`;
}

function oMM(id) {
  const item = id ? D.menu.find((menu) => menu.id === id) : null;
  oModal(`
    <h3>${item ? "Editar cambio" : "Nuevo cambio de menú"}</h3>
    <div class="fr"><label>Plato *</label><input id="mp" value="${safeText(item?.plato || "")}"></div>
    <div class="fr"><label>Sección</label><select id="ms">${[...SECS, "Bebida maridaje"].map((section) => `<option${item?.seccion === section ? " selected" : ""}>${section}</option>`).join("")}</select></div>
    <div class="fr"><label>Estado</label><select id="me">${["activo", "pausado"].map((state) => `<option${item?.estado === state ? " selected" : ""}>${state}</option>`).join("")}</select></div>
    <div class="fr"><label>Nota</label><textarea id="mn">${safeText(item?.nota || "")}</textarea></div>
    <div class="fr"><label>Fecha</label><input type="date" id="mf" value="${safeText(item?.fecha || today())}"></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sMenu(${id || "null"})">Guardar</button></div>`);
}

function sMenu(id) {
  const plate = document.getElementById("mp").value.trim();
  if (!plate) return alert("El nombre es obligatorio");
  const payload = {
    plato: plate,
    seccion: document.getElementById("ms").value,
    estado: document.getElementById("me").value,
    nota: document.getElementById("mn").value,
    fecha: document.getElementById("mf").value
  };
  if (id) Object.assign(D.menu.find((item) => item.id === id), payload);
  else D.menu.push({ id: nid++, ...payload });
  save("menu");
  cModal();
}

function dMenu(id) {
  if (!confirm("¿Eliminar cambio de menú?")) return;
  D.menu = D.menu.filter((item) => item.id !== id);
  save("menu");
}

function calNav(delta) {
  cM += delta;
  if (cM > 11) {
    cM = 0;
    cY += 1;
  }
  if (cM < 0) {
    cM = 11;
    cY -= 1;
  }
  calRender();
}

function calRender() {
  const title = document.getElementById("cal-title");
  if (!title) return;
  title.textContent = `${MESES[cM]} ${cY}`;
  document.getElementById("cheads").innerHTML = DS.map((day) => `<div class="ch">${day}</div>`).join("");

  const first = new Date(cY, cM, 1);
  const last = new Date(cY, cM + 1, 0);
  const startDay = (first.getDay() + 6) % 7;
  let html = "";

  for (let i = 0; i < startDay; i += 1) {
    const d = new Date(cY, cM, -(startDay - i - 1));
    html += `<div class="cd om"><div class="cdn">${d.getDate()}</div></div>`;
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const dateStr = `${cY}-${String(cM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events = D.eventos.filter((item) => item.fecha === dateStr);
    const trainees = D.practicantes.filter((item) => item.fechaEntrada === dateStr);
    let content = events.map((item) => {
      const cls = item.tipo === "especial" ? "ce-esp" : item.urgente || item.tipo === "urgente" ? "ce-urg" : "ce";
      return `<div class="${cls}">${item.tipo === "especial" ? "★ " : item.urgente ? "⚠ " : ""}${safeText(item.titulo)}</div>`;
    }).join("");
    content += trainees.map((item) => `<div class="ce-prac" onclick="event.stopPropagation();oPF(${item.id})">👤 ${safeText(item.nombre)}</div>`).join("");
    html += `<div class="cd${dateStr === today() ? " today" : ""}" onclick="oCM('${dateStr}')"><div class="cdn">${day}</div>${content}</div>`;
  }

  const remaining = (7 - ((startDay + last.getDate()) % 7)) % 7;
  for (let i = 1; i <= remaining; i += 1) {
    html += `<div class="cd om"><div class="cdn">${i}</div></div>`;
  }

  document.getElementById("cbody").innerHTML = html;

  const monthlyEvents = D.eventos.filter((item) => item.fecha.startsWith(`${cY}-${String(cM + 1).padStart(2, "0")}`));
  const monthlyTrainees = D.practicantes.filter((item) => item.fechaEntrada?.startsWith(`${cY}-${String(cM + 1).padStart(2, "0")}`));
  let listHtml = "";
  listHtml += monthlyEvents.map((item) => `<div class="notice${item.urgente ? " urgent" : ""}"><strong>${safeText(item.titulo)}</strong><div>${safeText(item.nota || "Evento")}</div><div class="nd">${safeText(item.fecha)}</div></div>`).join("");
  listHtml += monthlyTrainees.map((item) => `<div class="notice" style="border-left-color:#335d87;background:#e7eff7;cursor:pointer" onclick="oPF(${item.id})"><strong>Practicante: ${safeText(item.nombre)}</strong><div>${safeText(item.partida || "Sin partida asignada")}</div><div class="nd">${safeText(item.fechaEntrada)}</div></div>`).join("");
  document.getElementById("clist").innerHTML = listHtml || `<div class="notice"><strong>Mes despejado</strong><div>No hay eventos destacados en este mes.</div></div>`;
}

function oCM(dateValue) {
  oModal(`
    <h3>Nuevo evento</h3>
    <div class="fr"><label>Título *</label><input id="et"></div>
    <div class="fr"><label>Tipo</label><select id="etipo"><option value="normal">Normal</option><option value="especial">Especial</option><option value="urgente">Urgente</option></select></div>
    <div class="fr"><label>Fecha</label><input type="date" id="ef" value="${safeText(typeof dateValue === "string" ? dateValue : today())}"></div>
    <div class="fr"><label>Notas</label><input id="enota"></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sEv()">Guardar</button></div>`);
}

function sEv() {
  const title = document.getElementById("et").value.trim();
  if (!title) return alert("El título es obligatorio");
  const type = document.getElementById("etipo").value;
  D.eventos.push({
    id: nid++,
    titulo: title,
    fecha: document.getElementById("ef").value,
    tipo: type,
    urgente: type === "urgente",
    nota: document.getElementById("enota").value || ""
  });
  save("eventos");
  cModal();
}

function rPrac() {
  const filter = document.getElementById("pfilt")?.value || "";
  const list = D.practicantes.filter((item) => !filter || item.estado === filter);
  document.getElementById("pracbody").innerHTML = list.length ? list.map((item) => `
    <div class="pc" style="cursor:pointer" onclick="oPF(${item.id})">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div>
          <div class="pt">${safeText(item.nombre)}</div>
          <div class="nd">${safeText(item.fechaEntrada || "—")} → ${safeText(item.fechaSalida || "—")}</div>
          ${item.escuela ? `<div class="nd">${safeText(item.escuela)}</div>` : ""}
        </div>
        <span class="ps s-${safeText(item.estado || "pendiente")}">${safeText(item.estado || "pendiente")}</span>
      </div>
      ${item.partida ? `<div class="ca" style="margin-top:10px"><span class="badge b-huerta">${safeText(item.partida)}</span></div>` : ""}
    </div>`).join("") : `<div class="notice"><strong>Sin practicantes</strong><div>Añade el primero cuando tengas nuevas incorporaciones.</div></div>`;
}

function oPF(id) {
  const item = D.practicantes.find((prac) => prac.id === id);
  if (!item) return;
  document.getElementById("pftit").textContent = item.nombre;
  const skills = item.habilidades || {};
  document.getElementById("pfbody").innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:22px">
      <div><strong>Escuela:</strong> ${safeText(item.escuela || "—")}</div>
      <div><strong>Estado:</strong> ${safeText(item.estado || "—")}</div>
      <div><strong>Entrada:</strong> ${safeText(item.fechaEntrada || "—")}</div>
      <div><strong>Salida:</strong> ${safeText(item.fechaSalida || "—")}</div>
      <div><strong>Partida:</strong> ${safeText(item.partida || "—")}</div>
      <div><strong>Tutor:</strong> ${safeText(item.tutor || "—")}</div>
    </div>
    ${item.descripcion ? `<div class="notice" style="margin-bottom:22px">${safeText(item.descripcion)}</div>` : ""}
    <div class="rs">
      <h4>Habilidades</h4>
      ${SKILLS.map((skill) => {
        const value = skills[skill] || 0;
        return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span>${skill}</span><span>${value}/5</span></div><div class="skb"><div class="skbf" style="width:${value * 20}%"></div></div></div>`;
      }).join("")}
    </div>
    ${item.notas ? `<div class="rs"><h4>Notas</h4><div style="white-space:pre-wrap">${safeText(item.notas)}</div></div>` : ""}
    <div class="ca">
      <button class="btn btn-o" onclick="oPracM(${id})">Editar ficha</button>
      <button class="btn btn-d btn-s" onclick="dPrac(${id})">Eliminar</button>
    </div>`;
  document.getElementById("pfdet").classList.add("open");
}

function cPF() {
  document.getElementById("pfdet").classList.remove("open");
}

function oPracM(id) {
  const item = id ? D.practicantes.find((prac) => prac.id === id) : null;
  const skills = item?.habilidades || {};
  oModal(`
    <h3>${item ? "Editar practicante" : "Nuevo practicante"}</h3>
    <div class="fr"><label>Nombre completo *</label><input id="prn" value="${safeText(item?.nombre || "")}"></div>
    <div class="fr"><label>Escuela</label><input id="pre" value="${safeText(item?.escuela || "")}"></div>
    <div class="fr"><label>Fecha de entrada</label><input type="date" id="pri" value="${safeText(item?.fechaEntrada || "")}"></div>
    <div class="fr"><label>Fecha de salida</label><input type="date" id="prs" value="${safeText(item?.fechaSalida || "")}"></div>
    <div class="fr"><label>Partida</label><select id="prp"><option value="">Sin asignar</option>${["Cocina fría", "Cocina caliente", "Pastelería", "Sala", "Todas"].map((partida) => `<option${item?.partida === partida ? " selected" : ""}>${partida}</option>`).join("")}</select></div>
    <div class="fr"><label>Tutor/a</label><input id="prt" value="${safeText(item?.tutor || "")}"></div>
    <div class="fr"><label>Estado</label><select id="prst">${["activo", "pendiente", "finalizado"].map((state) => `<option${(item?.estado || "pendiente") === state ? " selected" : ""}>${state}</option>`).join("")}</select></div>
    <div class="fr"><label>Habilidades (0-5)</label>
      ${SKILLS.map((skill) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px"><span>${skill}</span><input type="number" min="0" max="5" id="sk_${skill.replace(/[^a-zA-Z]/g, "_")}" value="${skills[skill] || 0}" style="width:70px"></div>`).join("")}
    </div>
    <div class="fr"><label>Descripción</label><textarea id="prd">${safeText(item?.descripcion || "")}</textarea></div>
    <div class="fr"><label>Notas</label><textarea id="prno">${safeText(item?.notas || "")}</textarea></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sPrac(${id || "null"})">Guardar</button></div>`);
}

function sPrac(id) {
  const name = document.getElementById("prn").value.trim();
  if (!name) return alert("El nombre es obligatorio");
  const skills = {};
  SKILLS.forEach((skill) => {
    const value = Number(document.getElementById(`sk_${skill.replace(/[^a-zA-Z]/g, "_")}`)?.value || 0);
    skills[skill] = value;
  });
  const payload = {
    nombre: name,
    escuela: document.getElementById("pre").value,
    fechaEntrada: document.getElementById("pri").value,
    fechaSalida: document.getElementById("prs").value,
    partida: document.getElementById("prp").value,
    tutor: document.getElementById("prt").value,
    estado: document.getElementById("prst").value,
    habilidades: skills,
    descripcion: document.getElementById("prd").value,
    notas: document.getElementById("prno").value
  };
  if (id) Object.assign(D.practicantes.find((item) => item.id === id), payload);
  else D.practicantes.push({ id: nid++, ...payload });
  save("practicantes");
  cModal();
}

function dPrac(id) {
  if (!confirm("¿Eliminar este practicante?")) return;
  D.practicantes = D.practicantes.filter((item) => item.id !== id);
  save("practicantes");
  cPF();
}

function rProj() {
  const filter = document.getElementById("projfilt")?.value || "";
  const list = D.proyectos.filter((item) => !filter || item.estado === filter);
  document.getElementById("projbody").innerHTML = list.length ? list.map((item) => `
    <div class="pc">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div class="pt">${safeText(item.nombre)}</div>
        <span class="ps s-${safeText(item.estado)}">${safeText(item.estado)}</span>
      </div>
      <p style="margin:.5rem 0;color:#5e5a54">${safeText(item.descripcion)}</p>
      ${item.responsable ? `<div class="nd">Responsable: ${safeText(item.responsable)}</div>` : ""}
      ${item.notas ? `<div class="notice" style="margin-top:10px">${safeText(item.notas)}</div>` : ""}
      <div class="nd">${safeText(item.fecha)}</div>
      <div class="ca" style="margin-top:12px">
        <button class="btn btn-s btn-o" onclick="oProjM(${item.id})">Editar</button>
        <button class="btn btn-s btn-d" onclick="dProj(${item.id})">Eliminar</button>
      </div>
    </div>`).join("") : `<div class="notice"><strong>Sin proyectos</strong><div>Arranca aquí las nuevas ideas de I+D.</div></div>`;
}

function oProjM(id) {
  const item = id ? D.proyectos.find((proj) => proj.id === id) : null;
  oModal(`
    <h3>${item ? "Editar proyecto" : "Nuevo proyecto"}</h3>
    <div class="fr"><label>Nombre *</label><input id="prjn" value="${safeText(item?.nombre || "")}"></div>
    <div class="fr"><label>Descripción</label><textarea id="prjd">${safeText(item?.descripcion || "")}</textarea></div>
    <div class="fr"><label>Estado</label><select id="prje">${["activo", "testeo", "listo", "pausado"].map((state) => `<option${item?.estado === state ? " selected" : ""}>${state}</option>`).join("")}</select></div>
    <div class="fr"><label>Responsable</label><input id="prjr" value="${safeText(item?.responsable || "")}"></div>
    <div class="fr"><label>Notas</label><textarea id="prjno">${safeText(item?.notas || "")}</textarea></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sProj(${id || "null"})">Guardar</button></div>`);
}

function sProj(id) {
  const name = document.getElementById("prjn").value.trim();
  if (!name) return alert("El nombre es obligatorio");
  const payload = {
    nombre: name,
    descripcion: document.getElementById("prjd").value,
    estado: document.getElementById("prje").value,
    responsable: document.getElementById("prjr").value,
    notas: document.getElementById("prjno").value,
    fecha: today()
  };
  if (id) Object.assign(D.proyectos.find((item) => item.id === id), payload);
  else D.proyectos.push({ id: nid++, ...payload });
  save("proyectos");
  cModal();
}

function dProj(id) {
  if (!confirm("¿Eliminar proyecto?")) return;
  D.proyectos = D.proyectos.filter((item) => item.id !== id);
  save("proyectos");
}

function rAv() {
  const list = [...D.avisos].reverse();
  document.getElementById("avbody").innerHTML = list.length ? list.map((item) => `
    <div class="notice${item.urgente ? " urgent" : ""}" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <strong>${safeText(item.titulo)}</strong>
        <div class="ca">
          <button class="btn btn-s btn-o" onclick="oAM(${item.id})">Editar</button>
          <button class="btn btn-s btn-d" onclick="dAv(${item.id})">Eliminar</button>
        </div>
      </div>
      <div style="margin-top:8px">${safeText(item.texto)}</div>
      <div class="nd">${safeText(item.autor)} · ${safeText(item.fecha)}</div>
    </div>`).join("") : `<div class="notice"><strong>Sin avisos</strong><div>Publica aquí los comunicados del equipo.</div></div>`;
}

function oAM(id) {
  const item = id ? D.avisos.find((aviso) => aviso.id === id) : null;
  oModal(`
    <h3>${item ? "Editar aviso" : "Nuevo aviso"}</h3>
    <div class="fr"><label>Título *</label><input id="at" value="${safeText(item?.titulo || "")}"></div>
    <div class="fr"><label>Mensaje</label><textarea id="ax">${safeText(item?.texto || "")}</textarea></div>
    <div class="fr"><label>Autor</label><input id="aa" value="${safeText(item?.autor || "")}"></div>
    <div class="fr"><label>Urgente</label><select id="au"><option value="0"${item && !item.urgente ? " selected" : ""}>No</option><option value="1"${item?.urgente ? " selected" : ""}>Sí</option></select></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sAv(${id || "null"})">Guardar</button></div>`);
}

function sAv(id) {
  const title = document.getElementById("at").value.trim();
  if (!title) return alert("El título es obligatorio");
  const payload = {
    titulo: title,
    texto: document.getElementById("ax").value,
    autor: document.getElementById("aa").value,
    urgente: document.getElementById("au").value === "1",
    fecha: today()
  };
  if (id) Object.assign(D.avisos.find((item) => item.id === id), payload);
  else D.avisos.push({ id: nid++, ...payload });
  save("avisos");
  cModal();
}

function dAv(id) {
  if (!confirm("¿Eliminar aviso?")) return;
  D.avisos = D.avisos.filter((item) => item.id !== id);
  save("avisos");
}

function gKey() {
  return localStorage.getItem("oba_groq_key") || "";
}

function sKey(key) {
  localStorage.setItem("oba_groq_key", key);
}

function iaCtx() {
  return `Eres el asistente del restaurante OBA en España. Recetario disponible: ${D.recipes.map((recipe) => `${recipe.nombre} (${recipe.seccion})`).join(", ")}. Ingredientes disponibles: ${D.ingredientes.slice(0, 20).map((item) => item.ing).join(", ")}. Responde en español, muy claro, práctico y útil para cocina y sala.`;
}

function initIA() {
  document.getElementById("iasugs").innerHTML = IASUGS.map((prompt) => `<button class="ia-sug" onclick="iaSug('${safeText(prompt).replace(/'/g, "\\'")}')">${safeText(prompt)}</button>`).join("");
  const chat = document.getElementById("iachat");
  if (!gKey()) {
    chat.innerHTML = `<div class="ia-msg bot">Para activar la IA, añade tu API key de Groq. <button class="btn btn-s btn-g" onclick="pKey()">Configurar</button></div>`;
  } else {
    chat.innerHTML = `<div class="ia-msg bot">Estoy lista para ayudarte con recetas, compras, avisos o traducciones.</div>`;
  }
}

function iaSug(text) {
  document.getElementById("iainput").value = text;
  iaEnv();
}

async function iaEnv() {
  const key = gKey();
  if (!key) {
    pKey();
    return;
  }
  const input = document.getElementById("iainput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  const chat = document.getElementById("iachat");
  const loadingId = `ia-${Date.now()}`;
  chat.innerHTML += `<div class="ia-msg user">${safeText(text)}</div><div class="ia-msg loading" id="${loadingId}">Pensando...</div>`;
  chat.scrollTop = chat.scrollHeight;
  iaH.push({ role: "user", content: text });
  try {
    const response = await fetch(GROQ, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: iaCtx() }, ...iaH.slice(-10)],
        max_tokens: 1024,
        temperature: 0.7
      })
    });
    const data = await response.json();
    document.getElementById(loadingId)?.remove();
    if (data.error) {
      chat.innerHTML += `<div class="ia-msg bot">Error: ${safeText(data.error.message)} <button class="btn btn-s" onclick="pKey()">Cambiar key</button></div>`;
    } else {
      const reply = data.choices?.[0]?.message?.content || "Sin respuesta.";
      iaH.push({ role: "assistant", content: reply });
      chat.innerHTML += `<div class="ia-msg bot">${safeText(reply).replace(/\n/g, "<br>")}</div>`;
    }
  } catch (error) {
    document.getElementById(loadingId)?.remove();
    chat.innerHTML += `<div class="ia-msg bot">Error de conexión. <button class="btn btn-s" onclick="pKey()">Revisar key</button></div>`;
  }
  chat.scrollTop = chat.scrollHeight;
}

function pKey() {
  oModal(`
    <h3>Activar asistente IA</h3>
    <p style="margin-bottom:12px;color:#5e5a54">Introduce tu API key de Groq. Se guarda solo en este navegador.</p>
    <div class="fr"><label>API key</label><input id="apik" type="password" placeholder="gsk_..."></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="gAPIK()">Activar</button></div>`);
}

function gAPIK() {
  const key = document.getElementById("apik").value.trim();
  if (!key) return alert("Introduce tu API key");
  sKey(key);
  cModal();
  initIA();
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function supportsManualInstallHint() {
  return isIOS() || isAndroid();
}

function installHelpMarkup() {
  const secureNote = `
    <div class="notice" style="margin-bottom:14px">
      <strong>Importante</strong>
      <div>Para instalarla en móvil, la intranet debe abrirse desde una URL HTTPS real. Si la abres como archivo local o desde una URL no segura, el móvil no la instalará como app.</div>
    </div>`;

  if (isIOS()) {
    return `
      ${secureNote}
      <h3>Instalar en iPhone</h3>
      <div class="rs">
        <h4>Pasos</h4>
        <ol class="sl">
          <li><div class="sn">1</div><div>Abre la intranet en <strong>Safari</strong>.</div></li>
          <li><div class="sn">2</div><div>Toca el botón <strong>Compartir</strong>.</div></li>
          <li><div class="sn">3</div><div>Selecciona <strong>Añadir a pantalla de inicio</strong>.</div></li>
          <li><div class="sn">4</div><div>Confirma y verás el icono negro de OBA en tu móvil.</div></li>
        </ol>
      </div>`;
  }

  if (isAndroid()) {
    return `
      ${secureNote}
      <h3>Instalar en Android</h3>
      <div class="rs">
        <h4>Pasos</h4>
        <ol class="sl">
          <li><div class="sn">1</div><div>Abre la intranet en <strong>Chrome</strong>.</div></li>
          <li><div class="sn">2</div><div>Toca <strong>Instalar app</strong> si aparece el aviso del navegador.</div></li>
          <li><div class="sn">3</div><div>Si no aparece, abre el menú <strong>⋮</strong> y pulsa <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</div></li>
          <li><div class="sn">4</div><div>Confirma y se añadirá como app independiente.</div></li>
        </ol>
      </div>`;
  }

  return `
    ${secureNote}
    <h3>Instalar la app</h3>
    <div class="rs">
      <h4>Recomendación</h4>
      <div>Abre la intranet desde el navegador de tu móvil y usa la opción de instalar o añadir a la pantalla de inicio.</div>
    </div>`;
}

function registerPWA() {
  const isLocalPreview = ["127.0.0.1", "localhost"].includes(location.hostname);
  const disableServiceWorker = isLocalPreview || location.hostname.endsWith("github.io");

  if (disableServiceWorker && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    return;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("SW error:", error));
  }

  const installCard = document.getElementById("install-card");
  const installBtn = document.getElementById("install-btn");
  const hideInstall = () => {
    if (installCard) installCard.hidden = true;
    if (installBtn) installBtn.hidden = true;
  };
  const showInstall = () => {
    if (installCard) installCard.hidden = false;
    if (installBtn) installBtn.hidden = false;
  };

  if (isStandaloneMode()) {
    hideInstall();
  } else if (supportsManualInstallHint()) {
    showInstall();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstall();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideInstall();
  });
}

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById("install-card").hidden = true;
    document.getElementById("install-btn").hidden = true;
    return;
  }
  oModal(`
    ${installHelpMarkup()}
    <div class="mf">
      <button class="primary-btn" onclick="cModal()">Entendido</button>
    </div>`);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") cModal();
  });
  registerPWA();
  initIA();
  initData().catch((error) => showError(error.message));
});
