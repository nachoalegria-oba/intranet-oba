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
const REST_SECS = ["Entrantes", "Principales", "Postres", "Snacks", "Bebidas", "Bases y Técnicas"];
const CATS = ["Bienvenida", "Huerta", "Bosque", "Afluente", "Corral", "Acantilado", "Monte Bajo", "Llanura", "Rivera", "Fermentos"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const SKILLS = ["Mise en place", "Fondos y salsas", "Carnes", "Pescados", "Pastelería", "Fermentos", "Limpieza y orden", "Trabajo en equipo"];
const ALERGEN_LIST = ["Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja", "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Dióxido de azufre", "Altramuces", "Moluscos"];
const COLLECTIONS = ["recipes", "ingredientes", "menu", "avisos", "proyectos", "eventos", "proveedores", "practicantes", "centros", "habitaciones", "pedidosHistorial", "descargables", "empresas", "grupo_descargables", "oba_recetas", "oba_menus", "oba_ideas", "oba_kpis", "ene_recetas", "ene_menus", "ene_ideas", "ene_kpis", "candomo_recetas", "candomo_menus", "candomo_ideas", "candomo_kpis", "canitas_recetas", "canitas_menus", "canitas_ideas", "canitas_kpis", "cebo_recetas", "cebo_menus", "cebo_ideas", "cebo_kpis"];

const REST_COL_MAP = { oba: "oba", ene: "ene", candomo: "candomo", canitas: "canitas", cebo: "cebo" };

// --- Icon helper (Phosphor Icons fill) ---
function ico(name, size = 18) {
  return `<i class="ph-fill ph-${name}" style="font-size:${size}px;line-height:1;vertical-align:middle;flex-shrink:0"></i>`;
}

// --- Scroll helper ---
function scrollTop(smooth = true) {
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "instant" });
}

// --- Login mode: oscurece html/body y ajusta theme-color ---
function setLoginMode(on) {
  document.documentElement.classList.toggle("login-mode", on);
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.content = on ? "#050505" : "#f2f2f7";
}

// --- Recipe scaling helpers ---
function _fmtNum(n) {
  if (n <= 0) return "0";
  if (n >= 1000) return String(Math.round(n));
  if (n >= 100)  return String(Math.round(n));
  if (n >= 10)   return String(parseFloat((Math.round(n * 10) / 10).toFixed(1)));
  if (n >= 1)    return String(parseFloat((Math.round(n * 100) / 100).toFixed(2)));
  return String(parseFloat((Math.round(n * 1000) / 1000).toFixed(3)));
}
function scaleQty(c, factor) {
  if (!c || factor === 1) return c;
  const s = String(c).trim();
  if (!s || s === "—") return s;
  // Range: "2-3" or "2–4"
  const rangeM = s.match(/^([\d,.]+)\s*[-–]\s*([\d,.]+)$/);
  if (rangeM) return `${_fmtNum(parseFloat(rangeM[1].replace(",", ".")) * factor)}–${_fmtNum(parseFloat(rangeM[2].replace(",", ".")) * factor)}`;
  // Mixed number: "1 1/2"
  const mixM = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixM) return _fmtNum((+mixM[1] + +mixM[2] / +mixM[3]) * factor);
  // Fraction: "1/2"
  const fracM = s.match(/^(\d+)\/(\d+)$/);
  if (fracM) return _fmtNum((+fracM[1] / +fracM[2]) * factor);
  // Plain number (with optional comma decimal)
  const n = parseFloat(s.replace(",", "."));
  if (!isNaN(n)) return _fmtNum(n * factor);
  // Non-numeric (e.g. "a gusto", "c.s.") — return as-is
  return s;
}
function parseRaciones(s) {
  if (!s) return null;
  const m = String(s).match(/\d+/);
  return m ? parseInt(m[0]) : null;
}

// --- Toast notifications ---
function toast(msg, type = "ok") {
  document.querySelectorAll(".oba-toast").forEach(t => t.remove());
  const el = document.createElement("div");
  el.className = `oba-toast oba-toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("oba-toast-show")));
  setTimeout(() => {
    el.classList.remove("oba-toast-show");
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

// --- Skeleton cards ---
function skeletonCards(n = 6) {
  return Array.from({ length: n }, () => `
    <div class="card rest-rec-card sk-card">
      <div class="sk sk-badge"></div>
      <div class="sk sk-title"></div>
      <div class="sk sk-line"></div>
      <div class="sk sk-line sk-line-sm"></div>
      <div class="sk sk-btns"></div>
    </div>`).join("");
}

// --- Performance: debounced render ---
let _renderTimer = null;
function scheduleRender() {
  clearTimeout(_renderTimer);
  _renderTimer = setTimeout(renderAll, 60);
}

// Collections whose items may have large foto fields — excluded from localStorage
const FOTO_COLS = new Set(["recipes", "oba_recetas", "ene_recetas", "candomo_recetas", "canitas_recetas", "cebo_recetas"]);

// --- IndexedDB photo cache ---
// Photos live in Firestore `{col}_fotos` and are cached here after first load.
// Main recipe docs only have hasPhoto:true — no heavy base64 in the main payload.
let _photoDB = null;
function _openPhotoDB() {
  if (_photoDB) return Promise.resolve(_photoDB);
  return new Promise((res, rej) => {
    const req = indexedDB.open("oba-photo-cache", 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore("photos", { keyPath: "key" });
    req.onsuccess = (e) => { _photoDB = e.target.result; res(_photoDB); };
    req.onerror = (e) => rej(e.target.error);
  });
}
async function _getPhoto(col, i) {
  try {
    const db = await _openPhotoDB();
    return await new Promise((res) => {
      const req = db.transaction("photos").objectStore("photos").get(`${col}_${i}`);
      req.onsuccess = () => res(req.result?.foto || null);
      req.onerror = () => res(null);
    });
  } catch { return null; }
}
async function _setPhoto(col, i, foto) {
  try {
    const db = await _openPhotoDB();
    await new Promise((res) => {
      const tx = db.transaction("photos", "readwrite");
      tx.objectStore("photos").put({ key: `${col}_${i}`, foto });
      tx.oncomplete = res; tx.onerror = res;
    });
  } catch { /* ignore */ }
}
async function _getAllCachedPhotos(col) {
  try {
    const db = await _openPhotoDB();
    return await new Promise((res) => {
      const out = {}; const prefix = `${col}_`;
      const req = db.transaction("photos").objectStore("photos").openCursor();
      req.onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { if (String(cur.key).startsWith(prefix)) out[parseInt(String(cur.key).slice(prefix.length))] = cur.value.foto; cur.continue(); }
        else res(out);
      };
      req.onerror = () => res({});
    });
  } catch { return {}; }
}

// Load photos for a restaurant collection: IndexedDB → Firestore _fotos fallback
const _photoLoadedCols = new Set();
async function loadRestPhotos(col) {
  if (_photoLoadedCols.has(col)) return;
  _photoLoadedCols.add(col);
  const recipes = D[`${col}_recetas`] || [];
  const withPhoto = recipes.filter(r => r.hasPhoto);
  if (!withPhoto.length) return;

  // Check IndexedDB cache
  const cached = await _getAllCachedPhotos(col);
  const missing = withPhoto.filter(r => !cached[r._i]);

  // Merge cached photos into D
  withPhoto.forEach(r => { if (cached[r._i]) r.foto = cached[r._i]; });

  if (missing.length === 0) return; // all from cache, done

  // Fetch missing from Firestore _fotos collection
  try {
    const snap = await db.collection(`${col}_recetas_fotos`).get();
    if (snap.empty) return;
    snap.docs.forEach(d => {
      const { _i, foto } = d.data();
      const recipe = recipes.find(r => r._i === _i);
      if (recipe && foto) { recipe.foto = foto; _setPhoto(col, _i, foto); }
    });
  } catch (e) { console.warn("Error loading photos for", col, e); }
}

const EMPRESAS_SEED = [
  {
    id: 1,
    nombre: "OBA–",
    subtitulo: "Consultora gastronómica",
    ubicacion: "Casas Ibáñez, Albacete",
    web: "https://intranet.obarestaurante.es",
    estado: "abierto",
    notaDia: "",
    theme: "oba",
    logoFile: null,
    googleSearch: "OBA Restaurante Casas Ibáñez",
    googlePlaceId: ""
  },
  {
    id: 2,
    nombre: "eñe",
    subtitulo: "Restaurante · Albacete",
    ubicacion: "Albacete",
    web: "",
    estado: "abierto",
    notaDia: "",
    theme: "ene",
    logoFile: "logo-ene.png",
    googleSearch: "Eñe by Cañitas restaurante Albacete",
    googlePlaceId: ""
  },
  {
    id: 3,
    nombre: "CAN DOMO",
    subtitulo: "Restaurante · Ibiza",
    ubicacion: "Ibiza",
    web: "",
    estado: "abierto",
    notaDia: "",
    theme: "candomo",
    logoFile: "logo-candomo.webp",
    googleSearch: "Can Domo restaurante Ibiza",
    googlePlaceId: ""
  },
  {
    id: 4,
    nombre: "Cañitas Maite",
    subtitulo: "Restaurante · Málaga",
    ubicacion: "Málaga",
    web: "",
    estado: "abierto",
    notaDia: "",
    theme: "canitas",
    logoFile: "logo-canitas.png",
    googleSearch: "Cañitas Maite Málaga restaurante",
    googlePlaceId: ""
  },
  {
    id: 5,
    nombre: "CEBO",
    subtitulo: "Restaurante · Madrid",
    ubicacion: "Madrid",
    web: "",
    estado: "abierto",
    notaDia: "",
    theme: "cebo",
    logoFile: null,
    googleSearch: "CEBO restaurante Hotel Urban Madrid",
    googlePlaceId: ""
  },
];
const LOCAL_KEY = "oba_intranet_v4";
const PIPELINE_STAGES = [
  { key: "contactado",     label: "Contactado",      cls: "pip-contactado" },
  { key: "docs_enviados",  label: "Docs enviados",   cls: "pip-docs_enviados" },
  { key: "docs_recibidos", label: "Docs recibidos",  cls: "pip-docs_recibidos" },
  { key: "confirmado",     label: "Confirmado",      cls: "pip-confirmado" },
  { key: "activo",         label: "En prácticas",    cls: "pip-activo" },
  { key: "evaluado",       label: "Evaluado",        cls: "pip-evaluado" }
];
const DOC_CHECKLIST = [
  { key: "convenio",    label: "Convenio firmado por el centro" },
  { key: "seguro",      label: "Seguro de prácticas" },
  { key: "solicitud",   label: "Formulario de solicitud recibido" },
  { key: "bienvenida",  label: "Carta de bienvenida enviada" },
  { key: "evaluacion",  label: "Evaluación final enviada al centro" }
];
const WA_PRAC_TEMPLATES = [
  { label: "Confirmación", text: (n) => `Hola ${n}, confirmamos tu plaza de prácticas en OBA. ¡Estamos encantados de recibirte!` },
  { label: "Docs pendientes", text: (n) => `Hola ${n}, tenemos documentación pendiente de tu parte. ¿Puedes enviárnosla lo antes posible? Gracias.` },
  { label: "Bienvenida", text: (n) => `¡Hola ${n}! Mañana empieza tu etapa en OBA. Bienvenido al equipo, cualquier duda escríbenos.` },
  { label: "Cierre", text: (n) => `Hola ${n}, ahora que terminan tus prácticas nos gustaría saber tu opinión sobre la experiencia. ¡Gracias por todo!` }
];
const INSTALL_BANNER_DISMISSED_KEY = "oba_install_banner_dismissed_v1";
const GROQ = "https://api.groq.com/openai/v1/chat/completions";
// Las sugerencias se generan dinámicamente en iaSugsData()

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
  { id: 8, ing: "Shio koji", platos: "Paloma torcaz · Entresijos", cat: "Fermentos", prov: "", cant: "" },
  { id: 9, ing: "Mantequilla", platos: "Beurre blanc · Holandesa", cat: "Fermentos", prov: "", cant: "" },
  { id: 10, ing: "Pectina", platos: "Pâté de fruit", cat: "Fermentos", prov: "", cant: "" }
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
  practicantes: [],
  centros: [],
  habitaciones: [
    { id: 601, casa: "Casa Vega",           nombre: "Habitación 1", capacidad: 2, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" },
    { id: 602, casa: "Casa Vega",           nombre: "Habitación 2", capacidad: 2, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" },
    { id: 603, casa: "Casa Vega",           nombre: "Habitación 3", capacidad: 2, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" },
    { id: 604, casa: "Casa Oba",            nombre: "Habitación 1", capacidad: 2, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" },
    { id: 605, casa: "Casa Oba",            nombre: "Habitación 2", capacidad: 1, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" },
    { id: 606, casa: "Apartamentos Paloma", nombre: "Apartamento",  capacidad: 4, literas: false, estado: "libre", ocupantes: [], ocupantesCañitas: [], notas: "" }
  ],
  pedidosHistorial: [],
  descargables: [],
  empresas: [],
  grupo_descargables: [],
  oba_recetas: [], oba_menus: [], oba_ideas: [], oba_kpis: [],
  ene_recetas: [], ene_menus: [], ene_ideas: [], ene_kpis: [],
  candomo_recetas: [], candomo_menus: [], candomo_ideas: [], candomo_kpis: [],
  canitas_recetas: [], canitas_menus: [], canitas_ideas: [], canitas_kpis: [],
  cebo_recetas: [], cebo_menus: [], cebo_ideas: [], cebo_kpis: []
};

// Hamburger menu — stubbed until setupHamburgerMenu() runs
window.closeHamburger = () => {};
window.openHamburger  = () => {};
window.toggleHamburger = () => {};

let db = null;
let storageMode = "local";
let D = cloneDefaults();
let nid = 500;
let cY = new Date().getFullYear();
let cM = new Date().getMonth();
let pedT = "lista";
let pedSort = false;
let activeRecipeId = null;
let activeRestRecipeId = null;
let restRecipePrintMarkup = "";
let restRecipeEmpId = null;
let restRecipeCol = "";
let iaH = [];
// Recipe scaling state
let _scaleBase = 1;      // original raciones (main rdet)
let _scaleCur = 1;       // current raciones (main rdet)
let _rscaleBase = 1;     // original raciones (restdet)
let _rscaleCur = 1;      // current raciones (restdet)

function _initScaleBar(_barId, _nId, _baseId, _base) { /* scale bar is now rendered inline in the ficha body */ }

function changeScale(delta) {
  const next = Math.max(1, _scaleCur + delta);
  _scaleCur = next;
  const recipe = D.recipes.find((r) => r.id === activeRecipeId);
  if (!recipe) return;
  const factor = _scaleCur / _scaleBase;
  printRecipeMarkup = buildFichaHTML(recipe, factor);
  document.getElementById("rdbody").innerHTML = printRecipeMarkup;
}

function changeRestScale(delta) {
  const next = Math.max(1, _rscaleCur + delta);
  _rscaleCur = next;
  const recipe = (D[`${restRecipeCol}_recetas`] || []).find((r) => r._i === activeRestRecipeId);
  if (!recipe) return;
  const factor = _rscaleCur / _rscaleBase;
  restRecipePrintMarkup = buildRestFichaHTML(recipe, factor);
  document.getElementById("restdet-body").innerHTML = restRecipePrintMarkup;
}
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

function getPipelineStage(item) {
  if (item.pipeline) return item.pipeline;
  if (item.estado === "activo") return "activo";
  if (item.estado === "finalizado") return "evaluado";
  return "contactado";
}

function setEstadoFromPipeline(pip) {
  if (pip === "activo") return "activo";
  if (pip === "evaluado") return "finalizado";
  return "pendiente";
}

function today() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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

function updateOverlayState() {
  const hasOpenOverlay = ["modal", "rdet", "pfdet", "restdet"].some((id) => document.getElementById(id)?.classList.contains("open"));
  document.body.classList.toggle("overlay-open", hasOpenOverlay);
}

function showLoginForm() {
  updateStorageStatus();
  const form = document.getElementById("lf");
  if (form) form.style.display = "flex";
  if (sessionStorage.getItem("oba-auth") === "1") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("visible");
    setLoginMode(false);
    const greetEl = document.getElementById("greet-sub");
    if (greetEl) greetEl.innerHTML = getGreeting();
    startApp();
  } else {
    setLoginMode(true);
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
  const slim = {};
  COLLECTIONS.forEach((col) => {
    slim[col] = FOTO_COLS.has(col)
      ? (D[col] || []).map(({ foto, ...rest }) => rest)
      : (D[col] || []);
  });
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(slim));
  } catch (e) {
    console.warn("localStorage lleno, limpiando caché:", e);
    localStorage.removeItem(LOCAL_KEY);
  }
}

async function loadFromFirebase() {
  const cols = [...COLLECTIONS];

  // Load all collections in parallel (was sequential — major speedup)
  await Promise.all(cols.map(async (col) => {
    try {
      const snap = await db.collection(col).get();
      if (snap.empty) {
        D[col] = JSON.parse(JSON.stringify(DEFAULTS[col] ?? []));
        try { await saveCol(col); } catch (e) { console.warn("saveCol failed for", col, e); }
      } else {
        const items = snap.docs.map((doc) => doc.data()).sort((a, b) => (a._i || 0) - (b._i || 0));
        D[col] = items.map((item, idx) => ({ ...item, _i: item._i ?? idx }));
      }
    } catch (e) {
      console.warn("loadFromFirebase: error loading collection", col, e);
      D[col] = JSON.parse(JSON.stringify(DEFAULTS[col] ?? []));
    }
  }));

  // Single render after all data is ready
  computeNextId();
  renderAll();

  // Live listeners — debounced so burst updates don't thrash the UI
  cols.forEach((col) => {
    db.collection(col).onSnapshot((snap) => {
      if (snap.empty) return;
      const items = snap.docs.map((doc) => doc.data()).sort((a, b) => (a._i || 0) - (b._i || 0));
      D[col] = items.map((item, idx) => ({ ...item, _i: item._i ?? idx }));
      computeNextId();
      scheduleRender();
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
    saveCol(col)
      .then(() => toast("✓ Guardado"))
      .catch((err) => { console.warn("Save error:", err); toast("Error al guardar", "err"); });
  } else {
    persistLocal();
    toast("✓ Guardado");
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
    setLoginMode(false);
    const greetEl = document.getElementById("greet-sub");
    if (greetEl) greetEl.innerHTML = getGreeting();
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
  setLoginMode(true);
  const pwd = document.getElementById("pwd");
  if (pwd) pwd.value = "";
}

function seedHabitaciones() {
  if (D.habitaciones.length === 0) {
    D.habitaciones = JSON.parse(JSON.stringify(DEFAULTS.habitaciones));
    save("habitaciones");
  }
}

function seedEmpresas() {
  if (!D.empresas || D.empresas.length === 0) {
    D.empresas = JSON.parse(JSON.stringify(EMPRESAS_SEED));
    save("empresas");
  } else {
    let changed = false;
    EMPRESAS_SEED.forEach((seed) => {
      const emp = D.empresas.find((e) => e.id === seed.id);
      if (emp) {
        // Sync fields that may have changed in seed
        ["logoFile", "theme", "subtitulo", "ubicacion", "googleSearch"].forEach((k) => {
          if (emp[k] !== seed[k]) { emp[k] = seed[k]; changed = true; }
        });
        if (emp.googlePlaceId === undefined) { emp.googlePlaceId = ""; changed = true; }
      } else {
        // New restaurant added to seed — insert it
        D.empresas.push(JSON.parse(JSON.stringify(seed)));
        changed = true;
      }
    });
    if (changed) save("empresas");
  }
}

function initTheme() {
  const saved = localStorage.getItem("oba_theme") || "light";
  applyTheme(saved, true);
}

function applyTheme(theme, silent) {
  document.documentElement.setAttribute("data-theme", theme);
  if (!silent) localStorage.setItem("oba_theme", theme);
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = theme === "dark" ? "ph-fill ph-sun" : "ph-fill ph-moon-stars";
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.content = theme === "dark" ? "#000000" : "#050505";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("oba_theme", next);
}

function startApp() {
  initTheme();
  seedHabitaciones();
  seedEmpresas();
  const label = formatLongDate(new Date());
  document.getElementById("hdate").textContent = label;
  document.getElementById("ifecha").textContent = label;

  // Escape key closes the topmost open overlay
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.getElementById("modal")?.classList.contains("open"))   { cModal();          return; }
    if (document.getElementById("restdet")?.classList.contains("open")) { closeRestRecipe(); return; }
    if (document.getElementById("rdet")?.classList.contains("open"))    { cRD();             return; }
    if (document.getElementById("pfdet")?.classList.contains("open"))   { cPF();             return; }
  });

  renderAll();
  fctLoadInvoices();
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
  const fns = [
    rInicio, rRec, rPedLista, rMenu, calRender, rPrac, rProj, rAv, rGrupo,
    () => { if (pedT === "resumen") rPedRes(); },
    () => { if (pedT === "prov") rPedProv(); },
    () => { if (pedT === "historial") rPedHistorial(); }
  ];
  fns.forEach((fn) => { try { fn(); } catch(e) { console.warn("renderAll error:", e); } });
}

function sp(id) {
  if (id === "grupo") { showGrupoPanel(); return; }
  if (id === "id") { showIDPanel(); return; }
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`panel-${id}`)?.classList.add("active");
  document.querySelector(`.nav-btn[data-panel="${id}"]`)?.classList.add("active");
  document.querySelector(`.hnav-btn[data-panel="${id}"]`)?.classList.add("active");
  scrollTop();
  closeHamburger();
  // Float bar visibility managed by updatePedFloatBar — hide when not on pedidos
  const fb = document.getElementById("ped-float-bar");
  if (fb && id !== "pedidos") fb.classList.remove("visible");
}

// ── I+D ──────────────────────────────────────────────
const ID_PWD = "hijodeladeisy";
const CANITAS_PWD = "cañitasgastro123";
const CANITAS_SESSION_KEY = "oba_canitas_unlocked_v1";
const ID_SESSION_KEY = "oba_id_unlocked_v1";

function showIDPanel() {
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById("panel-id")?.classList.add("active");
  document.querySelector('.nav-btn[data-panel="id"]')?.classList.add("active");
  document.querySelector('.hnav-btn[data-panel="id"]')?.classList.add("active");
  scrollTop();
  closeHamburger();
  document.getElementById("ped-float-bar")?.classList.remove("visible");
  const unlocked = sessionStorage.getItem(ID_SESSION_KEY) === "1";
  document.getElementById("id-gate").style.display = unlocked ? "none" : "flex";
  document.getElementById("id-content").style.display = unlocked ? "block" : "none";
  if (unlocked) showIDGrid();
}

function unlockID() {
  const val = document.getElementById("id-pwd").value;
  if (val === ID_PWD) {
    sessionStorage.setItem(ID_SESSION_KEY, "1");
    document.getElementById("id-err").textContent = "";
    document.getElementById("id-pwd").value = "";
    document.getElementById("id-gate").style.display = "none";
    document.getElementById("id-content").style.display = "block";
    showIDGrid();
  } else {
    const err = document.getElementById("id-err");
    err.textContent = "Contraseña incorrecta";
    document.getElementById("id-pwd").value = "";
    document.getElementById("id-pwd").focus();
  }
}

function lockID() {
  sessionStorage.removeItem(ID_SESSION_KEY);
  document.getElementById("id-gate").style.display = "flex";
  document.getElementById("id-content").style.display = "none";
  document.getElementById("id-pwd").value = "";
}

function unlockCanitas() {
  const val = document.getElementById("canitas-pwd").value;
  if (val === CANITAS_PWD) {
    sessionStorage.setItem(CANITAS_SESSION_KEY, "1");
    document.getElementById("canitas-pwd").value = "";
    rGrupo();
  } else {
    const err = document.getElementById("canitas-err");
    err.textContent = "Contraseña incorrecta";
    document.getElementById("canitas-pwd").value = "";
    document.getElementById("canitas-pwd").focus();
  }
}

function showIDGrid() {
  document.getElementById("id-grid-view").style.display = "block";
  document.getElementById("id-iframe-view").style.display = "none";
  const iframe = document.getElementById("id-iframe");
  iframe.src = "";
}

function openIDProject(name, path) {
  document.getElementById("id-grid-view").style.display = "none";
  document.getElementById("id-iframe-view").style.display = "block";
  document.getElementById("id-iframe-title").textContent = "I+D · " + name;
  document.getElementById("id-iframe").src = path;
  scrollTop();
}

function closeIDProject() {
  showIDGrid();
  scrollTop();
}

function printIDProject() {
  const iframe = document.getElementById("id-iframe");
  if (!iframe) return;
  document.body.classList.add("printing-id");
  const cleanup = () => document.body.classList.remove("printing-id");
  window.addEventListener("afterprint", cleanup, { once: true });
  // Small delay so the CSS is applied before the dialog opens
  setTimeout(() => window.print(), 80);
}
// ─────────────────────────────────────────────────────

function bsec(section) {
  const map = { Bosque: "bosque", Afluente: "fluvial", Rivera: "fluvial", Corral: "corral", Caza: "caza", Acantilado: "caza", "Monte Bajo": "caza", Llanura: "corral", Postres: "postre", Huerta: "huerta", Bienvenida: "base" };
  return `<span class="badge b-${map[section] || "base"}">${safeText(section)}</span>`;
}

function brestSec(section) {
  const map = { Entrantes: "huerta", Principales: "bosque", Postres: "postre", Snacks: "corral", Bebidas: "fluvial", "Bases y Técnicas": "base" };
  return `<span class="badge b-${map[section] || "base"}">${safeText(section)}</span>`;
}

function bcat(category) {
  const normalized = normalizeIngredientCategory(category);
  const map = { Bosque: "bosque", Afluente: "fluvial", Rivera: "fluvial", Corral: "corral", Caza: "caza", Acantilado: "caza", "Monte Bajo": "caza", Llanura: "corral", Postre: "postre", Postres: "postre", Huerta: "huerta", Bienvenida: "base", Fermentos: "base" };
  return `<span class="badge b-${map[normalized] || "base"}">${safeText(normalized)}</span>`;
}

function normalizeIngredientCategory(category) {
  return category === "Base/Fermentos" ? "Fermentos" : category;
}

function oModal(html) {
  document.getElementById("mi").innerHTML = html;
  document.getElementById("modal").classList.add("open");
  updateOverlayState();
  setTimeout(() => {
    document.querySelector("#mi input, #mi textarea, #mi select")?.focus();
  }, 60);
}

function cModal() {
  document.getElementById("modal").classList.remove("open");
  updateOverlayState();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return `${ico('sun', 20)} Buenos días`;
  if (h >= 12 && h < 21) return `${ico('cloud-sun', 20)} Buenas tardes`;
  return `${ico('moon', 20)} Buenas noches`;
}

function rInicio() {
  // Greeting by time of day
  const greetEl = document.getElementById("greet-sub");
  if (greetEl) greetEl.innerHTML = getGreeting();

  // Urgent banner
  const urgent = D.avisos.filter((item) => item.urgente);
  const urgentBanner = document.getElementById("home-urgent-banner");
  if (urgentBanner) {
    urgentBanner.innerHTML = urgent.length
      ? urgent.map((item) => `
        <div class="home-urgent-card">
          <div class="home-urgent-tag">${ico('warning-circle')} Urgente</div>
          <div class="home-urgent-title">${safeText(item.titulo)}</div>
          <div class="home-urgent-text">${safeText(item.texto)}</div>
          <div class="home-urgent-meta">${safeText(item.autor)} · ${safeText(item.fecha)}</div>
        </div>`).join("")
      : "";
  }

  // Stats
  const stats = [
    { icon: ico('fork-knife', 22), label: "Platos", value: D.recipes.length, section: "recetario", color: "amber" },
    { icon: ico('package', 22), label: "Ingredientes", value: D.ingredientes.length, section: "pedidos", color: "blue" },
    { icon: ico('chef-hat', 22), label: "Practicantes", value: D.practicantes.filter((p) => p.estado === "activo").length, section: "practicantes", color: "green" },
    { icon: ico('lightbulb', 22), label: "Proyectos", value: D.proyectos.filter((p) => p.estado === "activo").length, section: "proyectos", color: "purple" }
  ];
  const icardsEl = document.getElementById("icards");
  if (icardsEl) icardsEl.innerHTML = stats.map((s) => `
    <button class="home-stat-card home-stat-${s.color}" onclick="sp('${s.section}')">
      <span class="home-stat-icon">${s.icon}</span>
      <strong class="home-stat-value">${s.value}</strong>
      <span class="home-stat-label">${s.label}</span>
    </button>`).join("");

  // Feed
  const activeMenu = D.menu.filter((item) => item.estado === "activo").slice(0, 4);
  const upcoming = [...D.eventos]
    .filter((e) => e.fecha >= today())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 3);
  const recentNotices = [...D.avisos].reverse().slice(0, 2);

  let feed = "";
  if (activeMenu.length) {
    feed += `<div class="home-feed-block">
      <div class="home-feed-header"><span class="home-feed-dot dot-menu"></span>Menú activo</div>
      ${activeMenu.map((item) => `
        <div class="home-feed-item">
          <span class="home-feed-item-name">${safeText(item.plato)}</span>
          <span class="home-feed-item-meta">${safeText(item.seccion)}</span>
        </div>`).join("")}
    </div>`;
  }
  if (upcoming.length) {
    feed += `<div class="home-feed-block">
      <div class="home-feed-header"><span class="home-feed-dot dot-event"></span>Próximos eventos</div>
      ${upcoming.map((item) => `
        <div class="home-feed-item">
          <span class="home-feed-item-name">${safeText(item.titulo)}</span>
          <span class="home-feed-item-meta">${safeText(item.fecha)}</span>
        </div>`).join("")}
    </div>`;
  }
  if (recentNotices.length) {
    feed += `<div class="home-feed-block">
      <div class="home-feed-header"><span class="home-feed-dot dot-notice"></span>Últimos avisos</div>
      ${recentNotices.map((item) => `
        <div class="home-feed-item">
          <span class="home-feed-item-name">${safeText(item.titulo)}</span>
          <span class="home-feed-item-meta">${safeText(item.autor)} · ${safeText(item.fecha)}</span>
        </div>`).join("")}
    </div>`;
  }
  const feedEl = document.getElementById("today-feed");
  if (feedEl) feedEl.innerHTML = feed ||
    `<div class="home-feed-empty">Sin actividad registrada hoy</div>`;
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

function buildFichaHTML(recipe, scale = 1) {
  const subs = recipe.subrecetas || [];
  const alerg = recipe.alergenos || [];
  const photo = recipe.foto ? `<img src="${recipe.foto}" alt="${safeText(recipe.nombre)}" style="width:100%;max-height:280px;object-fit:cover;border-radius:24px;margin-bottom:20px">` : "";
  const ingredients = (recipe.ingredientes || []).length ? `
    <div class="rs">
      <h4>Ingredientes principales</h4>
      <div class="ig">
        <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
        ${(recipe.ingredientes || []).map((raw) => { const item = normalizeIngItem(raw); return `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(scaleQty(item.c, scale) || "—")}</div><div>${safeText(item.u || "")}</div>`; }).join("")}
      </div>
    </div>` : "";
  const subsHtml = subs.map((sub) => `
    <div class="rs">
      <h4>Subreceta · ${safeText(sub.nombre)}</h4>
      ${sub.descripcion ? `<p style="margin-bottom:10px;color:#5e5a54">${safeText(sub.descripcion)}</p>` : ""}
      ${(sub.ingredientes || []).length ? `
        <div class="ig" style="margin-bottom:14px">
          <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
          ${(sub.ingredientes || []).map((raw) => { const item = normalizeIngItem(raw); return `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(scaleQty(item.c, scale) || "—")}</div><div>${safeText(item.u || "")}</div>`; }).join("")}
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

  const scaleBar = _scaleBase > 0 ? `
    <div class="scale-bar">
      <span class="scale-label">Base: <strong>${_scaleBase}</strong> rac.</span>
      <div class="scale-ctrl">
        <span class="scale-label">Escalar a:</span>
        <button class="scale-btn" onclick="changeScale(-1)">−</button>
        <strong>${_scaleCur}</strong>
        <button class="scale-btn" onclick="changeScale(1)">+</button>
        <span class="scale-label">raciones</span>
      </div>
    </div>` : "";
  return `
    <div class="recipe-brand">
      <img class="logo-mark logo-mark-black" src="${logoWhiteUrl()}" alt="OBA">
    </div>
    ${photo}
    ${scaleBar}
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
  _scaleBase = parseRaciones(recipe.raciones) || 4;
  _scaleCur = _scaleBase;
  _initScaleBar("rdet-scalebar", "rdet-scale-n", "rdet-scale-base", _scaleBase);
  document.getElementById("rdtit").textContent = recipe.nombre;
  printRecipeMarkup = buildFichaHTML(recipe);
  document.getElementById("rdbody").innerHTML = printRecipeMarkup;
  document.getElementById("rdet").classList.add("open");
  updateOverlayState();
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
      @page{size:A4;margin:14mm 12mm 14mm 12mm}
      body{font-family:Arial,sans-serif;padding:0;margin:0;line-height:1.32;color:#111;font-size:11px}
      h1{font-size:22px;line-height:1.1;margin:0 0 10px}
      h4{font-size:10px;text-transform:uppercase;letter-spacing:.12em;border-bottom:1px solid #ddd;padding-bottom:5px;margin:14px 0 8px}
      p{margin:0 0 8px}
      strong{font-size:inherit}
      .notice{padding:10px 12px;border-left:4px solid #5f7f4c;background:#eef3ea;font-size:10.5px}
      .ig{display:grid;grid-template-columns:minmax(0,1.6fr) auto auto;gap:5px 10px;align-items:baseline;font-size:10.5px}
      .ih{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#726b61}
      .sl{list-style:none;padding:0;margin:0}
      .sl li{display:flex;gap:8px;margin-bottom:6px;padding:8px 9px;background:#f6f4ee;font-size:10.5px}
      .sn{font-weight:700;color:#405735;min-width:14px}
      img{max-width:100%;display:block}
      .recipe-brand{display:none}
      .print-brand{position:fixed;top:10mm;right:12mm}
      .print-brand img{width:78px;height:auto;display:block;filter:invert(1);background:transparent;border:none;box-shadow:none}
      .rs{margin-bottom:12px}
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

function saveFichaPdf() {
  printFicha();
}

function cRD() {
  document.getElementById("rdet").classList.remove("open");
  history.replaceState(null, "", "#");
  activeRecipeId = null;
  updateOverlayState();
}

// Normalise an ingredient that may be a plain string ("2 kg patatas cocidas")
// or the expected object { i, c, u }
function normalizeIngItem(item) {
  if (typeof item !== "string") return item || {};
  // "c/s perejil"  or  "c/s de perejil"
  const cs = item.match(/^(c\/s)\s+(?:de\s+)?(.+)$/i);
  if (cs) return { c: "c/s", u: "", i: cs[2] };
  // "300 gr aceite 0,4"  /  "9 uds cuerpos de gambas"  /  "2 kg patatas"
  const m = item.match(/^(\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)?)\s+([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+\.?)\s+(.+)$/);
  if (m) return { c: m[1], u: m[2], i: m[3] };
  // Just a name with no quantity ("Patatas cocidas")
  return { i: item, c: "", u: "" };
}

function ingredientItemHtml(raw = {}) {
  const item = normalizeIngItem(raw);
  const qty = safeText(item.c || "—");
  const unit = safeText(item.u || "");
  return `
    <div class="ingredient-item" data-i="${safeText(item.i || "")}" data-c="${safeText(item.c || "")}" data-u="${safeText(item.u || "")}">
      <div class="ingredient-item-main">
        <strong>${safeText(item.i || "Sin ingrediente")}</strong>
        <span class="ingredient-item-sep">·</span>
        <span>${qty}</span>
        <span>${unit}</span>
      </div>
      <button class="ingredient-item-remove" type="button" onclick="removeIngredientItem(this)" aria-label="Eliminar ingrediente">×</button>
    </div>`;
}

function ingredientItemsHtml(items = []) {
  if (!items.length) return `<div class="ingredient-empty">Todavía no has añadido ingredientes.</div>`;
  return items.map((item) => ingredientItemHtml(item)).join("");
}

function ingredientComposerHtml(listId, addFnName) {
  return `
    <div class="ingredient-composer">
      <div class="ingredient-composer-labels">
        <span>Ingrediente</span>
        <span>Cantidad</span>
        <span>Unidad</span>
      </div>
      <div class="ingredient-composer-row">
        <input id="${listId}-name" class="ingredient-name" type="text" placeholder="Ingrediente">
        <input id="${listId}-qty" class="ingredient-qty" type="text" placeholder="Cantidad">
        <input id="${listId}-unit" class="ingredient-unit" type="text" placeholder="Unidad">
        <button class="secondary-btn ingredient-add-btn" type="button" onclick="${addFnName}('${listId}')">Añadir</button>
      </div>
    </div>`;
}

function appendIngredientItem(listId, item) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.querySelector(".ingredient-empty")?.remove();
  list.insertAdjacentHTML("beforeend", ingredientItemHtml(item));
}

function addIngredientFromComposer(listId) {
  const nameInput = document.getElementById(`${listId}-name`);
  const qtyInput = document.getElementById(`${listId}-qty`);
  const unitInput = document.getElementById(`${listId}-unit`);
  const item = {
    i: nameInput?.value.trim() || "",
    c: qtyInput?.value.trim() || "",
    u: unitInput?.value.trim() || ""
  };
  if (!item.i) {
    nameInput?.focus();
    return;
  }
  appendIngredientItem(listId, item);
  if (nameInput) nameInput.value = "";
  if (qtyInput) qtyInput.value = "";
  if (unitInput) unitInput.value = "";
  nameInput?.focus();
}

function addMainIngredient(listId) {
  addIngredientFromComposer(listId);
}

function addSubIngredient(listId) {
  addIngredientFromComposer(listId);
}

function removeIngredientItem(button) {
  const item = button?.closest(".ingredient-item");
  const list = item?.parentElement;
  item?.remove();
  if (list && !list.querySelector(".ingredient-item")) {
    list.innerHTML = `<div class="ingredient-empty">Todavía no has añadido ingredientes.</div>`;
  }
}

function collectIngredientItems(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll(".ingredient-item")).map((item) => ({
    i: item.dataset.i || "",
    c: item.dataset.c || "",
    u: item.dataset.u || ""
  })).filter((item) => item.i || item.c || item.u);
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
      <div class="allergen-grid">
        ${ALERGEN_LIST.map((item) => `<label class="allergen-option"><input type="checkbox" id="al_${item.replace(/\s/g, "_")}" ${alerg.includes(item) ? "checked" : ""}> <span>${item}</span></label>`).join("")}
      </div>
    </div>
    <div class="fr"><label>Ingredientes principales</label>
      <div class="ingredient-editor">
        <div class="ingredient-items" id="ri-rows">${ingredientItemsHtml(recipe?.ingredientes || [])}</div>
        ${ingredientComposerHtml("ri-rows", "addMainIngredient")}
      </div>
    </div>
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
    <div class="sub-block" data-idx="${index}">
      <div class="sub-block-head">
        <strong>Subreceta ${index + 1}</strong>
        <button class="btn btn-s btn-d" type="button" onclick="removeSub(${index})">Eliminar</button>
      </div>
      <input id="sn_${index}" placeholder="Nombre" value="${safeText(sub.nombre || "")}" style="margin-bottom:8px">
      <textarea id="sd_${index}" placeholder="Descripción" style="margin-bottom:8px">${safeText(sub.descripcion || "")}</textarea>
      <div class="ingredient-editor" style="margin-bottom:8px">
        <div class="ingredient-items" id="si-rows-${index}">${ingredientItemsHtml(sub.ingredientes || [])}</div>
        ${ingredientComposerHtml(`si-rows-${index}`, "addSubIngredient")}
      </div>
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
      ingredientes: collectIngredientItems(`si-rows-${idx}`),
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
      ingredientes: collectIngredientItems("ri-rows"),
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
  if (pedT === "historial") rPedHistorial();
}

function toggleSort() {
  pedSort = !pedSort;
  const btn = document.getElementById("pt-sort");
  if (btn) btn.textContent = pedSort ? "A→Z ✓" : "A→Z";
  onPedSearch();
}

function pedTab(tab) {
  pedT = tab;
  ["lista", "resumen", "prov", "historial"].forEach((item) => {
    document.getElementById(`pp-${item}`).style.display = item === tab ? "block" : "none";
    document.getElementById(`pt-${item}`)?.classList.toggle("active", item === tab);
  });
  onPedSearch();
  updatePedFloatBar();
}

function pedidoProviderLabel(provider) {
  return provider || "Sin proveedor";
}

function pedidoDateLabel(rawDate) {
  if (!rawDate) return "Sin fecha";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return safeText(rawDate);
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function getCurrentPedidoItems() {
  return D.ingredientes
    .filter((item) => String(item.cant || "").trim())
    .map((item) => ({
      ing: item.ing,
      cant: String(item.cant || "").trim(),
      cat: normalizeIngredientCategory(item.cat),
      prov: item.prov || "",
      platos: item.platos || ""
    }));
}

function groupPedidoItems(items = []) {
  const groups = {};
  items.forEach((item) => {
    const key = pedidoProviderLabel(item.prov);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  let entries = Object.entries(groups);
  if (pedSort) entries.sort((a, b) => a[0].localeCompare(b[0], "es"));
  return entries;
}

function guardarPedidoActual() {
  const items = getCurrentPedidoItems();
  if (!items.length) {
    alert("Añade al menos una cantidad antes de guardar el pedido.");
    return;
  }
  D.pedidosHistorial.unshift({
    id: nid++,
    fecha: today(),
    creado: new Date().toISOString(),
    lineas: items
  });
  save("pedidosHistorial");
  alert("Pedido guardado en el histórico.");
}

function limpiarPedido() {
  const activeItems = D.ingredientes.filter((item) => String(item.cant || "").trim());
  if (!activeItems.length) {
    alert("No hay cantidades activas que limpiar.");
    return;
  }
  if (!confirm("¿Quieres borrar las cantidades del pedido actual?")) return;
  activeItems.forEach((item) => {
    item.cant = "";
  });
  save("ingredientes");
  updatePedFloatBar();
}

function rPedLista() {
  const q = pedSearch();
  let items = q ? D.ingredientes.filter((item) => item.ing.toLowerCase().includes(q) || (item.prov || "").toLowerCase().includes(q) || (item.platos || "").toLowerCase().includes(q)) : D.ingredientes;
  if (pedSort) items = [...items].sort((a, b) => a.ing.localeCompare(b.ing, "es"));

  const groups = {};
  items.forEach((item) => {
    const key = pedidoProviderLabel(item.prov);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  let entries = Object.entries(groups);
  if (pedSort) entries.sort((a, b) => a[0].localeCompare(b[0], "es"));

  const activeItems = D.ingredientes.filter((item) => String(item.cant || "").trim());
  const activeCount = activeItems.length;
  const activeProviders = new Set(activeItems.map((item) => pedidoProviderLabel(item.prov))).size;

  // Build preview groups
  const previewGroups = {};
  activeItems.forEach((item) => {
    const key = pedidoProviderLabel(item.prov);
    if (!previewGroups[key]) previewGroups[key] = [];
    previewGroups[key].push(item);
  });
  const previewCollapsed = sessionStorage.getItem("ped-preview-collapsed") === "1";

  const previewBodyHtml = activeItems.length
    ? Object.entries(previewGroups).map(([prov, items]) => `
        <div class="ped-preview-group">
          <div class="ped-preview-prov">${ico("storefront", 12)} ${safeText(prov)}</div>
          <div class="ped-preview-chips">
            ${items.map((item) => `
              <div class="ped-preview-chip">
                <span class="ped-preview-chip-name">${safeText(item.ing)}</span>
                <span class="ped-preview-chip-qty">${safeText(item.cant)}</span>
                <button class="ped-preview-chip-rm" onclick="event.stopPropagation();clearQty(${item.id})" title="Quitar cantidad">×</button>
              </div>`).join("")}
          </div>
        </div>`).join("")
    : `<div class="ped-preview-empty">${ico("basket", 22)}<span>Aún no has añadido cantidades. Rellena los campos de cantidad en la lista de abajo.</span></div>`;

  document.getElementById("pp-lista").innerHTML = `
    <div class="ped-preview">
      <div class="ped-preview-head" onclick="togglePedPreview()">
        <div class="ped-preview-title">
          ${ico("receipt", 16)} Pedido actual
          ${activeCount ? `<span class="ped-preview-count">${activeCount} ítem${activeCount !== 1 ? "s" : ""} · ${activeProviders} proveedor${activeProviders !== 1 ? "es" : ""}</span>` : `<span class="ped-preview-count ped-preview-count-empty">Vacío</span>`}
        </div>
        <span class="ped-preview-toggle">${ico(previewCollapsed ? "caret-down" : "caret-up", 16)}</span>
      </div>
      ${previewCollapsed ? "" : `<div class="ped-preview-body">${previewBodyHtml}</div>`}
    </div>
    <div class="pedido-list-groups">
      ${entries.length ? entries.map(([provider, providerItems]) => `
        <div class="pedido-group-card">
          <div class="pedido-group-head">
            <div>
              <strong>${safeText(provider)}</strong>
              <span>${providerItems.length} ingrediente${providerItems.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div class="pedido-group-body">
            ${providerItems.map((item) => `
              <div class="pedido-item-row">
                <div class="pedido-item-main">
                  <div class="pedido-item-title-row">
                    <strong>${safeText(item.ing)}</strong>
                    ${bcat(item.cat)}
                    ${fctPriceBadge(item.ing)}
                  </div>
                  <div class="pedido-item-sub">${safeText(item.platos || "Sin plato asociado")}</div>
                </div>
                <div class="pedido-item-controls">
                  <label>
                    <span>Proveedor</span>
                    ${D.proveedores.length ? `
                      <select onchange="uIng(${item.id},'prov',this.value)">
                        ${D.proveedores.map((prov) => `<option value="${safeText(prov.nombre)}"${item.prov === prov.nombre ? " selected" : ""}>${safeText(prov.nombre)}</option>`).join("")}
                        <option value=""${!item.prov ? " selected" : ""}>Sin proveedor</option>
                      </select>` :
                      `<input type="text" value="${safeText(item.prov || "")}" onchange="uIng(${item.id},'prov',this.value)" placeholder="Proveedor">`}
                  </label>
                  <label class="pedido-qty-field">
                    <span>Cantidad</span>
                    <input type="text" value="${safeText(item.cant || "")}" onchange="uIng(${item.id},'cant',this.value)" placeholder="Ej: 2 kg">
                  </label>
                  <button class="danger-icon-btn" onclick="dIng(${item.id})" aria-label="Eliminar ingrediente">×</button>
                </div>
              </div>`).join("")}
          </div>
        </div>`).join("") : `<div class="notice"><strong>Sin resultados</strong><div>No hemos encontrado ingredientes con esa búsqueda.</div></div>`}
    </div>`;
  updatePedFloatBar();
}

function uIng(id, field, value) {
  const ing = D.ingredientes.find((item) => item.id === id);
  if (!ing) return;
  ing[field] = field === "cat" ? normalizeIngredientCategory(value) : value;
  save("ingredientes");
}

function clearQty(id) {
  const ing = D.ingredientes.find((item) => item.id === id);
  if (!ing) return;
  ing.cant = "";
  save("ingredientes");
  updatePedFloatBar();
}

function togglePedPreview() {
  const collapsed = sessionStorage.getItem("ped-preview-collapsed") === "1";
  sessionStorage.setItem("ped-preview-collapsed", collapsed ? "0" : "1");
  rPedLista();
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
  const items = D.ingredientes.filter((item) => item.prov === provider && String(item.cant || "").trim());
  if (!items.length) {
    alert("Solo se enviarán ingredientes con cantidad. Este proveedor aún no tiene cantidades asignadas.");
    return;
  }
  const message = encodeURIComponent([
    "Pedido OBA",
    formatLongDate(new Date()),
    `Proveedor: ${provider}`,
    "",
    ...items.map((item) => `• ${item.ing} — ${item.cant}`)
  ].join("\n"));
  const number = String(phone || "").replace(/\s/g, "");
  window.open(number ? `https://wa.me/34${number}?text=${message}` : `https://wa.me/?text=${message}`, "_blank");
}

function deletePedidoHistorial(id) {
  if (!confirm("¿Eliminar este pedido guardado del histórico?")) return;
  D.pedidosHistorial = D.pedidosHistorial.filter((item) => item.id !== id);
  save("pedidosHistorial");
}

function rPedHistorialStats(all) {
  if (!all.length) return "";

  // Ingredient frequency
  const ingCount = {};
  const provCount = {};
  all.forEach(entry => {
    (entry.lineas || []).forEach(l => {
      if (l.ing) ingCount[l.ing] = (ingCount[l.ing] || 0) + 1;
      if (l.prov) provCount[l.prov] = (provCount[l.prov] || 0) + 1;
    });
  });

  const topIngs = Object.entries(ingCount).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const topProvs = Object.entries(provCount).sort((a,b) => b[1]-a[1]).slice(0, 4);
  const maxIng = topIngs[0]?.[1] || 1;

  // Average lines per order
  const avgLines = Math.round(all.reduce((s,e) => s + (e.lineas||[]).length, 0) / all.length);

  // Days between orders
  const dates = all.map(e => new Date(e.creado || e.fecha || 0)).filter(d => d > 0).sort((a,b) => a-b);
  let avgDays = null;
  if (dates.length >= 2) {
    const gaps = [];
    for (let i = 1; i < dates.length; i++) gaps.push((dates[i]-dates[i-1]) / 86400000);
    avgDays = Math.round(gaps.reduce((s,g)=>s+g,0) / gaps.length);
  }

  return `
    <div class="pedh-stats">
      <div class="pedh-stats-head">Estadísticas de pedidos</div>
      <div class="pedh-kpis">
        <div class="pedh-kpi"><div class="pedh-kpi-val">${all.length}</div><div class="pedh-kpi-label">Pedidos guardados</div></div>
        <div class="pedh-kpi"><div class="pedh-kpi-val">${avgLines}</div><div class="pedh-kpi-label">Media de líneas</div></div>
        ${avgDays != null ? `<div class="pedh-kpi"><div class="pedh-kpi-val">${avgDays}d</div><div class="pedh-kpi-label">Entre pedidos</div></div>` : ""}
        <div class="pedh-kpi"><div class="pedh-kpi-val">${Object.keys(ingCount).length}</div><div class="pedh-kpi-label">Ingredientes distintos</div></div>
      </div>

      <div class="pedh-stats-cols">
        <div class="pedh-col">
          <div class="pedh-col-title">Lo más pedido</div>
          ${topIngs.map(([ing, n]) => `
            <div class="pedh-bar-row">
              <span class="pedh-bar-label">${safeText(ing)}</span>
              <div class="pedh-bar-track"><div class="pedh-bar-fill" style="width:${Math.round(n/maxIng*100)}%"></div></div>
              <span class="pedh-bar-count">${n}×</span>
            </div>`).join("")}
        </div>
        <div class="pedh-col">
          <div class="pedh-col-title">Proveedores frecuentes</div>
          ${topProvs.map(([prov, n], i) => `
            <div class="pedh-prov-row">
              <span class="pedh-prov-rank">${i+1}</span>
              <span class="pedh-prov-name">${safeText(prov)}</span>
              <span class="pedh-prov-count">${n} pedido${n!==1?"s":""}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

function rPedHistorial() {
  const q = pedSearch();
  let items = [...(D.pedidosHistorial || [])].sort((a, b) => new Date(b.creado || b.fecha || 0) - new Date(a.creado || a.fecha || 0));
  if (q) {
    items = items.filter((entry) => {
      const dateLabel = pedidoDateLabel(entry.creado || entry.fecha).toLowerCase();
      return dateLabel.includes(q) || (entry.lineas || []).some((line) =>
        (line.ing || "").toLowerCase().includes(q) ||
        (line.prov || "").toLowerCase().includes(q) ||
        (line.cant || "").toLowerCase().includes(q)
      );
    });
  }

  const all = D.pedidosHistorial || [];
  let statsHtml = "";
  if (!q && all.length) { try { statsHtml = rPedHistorialStats(all); } catch(e) { console.warn("stats error:", e); } }
  document.getElementById("pp-historial").innerHTML = items.length ? `
    ${statsHtml}
    <div class="pedido-history-list">
      ${items.map((entry) => {
        const groups = groupPedidoItems(entry.lineas || []);
        return `
          <div class="pedido-history-card">
            <div class="pedido-history-head">
              <div>
                <strong>${pedidoDateLabel(entry.creado || entry.fecha)}</strong>
                <span>${(entry.lineas || []).length} línea${(entry.lineas || []).length === 1 ? "" : "s"} guardada${(entry.lineas || []).length === 1 ? "" : "s"}</span>
              </div>
              <button class="danger-icon-btn" onclick="deletePedidoHistorial(${entry.id})" aria-label="Eliminar pedido guardado">×</button>
            </div>
            <div class="pedido-history-body">
              ${groups.map(([provider, providerItems]) => `
                <div class="pedido-history-provider">
                  <div class="pedido-history-provider-title">${safeText(provider)}</div>
                  <div class="pedido-history-provider-items">
                    ${providerItems.map((item) => `
                      <div class="pedido-history-line">
                        <strong>${safeText(item.ing)}</strong>
                        <span>${safeText(item.cant)}</span>
                      </div>`).join("")}
                  </div>
                </div>`).join("")}
            </div>
          </div>`;
      }).join("")}
    </div>` : `<div class="notice"><strong>Sin pedidos guardados</strong><div>Guarda el pedido actual para consultar lo que se pidió la semana anterior.</div></div>`;
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
    cat: normalizeIngredientCategory(document.getElementById("ic").value),
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
      return `<div class="${cls}">${item.tipo === "especial" ? `${ico('star',12)} ` : item.urgente ? `${ico('warning',12)} ` : ""}${safeText(item.titulo)}</div>`;
    }).join("");
    content += trainees.map((item) => `<div class="ce-prac" onclick="event.stopPropagation();oPF(${item.id})">${ico('user', 14)} ${safeText(item.nombre)}</div>`).join("");
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

let pracView = "pipeline";
let pracCalY = new Date().getFullYear();
let pracCalM = new Date().getMonth();

function setPracView(view) {
  pracView = view;
  ["pipeline", "centros", "calendario", "habitaciones", "descargables"].forEach((v) => {
    document.getElementById(`tab-${v}`)?.classList.toggle("tab-active", v === view);
  });
  rPrac();
}

function oDiaPrac(dateStr) {
  const all = D.practicantes;
  const entradas = all.filter((p) => p.fechaEntrada === dateStr);
  const salidas = all.filter((p) => p.fechaSalida === dateStr);
  const activos = all.filter((p) => p.fechaEntrada && p.fechaSalida && p.fechaEntrada <= dateStr && p.fechaSalida >= dateStr);
  const [y, m, d] = dateStr.split("-");
  const label = `${d} de ${MESES[parseInt(m) - 1]} de ${y}`;

  let html = `<h3>${label}</h3>`;

  if (!entradas.length && !salidas.length && !activos.length) {
    html += `<div class="notice">Sin actividad de practicantes este día.</div>`;
  }

  if (entradas.length) {
    html += `<div class="rs"><h4 style="color:var(--green-deep)">▶ Entran hoy</h4>` +
      entradas.map((p) => `
        <div class="notice" style="border-left-color:var(--green);background:var(--green-soft);cursor:pointer;margin-bottom:6px" onclick="cModal();oPF(${p.id})">
          <strong>${safeText(p.nombre)}</strong>
          <div>${safeText(p.escuela || "Sin escuela")} · ${safeText(p.partida || "Sin partida asignada")}</div>
          ${p.tutor ? `<div class="nd">Tutor: ${safeText(p.tutor)}</div>` : ""}
          ${p.fechaSalida ? `<div class="nd">Sale el ${fmtDate(p.fechaSalida)}</div>` : ""}
        </div>`).join("") + `</div>`;
  }

  if (salidas.length) {
    html += `<div class="rs"><h4 style="color:var(--brown)">◀ Salen hoy</h4>` +
      salidas.map((p) => `
        <div class="notice" style="border-left-color:var(--brown);background:#fdf3e8;cursor:pointer;margin-bottom:6px" onclick="cModal();oPF(${p.id})">
          <strong>${safeText(p.nombre)}</strong>
          <div>${safeText(p.escuela || "Sin escuela")} · ${safeText(p.partida || "Sin partida asignada")}</div>
          ${p.fechaEntrada ? `<div class="nd">Entró el ${fmtDate(p.fechaEntrada)}</div>` : ""}
        </div>`).join("") + `</div>`;
  }

  if (activos.length) {
    html += `<div class="rs"><h4 style="color:var(--blue)">● En plantilla este día</h4>` +
      activos.map((p) => `
        <div class="notice" style="border-left-color:var(--blue);background:var(--blue-soft);cursor:pointer;margin-bottom:6px" onclick="cModal();oPF(${p.id})">
          <strong>${safeText(p.nombre)}</strong>
          <div>${safeText(p.partida || "Sin partida asignada")}</div>
          <div class="nd">${fmtDate(p.fechaEntrada)} → ${fmtDate(p.fechaSalida)}</div>
        </div>`).join("") + `</div>`;
  }

  html += `<div class="mf"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>`;
  oModal(html);
}

function pracCalNav(delta) {
  pracCalM += delta;
  if (pracCalM > 11) { pracCalM = 0; pracCalY += 1; }
  if (pracCalM < 0) { pracCalM = 11; pracCalY -= 1; }
  rPracCal();
}

function rPracCal() {
  const monthStr = `${pracCalY}-${String(pracCalM + 1).padStart(2, "0")}`;
  const all = D.practicantes;

  const first = new Date(pracCalY, pracCalM, 1);
  const last = new Date(pracCalY, pracCalM + 1, 0);
  const startDay = (first.getDay() + 6) % 7;

  let grid = DS.map((d) => `<div class="ch">${d}</div>`).join("");

  for (let i = 0; i < startDay; i++) {
    const d = new Date(pracCalY, pracCalM, -(startDay - i - 1));
    grid += `<div class="cd om"><div class="cdn">${d.getDate()}</div></div>`;
  }

  for (let day = 1; day <= last.getDate(); day++) {
    const dateStr = `${pracCalY}-${String(pracCalM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entradas = all.filter((p) => p.fechaEntrada === dateStr);
    const salidas = all.filter((p) => p.fechaSalida === dateStr);
    let content = entradas.map((p) => `<div class="ce-prac" onclick="event.stopPropagation();oPF(${p.id})" title="Entrada: ${safeText(p.nombre)}">▶ ${safeText(p.nombre.split(" ")[0])}</div>`).join("");
    content += salidas.map((p) => `<div class="prac-sal" onclick="event.stopPropagation();oPF(${p.id})" title="Salida: ${safeText(p.nombre)}">◀ ${safeText(p.nombre.split(" ")[0])}</div>`).join("");
    const hasActivity = entradas.length || salidas.length;
    grid += `<div class="cd${dateStr === today() ? " today" : ""}${hasActivity ? " cd-has-prac" : ""}" onclick="oDiaPrac('${dateStr}')"><div class="cdn">${day}</div>${content}</div>`;
  }

  const remaining = (7 - ((startDay + last.getDate()) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) grid += `<div class="cd om"><div class="cdn">${i}</div></div>`;

  const entradasMes = all.filter((p) => p.fechaEntrada?.startsWith(monthStr));
  const salidasMes = all.filter((p) => p.fechaSalida?.startsWith(monthStr));
  const activosMes = all.filter((p) => {
    if (!p.fechaEntrada || !p.fechaSalida) return false;
    return p.fechaEntrada <= `${monthStr}-31` && p.fechaSalida >= `${monthStr}-01`;
  });

  let lista = "";
  if (entradasMes.length) lista += `<div style="margin-bottom:8px"><strong style="font-size:12px;color:var(--green-deep)">▶ ENTRADAS</strong></div>` +
    entradasMes.map((p) => `<div class="notice" style="border-left-color:var(--green);background:var(--green-soft);cursor:pointer;margin-bottom:6px" onclick="oPF(${p.id})"><strong>${safeText(p.nombre)}</strong><div>${safeText(p.escuela || "Sin escuela")} · ${safeText(p.partida || "Sin partida")}</div><div class="nd">Entrada: ${fmtDate(p.fechaEntrada)}</div></div>`).join("");
  if (salidasMes.length) lista += `<div style="margin:14px 0 8px"><strong style="font-size:12px;color:var(--brown)">◀ SALIDAS</strong></div>` +
    salidasMes.map((p) => `<div class="notice" style="border-left-color:var(--brown);background:#fdf3e8;cursor:pointer;margin-bottom:6px" onclick="oPF(${p.id})"><strong>${safeText(p.nombre)}</strong><div>${safeText(p.escuela || "Sin escuela")} · ${safeText(p.partida || "Sin partida")}</div><div class="nd">Salida: ${fmtDate(p.fechaSalida)}</div></div>`).join("");
  if (!entradasMes.length && !salidasMes.length) lista = `<div class="notice"><strong>Mes sin movimientos</strong><div>No hay entradas ni salidas de practicantes este mes.</div></div>`;

  if (activosMes.length) lista += `<div style="margin:14px 0 8px"><strong style="font-size:12px;color:var(--blue)">● EN PLANTILLA ESTE MES</strong></div>` +
    activosMes.map((p) => `<div class="notice" style="border-left-color:var(--blue);background:var(--blue-soft);cursor:pointer;margin-bottom:6px" onclick="oPF(${p.id})"><strong>${safeText(p.nombre)}</strong><div>${safeText(p.partida || "Sin partida")}</div><div class="nd">${fmtDate(p.fechaEntrada)} → ${fmtDate(p.fechaSalida)}</div></div>`).join("");

  document.getElementById("pracbody").innerHTML = `
    <div class="calendar-toolbar">
      <button class="secondary-btn" onclick="pracCalNav(-1)">‹</button>
      <span class="calendar-title" id="prac-cal-title">${MESES[pracCalM]} ${pracCalY}</span>
      <button class="secondary-btn" onclick="pracCalNav(1)">›</button>
    </div>
    <div class="calendar-grid" id="prac-cheads-body">${grid}</div>
    <div style="margin-top:20px">${lista}</div>`;
}

function rPrac() {
  if (pracView === "centros") { rCentros(); return; }
  if (pracView === "calendario") { rPracCal(); return; }
  if (pracView === "habitaciones") { rHab(); return; }
  if (pracView === "descargables") { rDescargables(); return; }
  const all = D.practicantes;
  const isMobile = window.innerWidth <= 720;
  if (!all.length) {
    document.getElementById("pracbody").innerHTML = `<div class="notice"><strong>Sin practicantes</strong><div>Añade el primero con el botón de arriba.</div></div>`;
    return;
  }
  if (isMobile) {
    document.getElementById("pracbody").innerHTML = all.map((p) => {
      const stage = PIPELINE_STAGES.find((s) => s.key === getPipelineStage(p)) || PIPELINE_STAGES[0];
      const docs = p.docs || {};
      const done = DOC_CHECKLIST.filter((d) => docs[d.key]).length;
      return `
        <div class="pc" onclick="oPF(${p.id})">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
            <div>
              <div class="pt">${safeText(p.nombre)}</div>
              ${p.escuela ? `<div class="nd">${safeText(p.escuela)}</div>` : ""}
              ${p.fechaEntrada ? `<div class="nd">${fmtDate(p.fechaEntrada)}${p.fechaSalida ? ` → ${fmtDate(p.fechaSalida)}` : ""}</div>` : ""}
            </div>
            <span class="pip-tag ${stage.cls}">${stage.label}</span>
          </div>
          <div class="ca" style="margin-top:10px;justify-content:space-between">
            <div class="ca" style="gap:6px">
              ${p.partida ? `<span class="badge b-huerta">${safeText(p.partida)}</span>` : ""}
            </div>
            ${done > 0 ? `<span class="nd">${ico('file-text', 13)} ${done}/${DOC_CHECKLIST.length}</span>` : ""}
          </div>
        </div>`;
    }).join("");
  } else {
    document.getElementById("pracbody").innerHTML = `
      <div class="pipeline-board">
        ${PIPELINE_STAGES.map((stage) => {
          const cards = all.filter((p) => getPipelineStage(p) === stage.key);
          return `
            <div class="pipeline-col">
              <div class="pipeline-col-head ${stage.cls}">
                <span>${stage.label}</span>
                <span class="pipeline-count">${cards.length}</span>
              </div>
              <div class="pipeline-col-body">
                ${cards.length ? cards.map((p) => {
                  const docs = p.docs || {};
                  const done = DOC_CHECKLIST.filter((d) => docs[d.key]).length;
                  return `
                    <div class="pc" onclick="oPF(${p.id})">
                      <div class="pt">${safeText(p.nombre)}</div>
                      ${p.escuela ? `<div class="nd">${safeText(p.escuela)}</div>` : ""}
                      ${p.fechaEntrada ? `<div class="nd">${fmtDate(p.fechaEntrada)}</div>` : ""}
                      ${p.partida ? `<div class="ca" style="margin-top:8px"><span class="badge b-huerta">${safeText(p.partida)}</span></div>` : ""}
                      ${done > 0 ? `<div class="nd" style="margin-top:6px">${ico('file-text', 13)} ${done}/${DOC_CHECKLIST.length} docs</div>` : ""}
                    </div>`;
                }).join("") : `<div class="pipeline-empty">Sin candidatos</div>`}
              </div>
            </div>`;
        }).join("")}
      </div>`;
  }
}

function oPF(id) {
  const item = D.practicantes.find((prac) => prac.id === id);
  if (!item) return;
  const stage = getPipelineStage(item);
  const docs = item.docs || {};
  const skills = item.habilidades || {};
  document.getElementById("pftit").textContent = item.nombre;
  document.getElementById("pfbody").innerHTML = `
    <div class="rs">
      <h4>Etapa del proceso</h4>
      <div class="pipeline-nav">
        ${PIPELINE_STAGES.map((s) => `<button class="pipeline-stage-btn${s.key === stage ? " pip-btn-active" : ""}" onclick="moverPipeline(${id},'${s.key}')">${s.label}</button>`).join("")}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:22px">
      <div><strong>Escuela:</strong> ${safeText(item.escuela || "—")}</div>
      <div><strong>Entrada:</strong> ${item.fechaEntrada ? fmtDate(item.fechaEntrada) : "—"}</div>
      <div><strong>Salida:</strong> ${item.fechaSalida ? fmtDate(item.fechaSalida) : "—"}</div>
      <div><strong>Partida:</strong> ${safeText(item.partida || "—")}</div>
      <div><strong>Tutor:</strong> ${safeText(item.tutor || "—")}</div>
      ${item.telefono ? `<div><strong>Tel:</strong> ${safeText(item.telefono)}</div>` : ""}
    </div>
    <div class="rs">
      <h4>Documentación</h4>
      ${DOC_CHECKLIST.map((d) => `
        <div class="doc-check" onclick="tDocPrac(${id},'${d.key}')">
          <span class="doc-check-icon">${docs[d.key] ? "✓" : ""}</span>
          <span class="${docs[d.key] ? "doc-done" : ""}">${d.label}</span>
        </div>`).join("")}
    </div>
    ${item.telefono ? `
    <div class="rs">
      <h4>Enviar WhatsApp</h4>
      <div class="ca">
        ${WA_PRAC_TEMPLATES.map((t, i) => `<button class="btn btn-o" onclick="waPrac(${id},${i})">${t.label}</button>`).join("")}
      </div>
    </div>` : ""}
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
  updateOverlayState();
}

function moverPipeline(id, stage) {
  const item = D.practicantes.find((p) => p.id === id);
  if (!item) return;
  item.pipeline = stage;
  item.estado = setEstadoFromPipeline(stage);
  save("practicantes");
  oPF(id);
  rPrac();
}

function tDocPrac(id, docKey) {
  const item = D.practicantes.find((p) => p.id === id);
  if (!item) return;
  if (!item.docs) item.docs = {};
  item.docs[docKey] = !item.docs[docKey];
  save("practicantes");
  oPF(id);
  rPrac();
}

function waPrac(id, templateIdx) {
  const item = D.practicantes.find((p) => p.id === id);
  if (!item) return;
  const template = WA_PRAC_TEMPLATES[templateIdx];
  const text = template.text(item.nombre.split(" ")[0]);
  const number = String(item.telefono || "").replace(/\s/g, "");
  window.open(number ? `https://wa.me/34${number}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function cPF() {
  document.getElementById("pfdet").classList.remove("open");
  updateOverlayState();
}

function closeTopOverlay() {
  if (document.getElementById("hamburger-menu")?.classList.contains("open")) {
    closeHamburger();
    return true;
  }
  if (document.getElementById("modal")?.classList.contains("open")) {
    cModal();
    return true;
  }
  if (document.getElementById("rdet")?.classList.contains("open")) {
    cRD();
    return true;
  }
  if (document.getElementById("pfdet")?.classList.contains("open")) {
    cPF();
    return true;
  }
  if (document.getElementById("restdet")?.classList.contains("open")) {
    closeRestRecipe();
    return true;
  }
  return false;
}

function oPracM(id) {
  const item = id ? D.practicantes.find((prac) => prac.id === id) : null;
  const skills = item?.habilidades || {};
  const stage = item ? getPipelineStage(item) : "contactado";
  oModal(`
    <h3>${item ? "Editar practicante" : "Nuevo practicante"}</h3>
    <div class="fr"><label>Nombre completo *</label><input id="prn" value="${safeText(item?.nombre || "")}"></div>
    <div class="fr"><label>Escuela</label><input id="pre" value="${safeText(item?.escuela || "")}"></div>
    <div class="fr"><label>Teléfono</label><input id="prtel" type="tel" placeholder="612345678" value="${safeText(item?.telefono || "")}"></div>
    <div class="fr"><label>Etapa del proceso</label><select id="prpip">${PIPELINE_STAGES.map((s) => `<option value="${s.key}"${stage === s.key ? " selected" : ""}>${s.label}</option>`).join("")}</select></div>
    <div class="fr"><label>Fecha de entrada</label><input type="date" id="pri" value="${safeText(item?.fechaEntrada || "")}"></div>
    <div class="fr"><label>Fecha de salida</label><input type="date" id="prs" value="${safeText(item?.fechaSalida || "")}"></div>
    <div class="fr"><label>Partida</label><select id="prp"><option value="">Sin asignar</option>${["Cocina fría", "Cocina caliente", "Pastelería", "Sala", "Todas"].map((partida) => `<option${item?.partida === partida ? " selected" : ""}>${partida}</option>`).join("")}</select></div>
    <div class="fr"><label>Tutor/a</label><input id="prt" value="${safeText(item?.tutor || "")}"></div>
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
    skills[skill] = Number(document.getElementById(`sk_${skill.replace(/[^a-zA-Z]/g, "_")}`)?.value || 0);
  });
  const pipeline = document.getElementById("prpip").value;
  const payload = {
    nombre: name,
    escuela: document.getElementById("pre").value,
    telefono: document.getElementById("prtel").value.trim(),
    pipeline,
    estado: setEstadoFromPipeline(pipeline),
    fechaEntrada: document.getElementById("pri").value,
    fechaSalida: document.getElementById("prs").value,
    partida: document.getElementById("prp").value,
    tutor: document.getElementById("prt").value,
    habilidades: skills,
    descripcion: document.getElementById("prd").value,
    notas: document.getElementById("prno").value
  };
  if (id) {
    const existing = D.practicantes.find((item) => item.id === id);
    if (existing) { Object.assign(existing, payload); if (!existing.docs) existing.docs = {}; }
  } else {
    D.practicantes.push({ id: nid++, docs: {}, ...payload });
  }
  save("practicantes");
  cModal();
}

function dPrac(id) {
  if (!confirm("¿Eliminar este practicante?")) return;
  D.practicantes = D.practicantes.filter((item) => item.id !== id);
  save("practicantes");
  cPF();
  rPrac();
}

function habCapacidad(h) {
  return h.literas ? h.capacidad * 2 : h.capacidad;
}

function rHab() {
  const habs = D.habitaciones.filter((h) => h.estado !== "mantenimiento");
  const habsMant = D.habitaciones.filter((h) => h.estado === "mantenimiento");
  const totalPlazas = habs.reduce((s, h) => s + habCapacidad(h), 0);
  const plazasOcupadas = habs.reduce((s, h) => s + (h.ocupantes || []).length + (h.ocupantesCañitas || []).length, 0);
  const plazasLibres = totalPlazas - plazasOcupadas;

  const resumen = D.habitaciones.length ? `
    <div class="hab-resumen">
      <div class="hab-stat hab-libre"><span class="hab-stat-n">${plazasLibres}</span><span>Plazas libres</span></div>
      <div class="hab-stat hab-ocupada"><span class="hab-stat-n">${plazasOcupadas}</span><span>Plazas ocupadas</span></div>
      <div class="hab-stat" style="background:var(--blue-soft);border-color:var(--blue);color:var(--blue)"><span class="hab-stat-n">${totalPlazas}</span><span>Total plazas</span></div>
      ${habsMant.length ? `<div class="hab-stat hab-mant"><span class="hab-stat-n">${habsMant.length}</span><span>Mantenim.</span></div>` : ""}
    </div>
    <div class="nd" style="margin-bottom:16px;text-align:right">${plazasLibres + plazasOcupadas === totalPlazas ? `✓ ${plazasLibres} libres + ${plazasOcupadas} ocupadas = ${totalPlazas} total` : ""}</div>` : "";

  const todasHabs = D.habitaciones;
  const casas = [...new Set(todasHabs.map((h) => h.casa || "Sin asignar"))];

  const casasHtml = casas.map((casa) => {
    const rooms = todasHabs.filter((h) => (h.casa || "Sin asignar") === casa);
    const casaTotalPlazas = rooms.filter((h) => h.estado !== "mantenimiento").reduce((s, h) => s + habCapacidad(h), 0);
    const casaOcupadas = rooms.reduce((s, h) => s + (h.ocupantes || []).length + (h.ocupantesCañitas || []).length, 0);
    const casaLibres = casaTotalPlazas - casaOcupadas;
    return `
      <div class="hab-casa">
        <div class="hab-casa-head">
          <span class="pt">${safeText(casa)}</span>
          <span class="nd">${casaLibres} plaza${casaLibres !== 1 ? "s" : ""} libre${casaLibres !== 1 ? "s" : ""} de ${casaTotalPlazas}</span>
        </div>
        <div class="hab-grid">
          ${rooms.map((h) => {
            const cap = habCapacidad(h);
            const ocupantes = (h.ocupantes || []).map((pid) => D.practicantes.find((p) => p.id === pid)).filter(Boolean);
            const ocupantesCañitas = h.ocupantesCañitas || [];
            const totalOcupados = ocupantes.length + ocupantesCañitas.length;
            const plazasLibres = cap - totalOcupados;
            const mantenimiento = h.estado === "mantenimiento";
            const estadoCls = mantenimiento ? "finalizado" : plazasLibres === 0 ? "pendiente" : "activo";
            const estadoLabel = mantenimiento ? "Mantenim." : plazasLibres === 0 ? "Llena" : `${plazasLibres} libre${plazasLibres !== 1 ? "s" : ""}`;
            return `
              <div class="hab-card hab-card-${mantenimiento ? "mantenimiento" : plazasLibres === 0 ? "ocupada" : "libre"}">
                <div class="hab-card-head">
                  <div>
                    <div class="pt">${safeText(h.nombre)}</div>
                    <div class="nd">${cap} plaza${cap !== 1 ? "s" : ""}${h.literas ? " (con literas)" : ""}</div>
                  </div>
                  <span class="ps s-${estadoCls}">${estadoLabel}</span>
                </div>
                ${(ocupantes.length || ocupantesCañitas.length) ? `
                  <div class="hab-ocupantes">
                    ${ocupantes.map((p) => `
                      <div class="hab-ocupante">
                        <span onclick="oPF(${p.id})" style="cursor:pointer">${ico('user', 14)} ${safeText(p.nombre)} <span class="hab-tag-oba">OBA</span></span>
                        <div class="ca" style="gap:4px">
                          <button class="btn btn-o btn-s" onclick="oMoverPrac(${p.id},${h.id})">Mover</button>
                          <button class="btn btn-d btn-s" onclick="oDesasignarUno(${h.id},${p.id})">✕</button>
                        </div>
                      </div>`).join("")}
                    ${ocupantesCañitas.map((c, i) => `
                      <div class="hab-ocupante">
                        <span>${ico('user', 14)} ${safeText(c.nombre)} <span class="hab-tag-cañitas">Cañitas</span></span>
                        <div class="ca" style="gap:4px">
                          <button class="btn btn-o btn-s" onclick="oMoverCañitas(${i},${h.id})">Mover</button>
                          <button class="btn btn-d btn-s" onclick="desasignarCañitas(${h.id},${i})">✕</button>
                        </div>
                      </div>`).join("")}
                  </div>` : ""}
                ${h.notas ? `<div class="nd" style="margin-top:8px;font-style:italic">${safeText(h.notas)}</div>` : ""}
                <div class="ca" style="margin-top:12px">
                  ${!mantenimiento && plazasLibres > 0 ? `<button class="btn btn-o btn-s" onclick="oAsignarPrac(${h.id})">+ OBA</button>` : ""}
                  ${!mantenimiento && plazasLibres > 0 ? `<button class="btn btn-o btn-s hab-btn-cañitas" onclick="oAsignarCañitas(${h.id})">+ Cañitas</button>` : ""}
                  <button class="btn btn-o btn-s" onclick="oHabM(${h.id})">Editar</button>
                  <button class="btn btn-d btn-s" onclick="dHab(${h.id})">✕</button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }).join("");

  document.getElementById("pracbody").innerHTML = `
    <div style="margin-bottom:16px">
      <button class="primary-btn" onclick="oHabM()">Nueva habitación</button>
    </div>
    ${resumen}
    ${habs.length ? casasHtml : `<div class="notice"><strong>Sin habitaciones</strong><div>Añade las habitaciones disponibles.</div></div>`}`;
}

function oHabM(id) {
  const h = id ? D.habitaciones.find((x) => x.id === id) : null;
  const casasExistentes = [...new Set(D.habitaciones.map((x) => x.casa).filter(Boolean))];
  const casaOpts = ["Casa Vega", "Casa Oba", "Apartamentos Paloma", ...casasExistentes.filter((c) => !["Casa Vega","Casa Oba","Apartamentos Paloma"].includes(c))];
  oModal(`
    <h3>${h ? "Editar habitación" : "Nueva habitación"}</h3>
    <div class="fr"><label>Casa / edificio *</label>
      <input id="hcasa" list="casas-list" value="${safeText(h?.casa || "")}" placeholder="Ej: Casa Vega">
      <datalist id="casas-list">${casaOpts.map((c) => `<option value="${safeText(c)}">`).join("")}</datalist>
    </div>
    <div class="fr"><label>Nombre o número *</label><input id="hnom" placeholder="Ej: Habitación 1" value="${safeText(h?.nombre || "")}"></div>
    <div class="fr"><label>Camas</label><input type="number" min="1" max="20" id="hcap" value="${h?.capacidad || 1}"></div>
    <div class="fr"><label style="display:flex;align-items:center;gap:10px;cursor:pointer">
      <input type="checkbox" id="hlit" style="width:auto;box-shadow:none" ${h?.literas ? "checked" : ""}> Con literas (capacidad × 2)
    </label></div>
    <div class="fr"><label>Estado</label>
      <select id="hest">
        <option value="libre"${(!h || h.estado === "libre") ? " selected" : ""}>Libre</option>
        <option value="mantenimiento"${h?.estado === "mantenimiento" ? " selected" : ""}>Mantenimiento</option>
      </select>
    </div>
    <div class="fr"><label>Notas</label><textarea id="hnot">${safeText(h?.notas || "")}</textarea></div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sHab(${id || "null"})">Guardar</button>
    </div>`);
}

function sHab(id) {
  const casa = document.getElementById("hcasa").value.trim();
  const nombre = document.getElementById("hnom").value.trim();
  if (!casa || !nombre) return alert("Casa y nombre son obligatorios");
  const payload = {
    casa,
    nombre,
    capacidad: Math.max(1, parseInt(document.getElementById("hcap").value) || 1),
    literas: document.getElementById("hlit").checked,
    estado: document.getElementById("hest").value,
    notas: document.getElementById("hnot").value.trim()
  };
  if (id) {
    Object.assign(D.habitaciones.find((x) => x.id === id), payload);
  } else {
    D.habitaciones.push({ id: nid++, ocupantes: [], ...payload });
  }
  save("habitaciones");
  cModal();
  rHab();
}

function dHab(id) {
  if (!confirm("¿Eliminar esta habitación?")) return;
  D.habitaciones = D.habitaciones.filter((x) => x.id !== id);
  save("habitaciones");
  rHab();
}

function oAsignarPrac(habId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  const ocupados = D.habitaciones.flatMap((x) => x.ocupantes || []);
  const disponibles = D.practicantes.filter((p) => !ocupados.includes(p.id));
  if (!disponibles.length) {
    oModal(`<h3>Sin practicantes disponibles</h3><p style="margin:16px 0;color:var(--muted)">Todos los practicantes ya tienen habitación asignada o no hay practicantes registrados.</p><div class="mf"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>`);
    return;
  }
  oModal(`
    <h3>Asignar a ${safeText(h.nombre)}</h3>
    <div class="fr"><label>Practicante</label>
      <select id="hprac">
        ${disponibles.map((p) => `<option value="${p.id}">${safeText(p.nombre)}${p.escuela ? ` — ${safeText(p.escuela)}` : ""}</option>`).join("")}
      </select>
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="asignarPrac(${habId})">Asignar</button>
    </div>`);
}

function asignarPrac(habId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  const pracId = parseInt(document.getElementById("hprac").value);
  if (!h.ocupantes) h.ocupantes = [];
  if (!h.ocupantes.includes(pracId)) h.ocupantes.push(pracId);
  h.estado = "ocupada";
  save("habitaciones");
  cModal();
  rHab();
}

function oDesasignarPrac(habId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h || !h.ocupantes?.length) return;
  const ocupantes = h.ocupantes.map((pid) => D.practicantes.find((p) => p.id === pid)).filter(Boolean);
  oModal(`
    <h3>Liberar plaza en ${safeText(h.nombre)}</h3>
    <div class="fr"><label>Practicante a liberar</label>
      <select id="hdesasgn">
        ${ocupantes.map((p) => `<option value="${p.id}">${safeText(p.nombre)}</option>`).join("")}
      </select>
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="desasignarPrac(${habId})">Liberar</button>
    </div>`);
}

function desasignarPrac(habId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  const pracId = parseInt(document.getElementById("hdesasgn").value);
  h.ocupantes = (h.ocupantes || []).filter((id) => id !== pracId);
  if (!h.ocupantes.length) h.estado = "libre";
  save("habitaciones");
  cModal();
  rHab();
}

function oDesasignarUno(habId, pracId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  const p = D.practicantes.find((x) => x.id === pracId);
  if (!h || !p) return;
  if (!confirm(`¿Liberar la plaza de ${p.nombre} en ${h.nombre}?`)) return;
  h.ocupantes = (h.ocupantes || []).filter((id) => id !== pracId);
  if (!h.ocupantes.length) h.estado = "libre";
  save("habitaciones");
  rHab();
}

function oMoverPrac(pracId, fromHabId) {
  const p = D.practicantes.find((x) => x.id === pracId);
  const fromHab = D.habitaciones.find((x) => x.id === fromHabId);
  if (!p || !fromHab) return;
  const destinos = D.habitaciones.filter((h) => {
    if (h.id === fromHabId) return false;
    if (h.estado === "mantenimiento") return false;
    const cap = habCapacidad(h);
    return (h.ocupantes || []).length < cap;
  });
  if (!destinos.length) {
    oModal(`<h3>Sin plazas disponibles</h3><p style="margin:16px 0;color:var(--muted)">No hay otras habitaciones con plazas libres.</p><div class="mf"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>`);
    return;
  }
  oModal(`
    <h3>Mover a ${safeText(p.nombre)}</h3>
    <p style="margin-bottom:14px;color:var(--muted)">Actualmente en ${safeText(fromHab.casa)} · ${safeText(fromHab.nombre)}</p>
    <div class="fr"><label>Mover a</label>
      <select id="hmover">
        ${destinos.map((h) => {
          const cap = habCapacidad(h);
          const libres = cap - (h.ocupantes || []).length;
          return `<option value="${h.id}">${safeText(h.casa)} · ${safeText(h.nombre)} (${libres} plaza${libres !== 1 ? "s" : ""} libre${libres !== 1 ? "s" : ""})</option>`;
        }).join("")}
      </select>
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="moverPracHab(${pracId},${fromHabId})">Mover</button>
    </div>`);
}

function moverPracHab(pracId, fromHabId) {
  const toHabId = parseInt(document.getElementById("hmover").value);
  const fromHab = D.habitaciones.find((x) => x.id === fromHabId);
  const toHab = D.habitaciones.find((x) => x.id === toHabId);
  if (!fromHab || !toHab) return;
  fromHab.ocupantes = (fromHab.ocupantes || []).filter((id) => id !== pracId);
  if (!fromHab.ocupantes.length) fromHab.estado = "libre";
  if (!toHab.ocupantes) toHab.ocupantes = [];
  toHab.ocupantes.push(pracId);
  toHab.estado = "ocupada";
  save("habitaciones");
  cModal();
  rHab();
}

function oAsignarCañitas(habId) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  oModal(`
    <h3>Añadir practicante de Cañitas</h3>
    <p style="margin-bottom:14px;color:var(--muted)">${safeText(h.casa)} · ${safeText(h.nombre)}</p>
    <div class="fr"><label>Nombre completo *</label><input id="cnom" placeholder="Nombre del practicante"></div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn hab-btn-cañitas" onclick="asignarCañitas(${habId})">Añadir</button>
    </div>`);
}

function asignarCañitas(habId) {
  const nombre = document.getElementById("cnom").value.trim();
  if (!nombre) return alert("El nombre es obligatorio");
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  if (!h.ocupantesCañitas) h.ocupantesCañitas = [];
  h.ocupantesCañitas.push({ nombre });
  h.estado = "ocupada";
  save("habitaciones");
  cModal();
  rHab();
}

function desasignarCañitas(habId, idx) {
  const h = D.habitaciones.find((x) => x.id === habId);
  if (!h) return;
  const nombre = h.ocupantesCañitas?.[idx]?.nombre || "este practicante";
  if (!confirm(`¿Liberar la plaza de ${nombre}?`)) return;
  h.ocupantesCañitas.splice(idx, 1);
  if (!(h.ocupantes || []).length && !h.ocupantesCañitas.length) h.estado = "libre";
  save("habitaciones");
  rHab();
}

function oMoverCañitas(idx, fromHabId) {
  const fromHab = D.habitaciones.find((x) => x.id === fromHabId);
  if (!fromHab) return;
  const persona = fromHab.ocupantesCañitas?.[idx];
  if (!persona) return;
  const destinos = D.habitaciones.filter((h) => {
    if (h.id === fromHabId) return false;
    if (h.estado === "mantenimiento") return false;
    const cap = habCapacidad(h);
    return (h.ocupantes || []).length + (h.ocupantesCañitas || []).length < cap;
  });
  if (!destinos.length) {
    oModal(`<h3>Sin plazas disponibles</h3><p style="margin:16px 0;color:var(--muted)">No hay otras habitaciones con plazas libres.</p><div class="mf"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>`);
    return;
  }
  oModal(`
    <h3>Mover a ${safeText(persona.nombre)}</h3>
    <p style="margin-bottom:14px;color:var(--muted)">Actualmente en ${safeText(fromHab.casa)} · ${safeText(fromHab.nombre)}</p>
    <div class="fr"><label>Mover a</label>
      <select id="hmovercañ">
        ${destinos.map((h) => {
          const cap = habCapacidad(h);
          const libres = cap - (h.ocupantes || []).length - (h.ocupantesCañitas || []).length;
          return `<option value="${h.id}">${safeText(h.casa)} · ${safeText(h.nombre)} (${libres} plaza${libres !== 1 ? "s" : ""} libre${libres !== 1 ? "s" : ""})</option>`;
        }).join("")}
      </select>
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn hab-btn-cañitas" onclick="moverCañitas(${idx},${fromHabId})">Mover</button>
    </div>`);
}

function moverCañitas(idx, fromHabId) {
  const toHabId = parseInt(document.getElementById("hmovercañ").value);
  const fromHab = D.habitaciones.find((x) => x.id === fromHabId);
  const toHab = D.habitaciones.find((x) => x.id === toHabId);
  if (!fromHab || !toHab) return;
  const persona = fromHab.ocupantesCañitas.splice(idx, 1)[0];
  if (!fromHab.ocupantes?.length && !fromHab.ocupantesCañitas.length) fromHab.estado = "libre";
  if (!toHab.ocupantesCañitas) toHab.ocupantesCañitas = [];
  toHab.ocupantesCañitas.push(persona);
  toHab.estado = "ocupada";
  save("habitaciones");
  cModal();
  rHab();
}

/* ── Descargables ── */
const DESC_CATS = ["Normativa", "Cómo llegar", "Qué traer", "Información general"];

function rDescargables() {
  const docs = D.descargables;
  const byCat = {};
  DESC_CATS.forEach((c) => { byCat[c] = []; });
  docs.forEach((d) => { (byCat[d.categoria] || (byCat["Información general"] = byCat["Información general"] || [])).push(d); });

  const cards = DESC_CATS.map((cat) => {
    const items = byCat[cat] || [];
    return `
      <div class="desc-cat">
        <div class="desc-cat-head">
          <span class="desc-cat-label">${cat}</span>
          <button class="ghost-btn ghost-btn-sm" onclick="oDescargableM(null,'${cat}')">+ Añadir</button>
        </div>
        ${items.length ? items.map((d) => `
          <div class="desc-card">
            <div class="desc-card-main">
              <div class="desc-card-icon">${descIcon(d)}</div>
              <div class="desc-card-info">
                <div class="desc-card-title">${safeText(d.titulo)}</div>
                ${d.descripcion ? `<div class="desc-card-sub">${safeText(d.descripcion)}</div>` : ""}
                ${d.url ? `<div class="desc-card-url">${safeText(d.url.length > 50 ? d.url.slice(0, 50) + "…" : d.url)}</div>` : ""}
              </div>
            </div>
            <div class="desc-card-actions">
              ${d.url ? `<a class="btn btn-s btn-g desc-ver-btn" href="${safeText(d.url)}" target="_blank" rel="noopener">Ver ↗</a>` : ""}
              <button class="desc-share-btn desc-share-wa" title="Enviar por WhatsApp" onclick="compartirDesc(${d.id},'wa')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.528 5.855L0 24l6.335-1.502A11.957 11.957 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.018-1.374l-.36-.213-3.757.89.946-3.658-.234-.376A9.818 9.818 0 1 1 12 21.818z"/></svg>
              </button>
              <button class="desc-share-btn desc-share-mail" title="Enviar por email" onclick="compartirDesc(${d.id},'email')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              </button>
              <button class="desc-share-btn desc-share-copy" title="Copiar enlace" onclick="compartirDesc(${d.id},'copy')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="desc-share-btn desc-share-edit" title="Editar" onclick="oDescargableM(${d.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>`).join("") : `<div class="desc-empty">Sin documentos en esta categoría.</div>`}
      </div>`;
  }).join("");

  document.getElementById("pracbody").innerHTML = `
    <div class="desc-intro">
      <p>Sube aquí los documentos que deben conocer los practicantes antes de llegar. Compártelos por WhatsApp, email o copia el enlace directamente.</p>
    </div>
    <div class="desc-grid">${cards}</div>`;
}

function descIcon(d) {
  if (d.url && d.url.match(/\.(pdf)$/i)) return ico('file-pdf', 16);
  if (d.url && d.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return ico('image', 16);
  if (d.url && d.url.match(/^https?:\/\//)) return ico('link', 16);
  return ico('clipboard-text', 16);
}

function oDescargableM(id, catPreset) {
  const d = id ? D.descargables.find((x) => x.id === id) : null;
  oModal(`
    <h3>${d ? "Editar documento" : "Añadir documento"}</h3>
    <div class="fr"><label>Título *</label><input id="dtit" value="${safeText(d?.titulo || "")}"></div>
    <div class="fr"><label>Descripción corta</label><input id="ddesc" value="${safeText(d?.descripcion || "")}"></div>
    <div class="fr"><label>Categoría</label><select id="dcat">
      ${DESC_CATS.map((c) => `<option${(d?.categoria || catPreset || DESC_CATS[0]) === c ? " selected" : ""}>${c}</option>`).join("")}
    </select></div>
    <div class="fr">
      <label>Enlace al documento</label>
      <input id="durl" type="url" placeholder="https://drive.google.com/..." value="${safeText(d?.url || "")}">
      <div class="field-hint">Pega el enlace público del PDF (Google Drive, Dropbox, etc.)</div>
    </div>
    <div class="mf">
      ${d ? `<button class="btn btn-d btn-s" onclick="dDescargable(${id})">Eliminar</button>` : ""}
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sDescargable(${id || "null"})">Guardar</button>
    </div>`);
}

function sDescargable(id) {
  const titulo = document.getElementById("dtit").value.trim();
  if (!titulo) return alert("El título es obligatorio");
  const payload = {
    titulo,
    descripcion: document.getElementById("ddesc").value.trim(),
    categoria: document.getElementById("dcat").value,
    url: document.getElementById("durl").value.trim(),
    fechaSubida: id ? (D.descargables.find((x) => x.id === id)?.fechaSubida || today()) : today()
  };
  if (id) Object.assign(D.descargables.find((x) => x.id === id), payload);
  else D.descargables.push({ id: nid++, ...payload });
  save("descargables");
  cModal();
  rDescargables();
}

function dDescargable(id) {
  if (!confirm("¿Eliminar este documento?")) return;
  D.descargables = D.descargables.filter((x) => x.id !== id);
  save("descargables");
  cModal();
  rDescargables();
}

function compartirDesc(id, method) {
  const d = D.descargables.find((x) => x.id === id);
  if (!d) return;
  if (!d.url) return alert("Este documento no tiene enlace. Edítalo y añade una URL.");
  const titulo = d.titulo;
  const url = d.url;
  const texto = `*${titulo}*\n${d.descripcion ? d.descripcion + "\n" : ""}${url}`;
  if (method === "wa") {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  } else if (method === "email") {
    window.location.href = `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(texto)}`;
  } else if (method === "copy") {
    navigator.clipboard.writeText(url).then(() => {
      const btn = event.currentTarget;
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      btn.style.color = "var(--green-deep)";
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ""; }, 1500);
    }).catch(() => {
      prompt("Copia este enlace:", url);
    });
  }
}

function rCentros() {
  document.getElementById("pracbody").innerHTML = `
    <div style="margin-bottom:16px">
      <button class="primary-btn" onclick="oCentroM()">Nuevo centro</button>
    </div>
    ${D.centros.length ? D.centros.map((c) => {
      const count = D.practicantes.filter((p) => p.escuela === c.nombre).length;
      return `
        <div class="pc">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div>
              <div class="pt">${safeText(c.nombre)}</div>
              ${c.contacto ? `<div class="nd">${safeText(c.contacto)}</div>` : ""}
              ${c.email ? `<div class="nd">${safeText(c.email)}</div>` : ""}
              ${c.telefono ? `<div class="nd">${safeText(c.telefono)}</div>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <span class="ps ${c.convenioVigente ? "s-activo" : "s-finalizado"}">${c.convenioVigente ? "Convenio vigente" : "Sin convenio"}</span>
              <div class="nd" style="margin-top:6px">${count} practicante${count !== 1 ? "s" : ""}</div>
            </div>
          </div>
          ${c.notas ? `<div class="nd" style="margin-top:8px">${safeText(c.notas)}</div>` : ""}
          <div class="ca" style="margin-top:12px">
            ${c.telefono ? `<button class="btn btn-o" onclick="envWA('${safeText(c.nombre).replace(/'/g, "\\'")}','${safeText(c.telefono)}')">WhatsApp</button>` : ""}
            <button class="btn btn-o" onclick="oCentroM(${c.id})">Editar</button>
            <button class="btn btn-d btn-s" onclick="dCentro(${c.id})">Eliminar</button>
          </div>
        </div>`;
    }).join("") : `<div class="notice"><strong>Sin centros registrados</strong><div>Añade los centros educativos con los que colaboráis habitualmente.</div></div>`}`;
}

function oCentroM(id) {
  const c = id ? D.centros.find((x) => x.id === id) : null;
  oModal(`
    <h3>${c ? "Editar centro" : "Nuevo centro educativo"}</h3>
    <div class="fr"><label>Nombre del centro *</label><input id="cen" value="${safeText(c?.nombre || "")}"></div>
    <div class="fr"><label>Persona de contacto</label><input id="cecon" value="${safeText(c?.contacto || "")}"></div>
    <div class="fr"><label>Email</label><input type="email" id="cemail" value="${safeText(c?.email || "")}"></div>
    <div class="fr"><label>Teléfono</label><input id="cetel" value="${safeText(c?.telefono || "")}"></div>
    <div class="fr"><label>Convenio vigente</label><select id="ceconv"><option value="1"${c?.convenioVigente ? " selected" : ""}>Sí</option><option value="0"${!c?.convenioVigente ? " selected" : ""}>No</option></select></div>
    <div class="fr"><label>Notas</label><textarea id="cenota">${safeText(c?.notas || "")}</textarea></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sCentro(${id || "null"})">Guardar</button></div>`);
}

function sCentro(id) {
  const nombre = document.getElementById("cen").value.trim();
  if (!nombre) return alert("El nombre del centro es obligatorio");
  const payload = {
    nombre,
    contacto: document.getElementById("cecon").value.trim(),
    email: document.getElementById("cemail").value.trim(),
    telefono: document.getElementById("cetel").value.trim(),
    convenioVigente: document.getElementById("ceconv").value === "1",
    notas: document.getElementById("cenota").value.trim()
  };
  if (id) Object.assign(D.centros.find((x) => x.id === id), payload);
  else D.centros.push({ id: nid++, ...payload });
  save("centros");
  cModal();
  rCentros();
}

function dCentro(id) {
  if (!confirm("¿Eliminar este centro?")) return;
  D.centros = D.centros.filter((x) => x.id !== id);
  save("centros");
  rCentros();
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
  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // OBA intranet data
  const recetas = D.recipes.map((r) => `${r.nombre} (${r.seccion})`).join(", ") || "ninguna";
  const menuActivo = D.menu.filter((m) => m.estado === "activo").map((m) => `${m.plato} — ${m.seccion}`).join(", ") || "sin cambios";
  const avisosRec = [...D.avisos].slice(-5).reverse().map((a) => `[${a.fecha}${a.urgente ? " URGENTE" : ""}] ${a.titulo}: ${a.texto.slice(0, 80)}`).join("\n") || "ninguno";
  const proyectosActivos = D.proyectos.filter((p) => p.estado === "activo" || p.estado === "testeo").map((p) => `${p.nombre} (${p.estado}) — ${p.responsable}`).join(", ") || "ninguno";
  const pedidosPendientes = D.ingredientes.filter((i) => i.pedido).map((i) => `${i.nombre}${i.cantidad ? " x" + i.cantidad : ""}${i.proveedor ? " [" + i.proveedor + "]" : ""}`).join(", ") || "ninguno";
  const eventosProx = D.eventos.filter((e) => e.fecha >= today()).slice(0, 5).map((e) => `${e.fecha}: ${e.titulo}`).join(", ") || "ninguno";
  const pracActivos = D.practicantes.filter((p) => getPipelineStage(p) === "activo").map((p) => `${p.nombre} (${p.partida || "sin partida"})`).join(", ") || "ninguno";

  // Grupo restaurantes
  const grupoCtx = (D.empresas || []).map((e) => {
    const col = REST_COL_MAP[e.theme] || e.theme;
    const recRest = (D[`${col}_recetas`] || []).map((r) => r.nombre).join(", ") || "ninguna";
    const menuRest = (D[`${col}_menus`] || []).filter((m) => m.estado === "activo").map((m) => m.nombre).join(", ") || "sin cambios";
    const ideasRest = (D[`${col}_ideas`] || []).filter((i) => i.estado !== "descartada").map((i) => `${i.nombre} (${i.estado})`).join(", ") || "ninguna";
    const kpisRest = [...(D[`${col}_kpis`] || [])].sort((a, b) => b.fecha > a.fecha ? 1 : -1).slice(0, 1)[0];
    const kpiStr = kpisRest ? `último KPI ${kpisRest.fecha}: ${kpisRest.nota ? "⭐" + kpisRest.nota : ""}${kpisRest.covers ? " " + kpisRest.covers + " covers" : ""}${kpisRest.ticket ? " " + kpisRest.ticket + "€ ticket" : ""}` : "sin KPIs";
    return `=== ${e.nombre} (${e.ubicacion}) ===\nEstado: ${e.estado} | ${kpiStr}\nRecetas estandarizadas: ${recRest}\nMenú activo: ${menuRest}\nIdeas: ${ideasRest}\nNota del día: ${e.notaDia || "ninguna"}`;
  }).join("\n\n");

  return `Eres el asistente de gestión del grupo gastronómico OBA. Tienes acceso en tiempo real a todos los datos de la intranet y puedes realizar acciones directas.

HOY: ${hoy}

=== OBA INTRANET ===
RECETARIO (${D.recipes.length} platos): ${recetas}
MENÚ ACTIVO: ${menuActivo}
PEDIDOS PENDIENTES: ${pedidosPendientes}
PROYECTOS ACTIVOS: ${proyectosActivos}
PRACTICANTES ACTIVOS: ${pracActivos}
PRÓXIMOS EVENTOS: ${eventosProx}
AVISOS RECIENTES:
${avisosRec}

=== GRUPO DE RESTAURANTES ===
${grupoCtx}

INSTRUCCIONES:
- Responde siempre en español, de forma clara y directa.
- Cuando el usuario pida crear/añadir/registrar algo, usa las herramientas disponibles para hacerlo.
- Si el usuario pide información, usa los datos de arriba para responder con precisión.
- Puedes hacer acciones en cualquier restaurante del grupo.
- Sé proactivo: si ves algo relevante en los datos (urgentes, KPI bajo, ideas interesantes), menciónalo.`;
}

// ── Herramientas IA ──────────────────────────────────────────
const IA_TOOLS = [
  {
    type: "function",
    function: {
      name: "crear_aviso",
      description: "Publica un aviso en la intranet de OBA",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título corto del aviso" },
          texto: { type: "string", description: "Texto completo del aviso" },
          urgente: { type: "boolean", description: "Si es urgente o no" }
        },
        required: ["titulo", "texto", "urgente"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "añadir_pedido",
      description: "Añade un ingrediente o producto a la lista de pedidos",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre del producto" },
          cantidad: { type: "string", description: "Cantidad (ej: 5kg, 3 cajas)" },
          proveedor: { type: "string", description: "Nombre del proveedor (opcional)" }
        },
        required: ["nombre"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crear_proyecto",
      description: "Crea un nuevo proyecto o tarea en I+D de OBA",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre del proyecto" },
          descripcion: { type: "string", description: "Descripción breve" },
          estado: { type: "string", enum: ["activo", "testeo", "pausado"], description: "Estado inicial" }
        },
        required: ["nombre", "descripcion", "estado"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cambio_menu",
      description: "Registra un cambio en el menú de OBA",
      parameters: {
        type: "object",
        properties: {
          plato: { type: "string", description: "Nombre del plato" },
          seccion: { type: "string", description: "Sección del menú" },
          nota: { type: "string", description: "Descripción del cambio" }
        },
        required: ["plato", "seccion"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "restaurante_accion",
      description: "Realiza una acción en un restaurante del grupo (eñe, Can Domo, Cañitas Maite, CEBO, OBA)",
      parameters: {
        type: "object",
        properties: {
          restaurante: { type: "string", enum: ["oba", "ene", "candomo", "canitas", "cebo"], description: "Identificador del restaurante" },
          tipo: { type: "string", enum: ["receta", "idea", "menu", "kpi"], description: "Tipo de acción" },
          nombre: { type: "string", description: "Nombre o descripción del elemento" },
          notas: { type: "string", description: "Notas adicionales (opcional)" },
          covers: { type: "number", description: "Número de comensales (solo para kpi)" },
          ticket: { type: "number", description: "Ticket medio en euros (solo para kpi)" },
          nota_valoracion: { type: "number", description: "Valoración 1-5 (solo para kpi)" }
        },
        required: ["restaurante", "tipo", "nombre"]
      }
    }
  }
];

async function ejecutarHerramienta(name, args) {
  const t = today();
  switch (name) {
    case "crear_aviso": {
      const id = await nextId("avisos");
      D.avisos.push({ id, titulo: args.titulo.slice(0, 60), texto: args.texto, urgente: !!args.urgente, fecha: t, autor: "Asistente IA" });
      save("avisos");
      if (typeof rAv === "function") rAv();
      return `Aviso "${args.titulo}" publicado en la intranet${args.urgente ? " (URGENTE)" : ""}.`;
    }
    case "añadir_pedido": {
      const id = await nextId("ingredientes");
      D.ingredientes.push({ id, nombre: args.nombre, cantidad: args.cantidad || "", unidad: "ud", proveedor: args.proveedor || "", categoria: "Sin categoría", pedido: true, notas: "Añadido por IA" });
      save("ingredientes");
      return `"${args.nombre}"${args.cantidad ? " (" + args.cantidad + ")" : ""} añadido a la lista de pedidos.`;
    }
    case "crear_proyecto": {
      const id = await nextId("proyectos");
      D.proyectos.push({ id, nombre: args.nombre, descripcion: args.descripcion, estado: args.estado || "activo", responsable: "IA", fecha: t, notas: "" });
      save("proyectos");
      return `Proyecto "${args.nombre}" creado en I+D con estado "${args.estado}".`;
    }
    case "cambio_menu": {
      const id = await nextId("menu");
      D.menu.push({ id, plato: args.plato, seccion: args.seccion || "", estado: "activo", fecha: t, nota: args.nota || "" });
      save("menu");
      return `Cambio de menú registrado: "${args.plato}" en ${args.seccion}.`;
    }
    case "restaurante_accion": {
      const col = REST_COL_MAP[args.restaurante] || args.restaurante;
      const restNombre = (D.empresas || []).find((e) => e.theme === args.restaurante)?.nombre || args.restaurante;
      if (args.tipo === "kpi") {
        const colKey = `${col}_kpis`;
        const list = D[colKey] || [];
        const id = list.length ? Math.max(...list.map((x) => x.id || 0)) + 1 : 1;
        list.push({ id, covers: args.covers || null, ticket: args.ticket || null, nota: args.nota_valoracion || null, fecha: t, autor: "Asistente IA" });
        D[colKey] = list;
        save(colKey);
        return `KPI registrado en ${restNombre}: ${args.covers ? args.covers + " covers" : ""}${args.ticket ? " · " + args.ticket + "€" : ""}${args.nota_valoracion ? " · ★" + args.nota_valoracion : ""}`;
      }
      const colKey = args.tipo === "menu" ? `${col}_menus` : `${col}_${args.tipo}s`;
      const list = D[colKey] || [];
      const id = list.length ? Math.max(...list.map((x) => x.id || 0)) + 1 : 1;
      list.push({ id, nombre: args.nombre, descripcion: args.notas || "", estado: "activo", fecha: t, autor: "Asistente IA", notas: args.notas || "" });
      D[colKey] = list;
      save(colKey);
      const tipos = { receta: "Receta", idea: "Idea", menu: "Cambio de menú" };
      return `${tipos[args.tipo] || args.tipo} "${args.nombre}" añadida en ${restNombre}.`;
    }
    default:
      return "Herramienta no reconocida.";
  }
}

function nextId(col) {
  const list = D[col] || [];
  return list.length ? Math.max(...list.map((x) => Number(x.id) || 0)) + 1 : 1;
}

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function findRecipeByPrompt(prompt) {
  const normalizedPrompt = normalizeText(prompt);
  return D.recipes.find((recipe) => normalizedPrompt.includes(normalizeText(recipe.nombre)));
}

function findSectionByPrompt(prompt) {
  const normalizedPrompt = normalizeText(prompt);
  return SECS.find((section) => normalizedPrompt.includes(normalizeText(section)));
}

function formatList(items) {
  return items.map((item) => `• ${item}`).join("\n");
}

function localIAResponse(prompt) {
  const normalizedPrompt = normalizeText(prompt);
  const recipe = findRecipeByPrompt(prompt);
  const section = findSectionByPrompt(prompt);

  if (recipe && normalizedPrompt.includes("ingrediente")) {
    const ingredients = (recipe.ingredientes || []).map((item) => `${item.i}${item.c ? ` — ${item.c}` : ""}${item.u ? ` ${item.u}` : ""}`);
    return ingredients.length
      ? `Ingredientes de ${recipe.nombre}:\n${formatList(ingredients)}`
      : `La ficha de ${recipe.nombre} no tiene ingredientes cargados todavía.`;
  }

  if (recipe && (normalizedPrompt.includes("paso") || normalizedPrompt.includes("elaboracion") || normalizedPrompt.includes("hacer"))) {
    const steps = (recipe.pasos || []).map((step, index) => `${index + 1}. ${step}`);
    return steps.length
      ? `Elaboración de ${recipe.nombre}:\n${steps.join("\n")}`
      : `La ficha de ${recipe.nombre} no tiene pasos cargados todavía.`;
  }

  if (section || normalizedPrompt.includes("platos tenemos") || normalizedPrompt.includes("que platos")) {
    const targetSection = section || SECS.find((item) => normalizeText(item) !== "bienvenida" && normalizedPrompt.includes(normalizeText(item)));
    if (targetSection) {
      const recipes = D.recipes.filter((item) => item.seccion === targetSection).map((item) => item.nombre);
      return recipes.length
        ? `Platos en ${targetSection}:\n${formatList(recipes)}`
        : `Ahora mismo no hay platos cargados en la sección ${targetSection}.`;
    }
  }

  if (normalizedPrompt.includes("pedido") || normalizedPrompt.includes("proveedor") || normalizedPrompt.includes("compra")) {
    const activeItems = D.ingredientes.filter((item) => String(item.cant || "").trim());
    if (!activeItems.length) {
      return "Ahora mismo no hay cantidades activas en pedidos. Ve a Pedidos > Lista y añade cantidades para preparar el pedido.";
    }
    const grouped = {};
    activeItems.forEach((item) => {
      const key = item.prov || "Sin proveedor";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(`${item.ing} — ${item.cant}`);
    });
    return `Pedido actual por proveedor:\n${Object.entries(grouped).map(([provider, lines]) => `${provider}:\n${formatList(lines)}`).join("\n\n")}`;
  }

  if (normalizedPrompt.includes("aviso")) {
    const lastAvisos = [...D.avisos].slice(-3).reverse();
    return lastAvisos.length
      ? `Últimos avisos:\n${lastAvisos.map((item) => `• ${item.titulo} (${item.fecha})`).join("\n")}`
      : "No hay avisos cargados ahora mismo.";
  }

  if (normalizedPrompt.includes("proyecto") || normalizedPrompt.includes("i+d")) {
    const activeProjects = D.proyectos.filter((item) => item.estado === "activo" || item.estado === "testeo");
    return activeProjects.length
      ? `Proyectos activos o en testeo:\n${activeProjects.map((item) => `• ${item.nombre} — ${item.estado}`).join("\n")}`
      : "No hay proyectos activos o en testeo ahora mismo.";
  }

  if (normalizedPrompt.includes("practicante")) {
    const activePracs = D.practicantes.filter((item) => item.estado === "activo");
    return activePracs.length
      ? `Practicantes activos:\n${activePracs.map((item) => `• ${item.nombre}${item.partida ? ` — ${item.partida}` : ""}`).join("\n")}`
      : "No hay practicantes activos cargados.";
  }

  return [
    "Puedo ayudarte ya mismo con modo local dentro de la intranet.",
    "Prueba a preguntarme cosas como:",
    "• ¿Qué platos tenemos en Bosque?",
    "• ¿Ingredientes para la Torcaz en Nabos?",
    "• ¿Cómo va el pedido actual?",
    "• ¿Qué avisos hay?",
    "",
    "Si quieres redacción libre, traducciones o ideas más creativas, activa también tu API key de Groq."
  ].join("\n");
}

// ── Markdown ligero para respuestas IA ────────────────────────────────
function iaMD(raw) {
  let s = String(raw || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Formato
  s = s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    .replace(/`([^`\n]+?)`/g, "<code class='ia-code'>$1</code>")
    .replace(/^#{1,3} (.+)$/gm, "<b class='ia-h'>$1</b>")
    .replace(/^[-•] (.+)$/gm, "<span class='ia-li'>• $1</span>")
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");
  return s;
}

// ── Sugerencias dinámicas basadas en datos reales ─────────────────────
function iaSugsData() {
  const sugs = [];
  const hoy = today();

  // Urgentes activos
  const urgentes = (D.avisos || []).filter((a) => a.urgente);
  if (urgentes.length) sugs.push(`Resume los ${urgentes.length} avisos urgentes activos`);

  // Pedidos pendientes
  const pedPend = (D.ingredientes || []).filter((i) => i.pedido);
  if (pedPend.length) sugs.push(`Prepara el pedido para WhatsApp (${pedPend.length} productos)`);

  // Próximo evento
  const proxEvento = [...(D.eventos || [])].filter((e) => e.fecha >= hoy).sort((a, b) => a.fecha > b.fecha ? 1 : -1)[0];
  if (proxEvento) sugs.push(`¿Qué pasa esta semana? (próximo: ${proxEvento.titulo})`);

  // Practicantes activos
  const pracActivos = (D.practicantes || []).filter((p) => getPipelineStage(p) === "activo");
  if (pracActivos.length) sugs.push(`¿Cómo van los ${pracActivos.length} practicantes activos?`);

  // Proyectos en testeo
  const enTesteo = (D.proyectos || []).filter((p) => p.estado === "testeo");
  if (enTesteo.length) sugs.push(`Informe rápido de los proyectos en testeo`);

  // Siempre disponibles
  sugs.push("Resume todo lo que está pasando en el grupo hoy");
  sugs.push("Publica un aviso para el equipo");
  sugs.push("¿Cómo van los KPIs del grupo este mes?");
  sugs.push("Dame ideas para el menú de esta semana");
  sugs.push("Añade algo al pedido de esta semana");

  // Máximo 6, priorizando los contextuales
  return sugs.slice(0, 6);
}

function initIA() {
  const sugs = iaSugsData();
  document.getElementById("iasugs").innerHTML = sugs.map((p) => `<button class="ia-sug" onclick="iaSug('${safeText(p).replace(/'/g, "\\'")}')">${safeText(p)}</button>`).join("");
  const chat = document.getElementById("iachat");
  const platos = (D.recipes || []).length;
  const rests = (D.empresas || []).length;
  const keyActiva = !!gKey();
  const btn = document.getElementById("ia-key-btn");
  if (btn) btn.textContent = keyActiva ? "✓ IA activa" : "Activar IA gratis";
  if (!keyActiva) {
    chat.innerHTML = `<div class="ia-msg bot">Hola. Conozco <strong>${platos} platos</strong> del recetario, <strong>${rests} restaurantes</strong> del grupo y todo lo que hay en la intranet ahora mismo.<br><br>Para acciones directas, redacción libre o respuestas abiertas, activa la IA avanzada — es gratis, sin tarjeta. <button class="btn btn-s btn-g" onclick="pKey()">Activar gratis →</button></div>`;
  } else {
    chat.innerHTML = `<div class="ia-msg bot">Lista. Conozco <strong>${platos} platos</strong> y <strong>${rests} restaurantes</strong>. Puedo actuar directamente en la intranet: crear avisos, añadir pedidos, registrar KPIs y mucho más. ¿En qué te ayudo?</div>`;
  }
}

function clearIA() {
  iaH.length = 0;
  initIA();
}

function iaSug(text) {
  document.getElementById("iainput").value = text;
  document.getElementById("iasugs").innerHTML = "";
  iaEnv();
}

async function iaEnv() {
  const key = gKey();
  const input = document.getElementById("iainput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  const chat = document.getElementById("iachat");
  const loadingId = `ia-${Date.now()}`;
  chat.innerHTML += `<div class="ia-msg user">${safeText(text)}</div><div class="ia-msg loading" id="${loadingId}">Pensando...</div>`;
  chat.scrollTop = chat.scrollHeight;
  iaH.push({ role: "user", content: text });
  if (!key) {
    const reply = localIAResponse(text);
    document.getElementById(loadingId)?.remove();
    iaH.push({ role: "assistant", content: reply });
    chat.innerHTML += `<div class="ia-msg bot">${iaMD(reply)}</div>`;
    chat.scrollTop = chat.scrollHeight;
    return;
  }
  try {
    // ── Primera llamada con herramientas ──────────────────────
    const messages = [{ role: "system", content: iaCtx() }, ...iaH.slice(-10)];
    const response = await fetch(GROQ, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: IA_TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.7
      })
    });
    const data = await response.json();
    document.getElementById(loadingId)?.remove();

    if (!response.ok || data.error) {
      const message = data?.error?.message || `No he podido conectar con la IA avanzada (HTTP ${response.status}).`;
      chat.innerHTML += `<div class="ia-msg bot">Error: ${safeText(message)} <button class="btn btn-s" onclick="pKey()">Cambiar key</button></div>`;
      chat.scrollTop = chat.scrollHeight;
      return;
    }

    const choice = data.choices?.[0];

    // ── Llamada a herramientas ────────────────────────────────
    if (choice?.finish_reason === "tool_calls" && choice.message?.tool_calls?.length) {
      const assistantMsg = choice.message;
      messages.push(assistantMsg);

      // Ejecutar cada herramienta y recoger resultados
      const toolResults = [];
      const confirmations = [];
      for (const tc of assistantMsg.tool_calls) {
        let args = {};
        try { args = JSON.parse(tc.function.arguments); } catch (_) {}
        const result = await ejecutarHerramienta(tc.function.name, args);
        confirmations.push(result);
        toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
      }

      // Mostrar confirmaciones de acciones en el chat
      if (confirmations.length) {
        chat.innerHTML += `<div class="ia-msg action">${confirmations.map((c) => safeText(c)).join("<br>")}</div>`;
        chat.scrollTop = chat.scrollHeight;
      }

      // Segunda llamada para respuesta final
      const loadingId2 = `ia-${Date.now()}`;
      chat.innerHTML += `<div class="ia-msg loading" id="${loadingId2}">Redactando respuesta...</div>`;
      chat.scrollTop = chat.scrollHeight;

      const response2 = await fetch(GROQ, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [...messages, ...toolResults],
          max_tokens: 512,
          temperature: 0.7
        })
      });
      const data2 = await response2.json();
      document.getElementById(loadingId2)?.remove();

      const reply2 = data2.choices?.[0]?.message?.content || "Listo.";
      iaH.push({ role: "assistant", content: reply2 });
      chat.innerHTML += `<div class="ia-msg bot">${iaMD(reply2)}</div>`;

    } else {
      // ── Respuesta normal (sin herramientas) ───────────────────
      const reply = choice?.message?.content || "Sin respuesta.";
      iaH.push({ role: "assistant", content: reply });
      chat.innerHTML += `<div class="ia-msg bot">${iaMD(reply)}</div>`;
    }

  } catch (error) {
    document.getElementById(loadingId)?.remove();
    const fallback = `${localIAResponse(text)}\n\nHe entrado en modo local porque la IA avanzada no ha respondido.`;
    iaH.push({ role: "assistant", content: fallback });
    chat.innerHTML += `<div class="ia-msg bot">${iaMD(fallback)}<br><br><button class="btn btn-s" onclick="pKey()">Revisar key</button></div>`;
  }
  chat.scrollTop = chat.scrollHeight;
}

function pKey() {
  const yaActivada = !!gKey();
  oModal(`
    <h3>${yaActivada ? "Cambiar API key" : "Activar IA avanzada"}</h3>
    <p style="margin-bottom:16px;color:#5e5a54">Usa <strong>Groq</strong> — completamente gratis, sin tarjeta, sin límite diario para un equipo pequeño.</p>
    <div class="setup-steps">
      <div class="setup-step"><span class="step-num">1</span><div>Entra en <a href="https://console.groq.com/keys" target="_blank" rel="noopener" class="setup-link">console.groq.com/keys ↗</a> y crea una cuenta gratis</div></div>
      <div class="setup-step"><span class="step-num">2</span><div>Haz clic en <strong>"Create API Key"</strong>, dale un nombre (ej: OBA) y cópiala</div></div>
      <div class="setup-step"><span class="step-num">3</span><div>Pégala aquí abajo — se guarda solo en este dispositivo</div></div>
    </div>
    <div class="fr" style="margin-top:16px"><label>Tu API key de Groq</label><input id="apik" type="password" placeholder="gsk_..." autocomplete="off"></div>
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
  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function supportsManualInstallHint() {
  return (isIOS() || isAndroid()) && window.innerWidth < 769;
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

/* ══════════════════════════════════════
   GRUPO — Dashboard multi-empresa
══════════════════════════════════════ */

const ESTADO_LABELS = {
  abierto:      { label: "Abierto",      cls: "emp-estado-abierto" },
  cerrado:      { label: "Cerrado",      cls: "emp-estado-cerrado" },
  evento:       { label: "Evento hoy",   cls: "emp-estado-evento" },
  mantenimiento:{ label: "Mantenimiento",cls: "emp-estado-mant" }
};

function logoEmpresa(e) {
  // If real logo file exists, use it
  if (e.logoFile) {
    return `<img src="./icons/${safeText(e.logoFile)}" class="emp-logo-img emp-logo-img-${e.theme}" alt="${safeText(e.nombre)}">`;
  }
  if (e.theme === "oba") {
    return `<img src="./icons/oba-logo-white.png" class="emp-logo-img emp-logo-img-oba" alt="OBA">`;
  }
  if (e.theme === "cebo") {
    return `<div class="emp-logo-cebo">
      <img src="./icons/group-1-.svg" class="emp-logo-cebo-img" alt="CEBO">
      <div class="emp-logo-cebo-sub">CEBO · Madrid</div>
    </div>`;
  }
  if (e.theme === "ene") {
    return `<div class="emp-logo-ene">eñe</div>`;
  }
  if (e.theme === "candomo") {
    return `<div class="emp-logo-candomo">
      <div class="emp-logo-candomo-main">CAN DOMO</div>
      <div class="emp-logo-candomo-sub">Ibiza</div>
    </div>`;
  }
  if (e.theme === "canitas") {
    return `<div class="emp-logo-canitas">
      <div class="emp-logo-canitas-main">CAÑITAS</div>
      <div class="emp-logo-canitas-sub">Maite · Desde 1953</div>
    </div>`;
  }
  if (e.theme === "me") {
    return `<div class="emp-logo-me">
      <div class="emp-logo-me-main">ME</div>
      <div class="emp-logo-me-sub">Málaga</div>
    </div>`;
  }
  return `<div class="emp-logo-text">${safeText(e.nombre)}</div>`;
}

let grupoSection = "restaurantes"; // "restaurantes" | "descargables"

function showGrupoPanel() {
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById("panel-grupo")?.classList.add("active");
  document.querySelector('.nav-btn[data-panel="grupo"]')?.classList.add("active");
  document.querySelector('.hnav-btn[data-panel="grupo"]')?.classList.add("active");
  scrollTop();
  closeHamburger();
  document.getElementById("ped-float-bar")?.classList.remove("visible");

  if (sessionStorage.getItem(CANITAS_SESSION_KEY) !== "1") {
    document.getElementById("panel-grupo-body").innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;min-height:60vh">
        <div class="id-gate-card">
          <div class="eyebrow" style="margin-bottom:12px">Acceso restringido</div>
          <h2 style="font-size:1.5rem;margin:0 0 6px">Cañitas Gastro</h2>
          <p style="color:var(--muted);font-size:13px;margin:0 0 24px">Grupo de restaurantes</p>
          <input class="login-input" type="password" id="canitas-pwd" placeholder="Contraseña"
            onkeydown="if(event.key==='Enter')unlockCanitas()">
          <button class="primary-btn" style="margin-top:10px;width:100%" onclick="unlockCanitas()">Entrar</button>
          <div class="login-error" id="canitas-err" style="margin-top:8px"></div>
        </div>
      </div>`;
    return;
  }
  rGrupo();
}

function rGrupo() {
  if (sessionStorage.getItem(CANITAS_SESSION_KEY) !== "1") return; // panel locked — don't overwrite gate
  if (grupoSection === "descargables") { rGrupoDescargables(); return; }
  if (typeof grupoView === "number") { rEmpresaDetalle(grupoView); return; }

  const empresas = (D.empresas || []).slice().sort((a, b) => a.id - b.id);
  const tabBar = `
    <div class="segmented-bar" style="margin-bottom:18px">
      <button class="segment-btn${grupoSection === "restaurantes" ? " active" : ""}" onclick="grupoSection='restaurantes';rGrupo()">Restaurantes</button>
      <button class="segment-btn${grupoSection === "descargables" ? " active" : ""}" onclick="grupoSection='descargables';rGrupo()">${ico('folder', 16)} Kit de apertura</button>
    </div>`;

  if (!empresas.length) {
    document.getElementById("panel-grupo-body").innerHTML = tabBar + `<div class="notice">Sin empresas configuradas.</div>`;
    return;
  }

  const pracActivos = (nombreEmpresa) => {
    if (nombreEmpresa === "OBA–") return D.practicantes.filter((p) => getPipelineStage(p) === "activo").length;
    return "—";
  };

  const cards = empresas.map((e) => {
    const est = ESTADO_LABELS[e.estado] || ESTADO_LABELS.abierto;
    const prac = pracActivos(e.nombre);
    return `
      <div class="emp-card emp-card-${e.theme}" onclick="rEmpresaDetalle(${e.id})">
        <div class="emp-card-logo">${logoEmpresa(e)}</div>
        <div class="emp-card-meta">
          <div class="emp-card-sub">${safeText(e.subtitulo)}</div>
          <div class="emp-card-loc">${ico('map-pin', 13)} ${safeText(e.ubicacion)}</div>
        </div>
        <div class="emp-card-footer">
          <span class="emp-estado ${est.cls}">${est.label}</span>
          ${e.notaDia ? `<span class="emp-nota-preview">${safeText(e.notaDia.slice(0, 40))}${e.notaDia.length > 40 ? "…" : ""}</span>` : ""}
        </div>
        ${typeof prac === "number" ? `<div class="emp-stat-row"><span class="emp-stat-label">Practicantes activos</span><span class="emp-stat-val">${prac}</span></div>` : ""}
        <div class="emp-card-enter">Ver detalle →</div>
      </div>`;
  }).join("");

  document.getElementById("panel-grupo-body").innerHTML = tabBar + `<div class="emp-grid">${cards}</div>`;
}

// ── Kit de apertura / Descargables del grupo ──────────────────────────

const GRUPO_DESC_CATS = [
  { key: "identidad",   label: "Identidad de marca",      icon: () => ico('paint-brush') },
  { key: "operativo",   label: "Manual operativo",         icon: () => ico('clipboard-text') },
  { key: "carta",       label: "Carta y recetario base",   icon: () => ico('fork-knife') },
  { key: "formacion",   label: "Formación del equipo",     icon: () => ico('graduation-cap') },
  { key: "proveedores", label: "Proveedores homologados",  icon: () => ico('truck') },
  { key: "rrhh",        label: "RRHH y contratos",         icon: () => ico('users') },
  { key: "legal",       label: "Legal y permisos",         icon: () => ico('scales') },
  { key: "diseno",      label: "Diseño y arquitectura",    icon: () => ico('hard-hat') },
  { key: "otro",        label: "Otros",                    icon: () => ico('folder-open') }
];

const GRUPO_DESC_TIPOS = [
  { key: "pdf",    label: "PDF",              icon: () => ico('file-pdf') },
  { key: "doc",    label: "Google Doc",       icon: () => ico('file-doc') },
  { key: "sheet",  label: "Hoja de cálculo",  icon: () => ico('table') },
  { key: "folder", label: "Carpeta",          icon: () => ico('folder') },
  { key: "imagen", label: "Imagen",           icon: () => ico('image') },
  { key: "link",   label: "Enlace",           icon: () => ico('link') }
];

function tipoIcon(tipo) {
  const t = GRUPO_DESC_TIPOS.find((t) => t.key === tipo) || GRUPO_DESC_TIPOS.find((t) => t.key === "link");
  return t.icon();
}

function rGrupoDescargables() {
  const docs = D.grupo_descargables || [];
  const tabBar = `
    <div class="segmented-bar" style="margin-bottom:18px">
      <button class="segment-btn" onclick="grupoSection='restaurantes';rGrupo()">Restaurantes</button>
      <button class="segment-btn active">${ico('folder', 16)} Kit de apertura</button>
    </div>`;

  const intro = `
    <div class="grupo-desc-intro">
      <p>Documentos, plantillas y recursos para estandarizar la apertura de futuros restaurantes del grupo.</p>
      <button class="primary-btn" onclick="oGrupoDescM()">+ Añadir documento</button>
    </div>`;

  if (!docs.length) {
    document.getElementById("panel-grupo-body").innerHTML = tabBar + intro + `<div class="notice" style="margin-top:24px">Aún no hay documentos. Añade manuales, plantillas o enlaces de Google Drive.</div>`;
    return;
  }

  // Agrupar por categoría
  const porCat = {};
  GRUPO_DESC_CATS.forEach((c) => { porCat[c.key] = []; });
  docs.forEach((d) => { (porCat[d.categoria] = porCat[d.categoria] || []).push(d); });

  let html = tabBar + intro;
  GRUPO_DESC_CATS.forEach((cat) => {
    const lista = porCat[cat.key] || [];
    if (!lista.length) return;
    html += `
      <div class="grupo-desc-section">
        <div class="grupo-desc-cat-head">
          <span>${cat.icon()} ${cat.label}</span>
          <button class="ghost-btn ghost-btn-sm" onclick="oGrupoDescM(null,'${cat.key}')">+ Añadir</button>
        </div>
        <div class="grupo-desc-grid">
          ${lista.map((d) => `
            <div class="grupo-desc-card">
              <div class="grupo-desc-card-top">
                <span class="grupo-desc-tipo">${tipoIcon(d.tipo)} ${safeText(d.tipo || "link")}</span>
                <div class="grupo-desc-card-actions">
                  <button class="btn btn-s btn-o" onclick="oGrupoDescM(${d.id})">Editar</button>
                  ${d.url ? `<a class="btn btn-s btn-g" href="${safeText(d.url)}" target="_blank" rel="noopener">Abrir ↗</a>` : ""}
                </div>
              </div>
              <div class="grupo-desc-card-title">${safeText(d.titulo)}</div>
              ${d.descripcion ? `<div class="grupo-desc-card-desc">${safeText(d.descripcion)}</div>` : ""}
              <div class="grupo-desc-card-meta">${d.fecha || ""}</div>
            </div>`).join("")}
        </div>
      </div>`;
  });

  document.getElementById("panel-grupo-body").innerHTML = html;
}

function oGrupoDescM(id, catPreset) {
  const d = id ? (D.grupo_descargables || []).find((x) => x.id === id) : null;
  const catOpts = GRUPO_DESC_CATS.map((c) =>
    `<option value="${c.key}"${(d ? d.categoria : catPreset) === c.key ? " selected" : ""}>${c.label}</option>`
  ).join("");
  const tipoOpts = GRUPO_DESC_TIPOS.map((t) =>
    `<option value="${t.key}"${(d?.tipo || "link") === t.key ? " selected" : ""}>${t.label}</option>`
  ).join("");
  oModal(`
    <h2>${d ? "Editar documento" : "Nuevo documento"}</h2>
    <label>Título</label>
    <input class="field-input" id="gd-titulo" placeholder="Ej: Manual de identidad visual OBA" value="${safeText(d?.titulo || "")}" autofocus>
    <label>Descripción</label>
    <textarea class="field-area" id="gd-desc" rows="2" placeholder="Breve descripción del contenido...">${safeText(d?.descripcion || "")}</textarea>
    <label>Categoría</label>
    <select class="field-select" id="gd-cat">${catOpts}</select>
    <label>Tipo de archivo</label>
    <select class="field-select" id="gd-tipo">${tipoOpts}</select>
    <label>Enlace (Google Drive, Dropbox, web...)</label>
    <input class="field-input" id="gd-url" placeholder="https://..." value="${safeText(d?.url || "")}">
    <div class="form-actions">
      ${d ? `<button class="btn btn-d btn-s" onclick="dGrupoDesc(${id})">Eliminar</button>` : ""}
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sGrupoDesc(${id || "null"})">Guardar</button>
    </div>`);
}

function sGrupoDesc(id) {
  const titulo = document.getElementById("gd-titulo")?.value.trim();
  if (!titulo) { alert("Escribe un título."); return; }
  const payload = {
    titulo,
    descripcion: document.getElementById("gd-desc")?.value.trim() || "",
    categoria: document.getElementById("gd-cat")?.value || "otro",
    tipo: document.getElementById("gd-tipo")?.value || "link",
    url: document.getElementById("gd-url")?.value.trim() || "",
    fecha: id ? ((D.grupo_descargables || []).find((x) => x.id === id)?.fecha || today()) : today()
  };
  if (!D.grupo_descargables) D.grupo_descargables = [];
  if (id) {
    Object.assign(D.grupo_descargables.find((x) => x.id === id), payload);
  } else {
    const nid = D.grupo_descargables.length ? Math.max(...D.grupo_descargables.map((x) => x.id || 0)) + 1 : 1;
    D.grupo_descargables.push({ id: nid, ...payload });
  }
  save("grupo_descargables");
  cModal();
  rGrupoDescargables();
}

function dGrupoDesc(id) {
  if (!confirm("¿Eliminar este documento?")) return;
  D.grupo_descargables = (D.grupo_descargables || []).filter((x) => x.id !== id);
  save("grupo_descargables");
  cModal();
  rGrupoDescargables();
}

let grupoView = "dashboard";
let restTab = "resumen"; // "resumen" | "recetario" | "menu" | "ideas" | "kpis"

function rEmpresaDetalle(id, tab) {
  const e = (D.empresas || []).find((x) => x.id === id);
  if (!e) return;
  grupoView = id;
  if (tab) restTab = tab;

  const col = REST_COL_MAP[e.theme] || e.theme;
  const est = ESTADO_LABELS[e.estado] || ESTADO_LABELS.abierto;
  const estadoOpts = Object.entries(ESTADO_LABELS).map(([k, v]) =>
    `<option value="${k}"${e.estado === k ? " selected" : ""}>${v.label}</option>`
  ).join("");

  const tabs = ["resumen", "recetario", "menu", "ideas", "kpis"];
  const tabLabels = { resumen: "Resumen", recetario: `${ico('fork-knife',14)} Recetario`, menu: `${ico('clipboard-text',14)} Menú`, ideas: `${ico('lightbulb',14)} Ideas`, kpis: `${ico('chart-bar',14)} KPIs` };
  const tabsHtml = tabs.map((t) =>
    `<button class="tab-btn${restTab === t ? " tab-active" : ""}" onclick="rEmpresaDetalle(${e.id},'${t}')">${tabLabels[t]}</button>`
  ).join("");

  let bodyHtml = "";

  if (restTab === "resumen") {
    const recetas = (D[`${col}_recetas`] || []);
    const menus = (D[`${col}_menus`] || []);
    const ideas = (D[`${col}_ideas`] || []).filter((x) => x.estado !== "descartada");
    const kpis = [...(D[`${col}_kpis`] || [])].sort((a, b) => b.fecha > a.fecha ? 1 : -1);
    const ultimoKpi = kpis[0] || null;

    const pracActivos = e.theme === "oba" ? D.practicantes.filter((p) => getPipelineStage(p) === "activo") : [];
    const avisosRec = e.theme === "oba" ? D.avisos.slice(-3).reverse() : [];
    const eventosProx = e.theme === "oba" ? D.eventos.filter((ev) => ev.fecha >= today()).slice(0, 3) : [];

    bodyHtml = `
      <div class="emp-detalle-grid">
        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Estado hoy</div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
            <span class="emp-estado ${est.cls} emp-estado-lg">${est.label}</span>
            <select class="field-select" onchange="setEstadoEmpresa(${e.id},this.value)" style="flex:1;min-width:120px">${estadoOpts}</select>
          </div>
          <label style="font-size:12px;font-weight:700;color:var(--muted);display:block;margin-bottom:6px">NOTA DEL DÍA</label>
          <textarea id="nota-dia-${e.id}" class="field-area" rows="3" placeholder="Mensaje al equipo, incidencia, recordatorio...">${safeText(e.notaDia || "")}</textarea>
          <button class="primary-btn" style="margin-top:8px;width:100%" onclick="saveNotaDia(${e.id})">Guardar nota</button>
        </div>

        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Este mes</div>
          <div class="rest-stats-grid">
            <div class="rest-stat" onclick="rEmpresaDetalle(${e.id},'recetario')">
              <div class="rest-stat-val">${recetas.length}</div>
              <div class="rest-stat-label">Recetas</div>
            </div>
            <div class="rest-stat" onclick="rEmpresaDetalle(${e.id},'menu')">
              <div class="rest-stat-val">${menus.filter((m) => m.estado === "activo").length}</div>
              <div class="rest-stat-label">Cambios activos</div>
            </div>
            <div class="rest-stat" onclick="rEmpresaDetalle(${e.id},'ideas')">
              <div class="rest-stat-val">${ideas.length}</div>
              <div class="rest-stat-label">Ideas</div>
            </div>
            <div class="rest-stat" onclick="rEmpresaDetalle(${e.id},'kpis')">
              <div class="rest-stat-val">${ultimoKpi ? (ultimoKpi.nota ? "⭐" + ultimoKpi.nota : ultimoKpi.covers || "—") : "—"}</div>
              <div class="rest-stat-label">Último KPI</div>
            </div>
          </div>
        </div>

        ${ultimoKpi ? `
        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Último KPI registrado <span class="nd">${fmtDate(ultimoKpi.fecha)}</span></div>
          <div class="rest-kpi-row">${ultimoKpi.covers ? `<span><strong>${ultimoKpi.covers}</strong> covers</span>` : ""}${ultimoKpi.ticket ? `<span><strong>${ultimoKpi.ticket}€</strong> ticket medio</span>` : ""}${ultimoKpi.nota ? `<span><strong>⭐ ${ultimoKpi.nota}</strong> valoración</span>` : ""}</div>
          <button class="ghost-btn ghost-btn-sm" style="margin-top:10px" onclick="rEmpresaDetalle(${e.id},'kpis')">Ver histórico →</button>
        </div>` : ""}

        ${ideas.slice(0, 3).length ? `
        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Ideas recientes</div>
          ${ideas.slice(0, 3).map((i) => `
            <div class="rest-item-row">
              <span>${ico('lightbulb', 14)} ${safeText(i.nombre)}</span>
              <span class="nd">${fmtDate(i.fecha)}</span>
            </div>`).join("")}
          <button class="ghost-btn ghost-btn-sm" style="margin-top:10px" onclick="rEmpresaDetalle(${e.id},'ideas')">Ver todas →</button>
        </div>` : ""}

        ${e.theme === "oba" && pracActivos.length ? `
        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Practicantes activos (${pracActivos.length})</div>
          ${pracActivos.map((p) => `
            <div class="hab-ocupante" onclick="sp('practicantes');oPF(${p.id})">
              <div><div style="font-weight:600">${safeText(p.nombre)}</div>
              <div class="nd">${safeText(p.partida || "Sin partida")} · ${fmtDate(p.fechaEntrada)} → ${fmtDate(p.fechaSalida)}</div></div>
              <span style="color:var(--muted);font-size:18px">›</span>
            </div>`).join("")}
        </div>` : ""}

        ${e.theme === "oba" && avisosRec.length ? `
        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Últimos avisos</div>
          ${avisosRec.map((a) => `
            <div class="notice" style="margin-bottom:8px${a.urgente ? ";border-left-color:var(--red);background:var(--red-soft)" : ""}">
              <strong>${safeText(a.titulo)}</strong>
              <div class="nd">${safeText(a.texto.slice(0, 80))}${a.texto.length > 80 ? "…" : ""}</div>
            </div>`).join("")}
          <button class="ghost-btn ghost-btn-sm" onclick="sp('avisos')">Ver todos →</button>
        </div>` : ""}

        <div class="emp-detalle-card">
          <div class="emp-detalle-card-title">Google Reviews</div>
          ${(() => {
            const ggKey = getGGKey();
            const hasPlaceId = !!e.googlePlaceId;
            const col = `${REST_COL_MAP[e.theme] || e.theme}_kpis`;
            const lastAuto = [...(D[col] || [])].filter((k) => k.autor === "Google Reviews (auto)").sort((a, b) => b.fecha > a.fecha ? 1 : -1)[0];
            return `
              <div id="emp-gg-rating-${e.id}" style="margin-bottom:12px">
                ${lastAuto?.nota
                  ? `<strong style="font-size:22px">⭐ ${lastAuto.nota}</strong><span class="nd" style="margin-left:8px">${lastAuto.total_resenas || ""} reseñas</span><div class="nd" style="font-size:11px;margin-top:4px">Última sync: ${fmtDate(lastAuto.fecha)}</div>`
                  : `<span class="nd">Sin datos todavía</span>`}
              </div>
              <div id="gg-sync-status-${e.id}" style="font-size:12px;margin-bottom:10px"></div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button id="gg-sync-btn-${e.id}" class="primary-btn" onclick="syncGoogleReviews(${e.id})"
                  style="font-size:13px">${ico('arrows-clockwise', 13)} Actualizar</button>
                ${!hasPlaceId ? `<button class="secondary-btn" style="font-size:13px" onclick="oSetPlaceId(${e.id})">Configurar restaurante</button>` : `<button class="ghost-btn ghost-btn-sm" onclick="oSetPlaceId(${e.id})">Editar Place ID</button>`}
                ${!ggKey ? `<button class="ghost-btn ghost-btn-sm gg-key-btn" onclick="pGGKey()">Añadir API key</button>` : `<button class="ghost-btn ghost-btn-sm gg-key-btn" onclick="pGGKey()">API configurada ✓</button>`}
              </div>`;
          })()}
        </div>
      </div>`;

  } else if (restTab === "recetario") {
    const recetas = (D[`${col}_recetas`] || []);
    bodyHtml = `
      <div class="rest-section-head">
        <span id="rest-rcount-${e.id}">${recetas.length} receta${recetas.length !== 1 ? "s" : ""}</span>
        <div style="display:flex;gap:8px">
          <button class="ghost-btn ghost-btn-sm" onclick="reloadRecetario(${e.id},'${col}')" title="Recargar desde Firebase">${ico('arrows-clockwise', 14)}</button>
          <button class="primary-btn" onclick="oRestRM(${e.id},'${col}',null)">+ Nueva receta</button>
        </div>
      </div>
      <div class="toolbar" style="margin-bottom:16px">
        <input id="rest-rsearch-${e.id}" class="search-input" type="search" placeholder="Buscar receta…" oninput="rRestRecetario(${e.id},'${col}')">
        <select id="rest-rcat-${e.id}" class="field-select" onchange="rRestRecetario(${e.id},'${col}')">
          <option value="">Todas las secciones</option>
          ${REST_SECS.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>
      <div class="rest-rcards" id="rest-rcards-${e.id}">${skeletonCards()}</div>`; // filled by rRestRecetario
    // Solo carga si no hay datos ya (evita 429 por demasiadas peticiones a Firestore)
    if ((D[`${col}_recetas`] || []).length > 0) { setTimeout(() => rRestRecetario(e.id, col), 0); } else
    setTimeout(async () => {
      try {
        const colName = `${col}_recetas`;
        const url = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents/${colName}?pageSize=300&key=${FB.apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = await res.json();
        const docs = json.documents || [];
        if (docs.length) {
            const items = docs.map(doc => {
              const fields = doc.fields || {};
              const parse = (v) => {
                if (!v) return undefined;
                if (v.stringValue !== undefined) return v.stringValue;
                if (v.integerValue !== undefined) return Number(v.integerValue);
                if (v.doubleValue !== undefined) return Number(v.doubleValue);
                if (v.booleanValue !== undefined) return v.booleanValue;
                if (v.arrayValue) return (v.arrayValue.values || []).map(parse);
                if (v.mapValue) {
                  const obj = {};
                  Object.entries(v.mapValue.fields || {}).forEach(([k, fv]) => { obj[k] = parse(fv); });
                  return obj;
                }
                return undefined;
              };
              const obj = {};
              Object.entries(fields).forEach(([k, v]) => { obj[k] = parse(v); });
              return obj;
            }).sort((a,b) => (a._i||0)-(b._i||0));
            D[colName] = items.map((item, idx) => ({ ...item, _i: item._i ?? idx }));
        }
      } catch (err) {
        console.warn("recetario REST fetch failed:", err);
        toast("Error cargando recetario: " + err.message, "err");
      }
      const total = (D[`${col}_recetas`] || []).length;
      const countEl = document.getElementById(`rest-rcount-${e.id}`);
      if (countEl) countEl.textContent = `${total} receta${total !== 1 ? "s" : ""}`;
      rRestRecetario(e.id, col);
      loadRestPhotos(col).then(() => rRestRecetario(e.id, col));
    }, 0);

  } else if (restTab === "menu") {
    const menus = (D[`${col}_menus`] || []).slice().reverse();
    bodyHtml = `
      <div class="rest-section-head">
        <span>${menus.filter((m) => m.estado === "activo").length} cambio${menus.filter((m) => m.estado === "activo").length !== 1 ? "s" : ""} activo${menus.filter((m) => m.estado === "activo").length !== 1 ? "s" : ""}</span>
        <button class="primary-btn" onclick="oRestItemM(${e.id},'menu')">+ Nuevo cambio</button>
      </div>
      ${menus.length ? menus.map((m) => `
        <div class="rest-item-card${m.estado !== "activo" ? " rest-item-inactive" : ""}">
          <div class="rest-item-main">
            <div class="rest-item-name">${safeText(m.nombre)}</div>
            ${m.descripcion ? `<div class="nd">${safeText(m.descripcion)}</div>` : ""}
          </div>
          <div class="rest-item-meta">
            <span class="pip-tag pip-${m.estado === "activo" ? "activo" : "evaluado"}">${m.estado === "activo" ? "Activo" : "Retirado"}</span>
            <span class="nd">${fmtDate(m.fecha)}</span>
            <button class="ghost-btn ghost-btn-sm" onclick="toggleRestMenuEstado(${e.id},${m.id})">${m.estado === "activo" ? "Retirar" : "Reactivar"}</button>
            <button class="danger-soft ghost-btn ghost-btn-sm" onclick="dRestItem(${e.id},'menu','${col}_menus',${m.id})">×</button>
          </div>
        </div>`).join("") : `<div class="notice">Sin cambios de menú. Usa /${col} menu [cambio] desde WhatsApp.</div>`}`;

  } else if (restTab === "ideas") {
    const ideas = (D[`${col}_ideas`] || []).slice().reverse();
    const estadoIdea = { activo: "En curso", testeo: "Testeando", listo: "Lista", pausado: "Pausada", descartada: "Descartada" };
    bodyHtml = `
      <div class="rest-section-head">
        <span>${ideas.filter((i) => i.estado !== "descartada").length} idea${ideas.filter((i) => i.estado !== "descartada").length !== 1 ? "s" : ""} activa${ideas.filter((i) => i.estado !== "descartada").length !== 1 ? "s" : ""}</span>
        <button class="primary-btn" onclick="oRestItemM(${e.id},'ideas')">+ Nueva idea</button>
      </div>
      ${ideas.length ? ideas.map((i) => `
        <div class="rest-item-card${i.estado === "descartada" ? " rest-item-inactive" : ""}">
          <div class="rest-item-main">
            <div class="rest-item-name">${ico('lightbulb', 14)} ${safeText(i.nombre)}</div>
            ${i.notas ? `<div class="rest-item-notas">${safeText(i.notas)}</div>` : ""}
          </div>
          <div class="rest-item-meta">
            <select class="field-select" style="font-size:12px" onchange="setRestIdeaEstado(${e.id},${i.id},this.value,'${col}')">
              ${Object.entries(estadoIdea).map(([k, v]) => `<option value="${k}"${i.estado === k ? " selected" : ""}>${v}</option>`).join("")}
            </select>
            <span class="nd">${fmtDate(i.fecha)}</span>
            <button class="danger-soft ghost-btn ghost-btn-sm" onclick="dRestItem(${e.id},'ideas','${col}_ideas',${i.id})">×</button>
          </div>
        </div>`).join("") : `<div class="notice">Sin ideas aún. Usa /${col} idea [texto] desde WhatsApp.</div>`}`;

  } else if (restTab === "kpis") {
    const kpis = (D[`${col}_kpis`] || []).slice().sort((a, b) => b.fecha > a.fecha ? 1 : -1);
    const kpiAuto = kpis.filter((k) => k.autor === "Google Reviews (auto)");
    const kpiManual = kpis.filter((k) => k.autor !== "Google Reviews (auto)");
    const ultimoAuto = kpiAuto[0];
    const ultimoManual = kpiManual[0];

    // métricas internas del restaurante
    const recetas = (D[`${col}_recetas`] || []);
    const menus = (D[`${col}_menus`] || []);
    const ideas = (D[`${col}_ideas`] || []);
    const ideasActivas = ideas.filter((i) => i.estado === "activo" || i.estado === "testeo");
    const ideasListas = ideas.filter((i) => i.estado === "listo");

    // mini barra visual para valoración (0-5 → 0-100%)
    const notaBar = (n) => n ? `<div class="kpi-bar-wrap"><div class="kpi-bar" style="width:${(n/5*100).toFixed(0)}%"></div><span>${n}/5</span></div>` : "—";

    // tendencia covers (últimos 5 manuales)
    const coversRecientes = kpiManual.slice(0, 5).reverse();
    const maxCovers = Math.max(...coversRecientes.map((k) => k.covers || 0), 1);

    bodyHtml = `
      <div class="rest-section-head">
        <span>Métricas y KPIs</span>
        <button class="primary-btn" onclick="oRestKpiM(${e.id})">+ Registrar KPI</button>
      </div>

      <div class="kpi-summary-grid">
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">⭐ Valoración Google</div>
          <div class="kpi-summary-val">${ultimoAuto?.nota ? ultimoAuto.nota : "—"}</div>
          ${ultimoAuto?.nota ? notaBar(ultimoAuto.nota) : ""}
          <div class="kpi-summary-sub">${ultimoAuto?.total_resenas ? ultimoAuto.total_resenas + " reseñas" : "Sin datos automáticos"}</div>
          <div class="kpi-summary-date">${ultimoAuto ? fmtDate(ultimoAuto.fecha) : ""}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">${ico('armchair', 14)} Último covers</div>
          <div class="kpi-summary-val">${ultimoManual?.covers || "—"}</div>
          <div class="kpi-summary-sub">comensales</div>
          <div class="kpi-summary-date">${ultimoManual ? fmtDate(ultimoManual.fecha) : ""}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">${ico('currency-eur', 14)} Ticket medio</div>
          <div class="kpi-summary-val">${ultimoManual?.ticket ? ultimoManual.ticket + "€" : "—"}</div>
          <div class="kpi-summary-sub">por comensal</div>
          <div class="kpi-summary-date">${ultimoManual ? fmtDate(ultimoManual.fecha) : ""}</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">${ico('fork-knife', 14)} Recetas</div>
          <div class="kpi-summary-val">${recetas.length}</div>
          <div class="kpi-summary-sub">estandarizadas</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">${ico('clipboard-text', 14)} Carta activa</div>
          <div class="kpi-summary-val">${menus.filter((m) => m.estado === "activo").length}</div>
          <div class="kpi-summary-sub">cambios activos</div>
        </div>
        <div class="kpi-summary-card">
          <div class="kpi-summary-label">${ico('lightbulb', 14)} Ideas</div>
          <div class="kpi-summary-val">${ideasActivas.length}</div>
          <div class="kpi-summary-sub">${ideasListas.length} listas · ${ideas.filter((i) => i.estado === "descartada").length} descartadas</div>
        </div>
      </div>

      ${coversRecientes.length > 1 ? `
      <div class="kpi-chart-wrap">
        <div class="kpi-chart-title">Tendencia covers (últimas ${coversRecientes.length} entradas)</div>
        <div class="kpi-chart-bars">
          ${coversRecientes.map((k) => `
            <div class="kpi-chart-col">
              <div class="kpi-chart-bar-outer">
                <div class="kpi-chart-bar-inner" style="height:${((k.covers||0)/maxCovers*100).toFixed(0)}%"></div>
              </div>
              <div class="kpi-chart-bar-val">${k.covers || "—"}</div>
              <div class="kpi-chart-bar-date">${fmtDate(k.fecha).slice(0,5)}</div>
            </div>`).join("")}
        </div>
      </div>` : ""}

      ${kpis.length ? `
      <div class="kpi-section-title">Historial completo</div>
      <div class="rest-kpi-table">
        <div class="rest-kpi-thead">
          <span>Fecha</span><span>Covers</span><span>Ticket</span><span>Valoración</span><span>Reseñas</span><span>Fuente</span>
        </div>
        ${kpis.map((k) => `
          <div class="rest-kpi-row-data${k.autor === 'Google Reviews (auto)' ? ' kpi-row-auto' : ''}">
            <span>${fmtDate(k.fecha)}</span>
            <span>${k.covers || "—"}</span>
            <span>${k.ticket ? k.ticket + "€" : "—"}</span>
            <span>${k.nota ? "⭐ " + k.nota : "—"}</span>
            <span>${k.total_resenas || "—"}</span>
            <span class="nd">${k.autor === "Google Reviews (auto)" ? `${ico('robot', 13)} Auto` : safeText(k.autor || "—")}</span>
          </div>`).join("")}
      </div>` : `<div class="notice" style="margin-top:16px">Sin historial aún. Usa /${col} kpi covers:X ticket:X nota:X desde WhatsApp, o activa Google Reviews automático.</div>`}`;
  }

  document.getElementById("panel-grupo-body").innerHTML = `
    <div class="emp-detalle">
      <button class="ghost-btn ghost-btn-sm emp-back" onclick="grupoView='dashboard';rGrupo()">← Volver al grupo</button>

      <div class="emp-detalle-header emp-detalle-${e.theme}">
        <div class="emp-detalle-logo">${logoEmpresa(e)}</div>
        <div class="emp-detalle-info">
          <div class="emp-detalle-sub">${safeText(e.subtitulo)}</div>
          <div class="emp-detalle-loc">${ico('map-pin', 13)} ${safeText(e.ubicacion)}</div>
          ${e.web ? `<a class="emp-detalle-web" href="${safeText(e.web)}" target="_blank">${safeText(e.web)}</a>` : ""}
        </div>
      </div>

      <div class="toolbar" style="margin-bottom:16px">
        <div class="ca">${tabsHtml}</div>
      </div>

      ${bodyHtml}
    </div>`;
}

function oRestItemM(empId, tipo) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  const col = REST_COL_MAP[e.theme] || e.theme;
  const labels = { menu: "cambio de menú", ideas: "idea" };
  const placeholders = { menu: "Descripción del cambio de carta", ideas: "Nueva idea o propuesta" };
  oModal(`
    <h2>Nueva ${labels[tipo] || tipo}</h2>
    <label>Nombre / descripción</label>
    <input class="field-input" id="ri-nombre" placeholder="${placeholders[tipo] || ""}" autofocus>
    <label>Notas adicionales</label>
    <textarea class="field-area" id="ri-notas" rows="3" placeholder="Elaboración, contexto, referencia..."></textarea>
    <div class="form-actions">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sRestItem(${empId},'${tipo}','${col}')">Guardar</button>
    </div>`);
}

function sRestItem(empId, tipo, col) {
  const nombre = document.getElementById("ri-nombre")?.value.trim();
  if (!nombre) { alert("Escribe un nombre."); return; }
  const notas = document.getElementById("ri-notas")?.value.trim() || "";
  const colKey = tipo === "menu" ? `${col}_menus` : `${col}_ideas`;
  const list = D[colKey] || [];
  const id = list.length ? Math.max(...list.map((x) => x.id || 0)) + 1 : 1;
  list.push({ id, nombre, notas, descripcion: "", estado: "activo", fecha: today(), autor: "Dirección" });
  D[colKey] = list;
  save(colKey);
  cModal();
  rEmpresaDetalle(empId, tipo);
}

function dRestItem(empId, tab, colKey, itemId) {
  if (!confirm("¿Eliminar este elemento?")) return;
  D[colKey] = (D[colKey] || []).filter((x) => x.id !== itemId);
  save(colKey);
  rEmpresaDetalle(empId, tab);
}

// ─── FULL RECIPE SYSTEM FOR GROUP RESTAURANTS ───────────────────────────────

function rRestRecetario(empId, col) {
  const q = (document.getElementById(`rest-rsearch-${empId}`)?.value || "").toLowerCase();
  const sec = document.getElementById(`rest-rcat-${empId}`)?.value || "";
  const all = D[`${col}_recetas`] || [];
  const list = all.filter((r) => {
    const ms = !q || (r.nombre || "").toLowerCase().includes(q) || (r.seccion || "").toLowerCase().includes(q) || (r.descripcion || "").toLowerCase().includes(q);
    const mc = !sec || r.seccion === sec;
    return ms && mc;
  }).slice().reverse();
  const container = document.getElementById(`rest-rcards-${empId}`);
  if (!container) return;
  container.innerHTML = list.length ? list.map((r) => `
    <article class="card rest-rec-card">
      ${brestSec(r.seccion || "Principales")}
      <h3>${safeText(r.nombre)}</h3>
      <p>${safeText(r.descripcion || "Sin descripción")}</p>
      <div class="cmeta">
        ${r.temporada ? `Temporada: ${safeText(r.temporada)}` : ""}
        ${r.raciones ? ` · ${safeText(r.raciones)} raciones` : ""}
        ${r.tiempoElaboracion ? ` · ${safeText(r.tiempoElaboracion)}` : ""}
        ${(r.alergenos || []).length ? `<br>${ico('warning', 13)} ${(r.alergenos || []).join(", ")}` : ""}
      </div>
      <div class="ca" style="margin-top:12px">
        <button class="btn btn-s" onclick="openRestRecipe(${empId},'${col}',${r._i})">Ver ficha</button>
        ${(r.hasPhoto || r.foto) ? `<button class="btn btn-s btn-o" onclick="viewRestPhoto(${r._i},'${col}')">Ver plato</button>` : ""}
        <button class="btn btn-o btn-s" onclick="oRestRM(${empId},'${col}',${r._i})">Editar</button>
        <button class="btn btn-s btn-d" onclick="dRestRec(${empId},'${col}',${r._i})">Eliminar</button>
      </div>
    </article>`).join("") : `<div class="notice"><strong>Sin resultados</strong><div>No se encontraron recetas con ese filtro.</div></div>`;
}

async function reloadRecetario(empId, col) {
  const container = document.getElementById(`rest-rcards-${empId}`);
  if (container) container.innerHTML = skeletonCards();
  try {
    const colName = `${col}_recetas`;
    const url = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents/${colName}?pageSize=300&key=${FB.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const docs = json.documents || [];
    if (docs.length) {
      const parse = (v) => {
        if (!v) return undefined;
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return Number(v.integerValue);
        if (v.doubleValue !== undefined) return Number(v.doubleValue);
        if (v.booleanValue !== undefined) return v.booleanValue;
        if (v.arrayValue) return (v.arrayValue.values || []).map(parse);
        if (v.mapValue) { const o={}; Object.entries(v.mapValue.fields||{}).forEach(([k,fv])=>{o[k]=parse(fv);}); return o; }
        return undefined;
      };
      const items = docs.map(doc => {
        const obj = {};
        Object.entries(doc.fields||{}).forEach(([k,v])=>{obj[k]=parse(v);});
        return obj;
      }).sort((a,b)=>(a._i||0)-(b._i||0));
      D[colName] = items.map((item,idx)=>({...item, _i: item._i??idx}));
      const countEl = document.getElementById(`rest-rcount-${empId}`);
      if (countEl) countEl.textContent = `${items.length} receta${items.length!==1?"s":""}`;
      toast(`✓ ${items.length} recetas cargadas`);
    } else {
      toast("La colección está vacía en Firebase", "err");
    }
    rRestRecetario(empId, col);
  } catch (err) {
    console.error("reloadRecetario failed", err);
    toast("Error: " + err.message, "err");
  }
}

function oRestRM(empId, col, id) {
  const colKey = `${col}_recetas`;
  const recipe = (id !== null && id !== undefined) ? (D[colKey] || []).find((r) => r._i === id) : null;
  const alerg = recipe?.alergenos || [];
  const subs = recipe?.subrecetas || [];
  oModal(`
    <h3>${recipe ? "Editar receta" : "Nueva receta"}</h3>
    <div class="fr"><label>Nombre *</label><input id="rr-n" value="${safeText(recipe?.nombre || "")}"></div>
    <div class="fr"><label>Sección</label>
      <select id="rr-sec">${REST_SECS.map((s) => `<option${recipe?.seccion === s ? " selected" : ""}>${s}</option>`).join("")}</select>
    </div>
    <div class="fr"><label>Temporada</label><input id="rr-t" value="${safeText(recipe?.temporada || "")}" placeholder="Ej: Primavera-Verano"></div>
    <div class="fr"><label>Descripción</label><textarea id="rr-d">${safeText(recipe?.descripcion || "")}</textarea></div>
    <div class="fr"><label>Raciones</label><input id="rr-rac" value="${safeText(recipe?.raciones || "")}" placeholder="Ej: 4"></div>
    <div class="fr"><label>Tiempo de elaboración</label><input id="rr-tiem" value="${safeText(recipe?.tiempoElaboracion || "")}" placeholder="Ej: 1h 30m"></div>
    <div class="fr"><label>Temperatura de servicio</label><input id="rr-temp" value="${safeText(recipe?.temperatura || "")}" placeholder="Ej: 65°C"></div>
    <div class="fr"><label>Alérgenos</label>
      <div class="allergen-grid">
        ${ALERGEN_LIST.map((a) => `<label class="allergen-option"><input type="checkbox" id="rral_${a.replace(/\s/g,"_")}" ${alerg.includes(a) ? "checked" : ""}> <span>${a}</span></label>`).join("")}
      </div>
    </div>
    <div class="fr"><label>Ingredientes principales</label>
      <div class="ingredient-editor">
        <div class="ingredient-items" id="rr-ing-rows">${ingredientItemsHtml(recipe?.ingredientes || [])}</div>
        ${ingredientComposerHtml("rr-ing-rows", "addMainIngredient")}
      </div>
    </div>
    <div class="fr"><label>Subrecetas</label>
      <div id="rr-subs-container">${subs.map((sub, i) => rrSubEditorHtml(sub, i)).join("")}</div>
      <button class="secondary-btn" type="button" onclick="addRRSub()">Añadir subreceta</button>
    </div>
    <div class="fr"><label>Elaboración final (un paso por línea)</label><textarea id="rr-p">${(recipe?.pasos || []).join("\n")}</textarea></div>
    <div class="fr"><label>Notas del chef</label><input id="rr-no" value="${safeText(recipe?.notas || "")}"></div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sRestRec(${empId},'${col}',${id || "null"})">Guardar</button>
    </div>`);
  window._rrSubCount = subs.length;
}

function rrSubEditorHtml(sub, index) {
  return `
    <div class="sub-block" data-idx="${index}">
      <div class="sub-block-head">
        <strong>Subreceta ${index + 1}</strong>
        <button class="btn btn-s btn-d" type="button" onclick="removeRRSub(${index})">Eliminar</button>
      </div>
      <input id="rrsn_${index}" placeholder="Nombre" value="${safeText(sub.nombre || "")}" style="margin-bottom:8px">
      <textarea id="rrsd_${index}" placeholder="Descripción" style="margin-bottom:8px">${safeText(sub.descripcion || "")}</textarea>
      <div class="ingredient-editor" style="margin-bottom:8px">
        <div class="ingredient-items" id="rrsi-rows-${index}">${ingredientItemsHtml(sub.ingredientes || [])}</div>
        ${ingredientComposerHtml(`rrsi-rows-${index}`, "addSubIngredient")}
      </div>
      <textarea id="rrsp_${index}" placeholder="Elaboración (un paso por línea)">${(sub.pasos || []).join("\n")}</textarea>
    </div>`;
}

function addRRSub() {
  const index = window._rrSubCount || 0;
  document.getElementById("rr-subs-container").insertAdjacentHTML("beforeend", rrSubEditorHtml({}, index));
  window._rrSubCount = index + 1;
}

function removeRRSub(index) {
  document.querySelector(`.sub-block[data-idx="${index}"]`)?.remove();
}

function sRestRec(empId, col, id) {
  const nombre = document.getElementById("rr-n")?.value.trim();
  if (!nombre) { alert("El nombre es obligatorio"); return; }
  const alergenos = ALERGEN_LIST.filter((a) => document.getElementById(`rral_${a.replace(/\s/g,"_")}`)?.checked);
  const subrecetas = [];
  document.querySelectorAll("#rr-subs-container .sub-block").forEach((block) => {
    const idx = block.dataset.idx;
    const snom = document.getElementById(`rrsn_${idx}`)?.value.trim();
    if (!snom) return;
    subrecetas.push({
      nombre: snom,
      descripcion: document.getElementById(`rrsd_${idx}`)?.value || "",
      ingredientes: collectIngredientItems(`rrsi-rows-${idx}`),
      pasos: (document.getElementById(`rrsp_${idx}`)?.value || "").split("\n").filter(Boolean)
    });
  });
  const colKey = `${col}_recetas`;
  const list = D[colKey] || [];
  const payload = {
    nombre,
    seccion: document.getElementById("rr-sec")?.value || REST_SECS[0],
    temporada: document.getElementById("rr-t")?.value || "",
    descripcion: document.getElementById("rr-d")?.value || "",
    raciones: document.getElementById("rr-rac")?.value || "",
    tiempoElaboracion: document.getElementById("rr-tiem")?.value || "",
    temperatura: document.getElementById("rr-temp")?.value || "",
    alergenos,
    ingredientes: collectIngredientItems("rr-ing-rows"),
    subrecetas,
    pasos: (document.getElementById("rr-p")?.value || "").split("\n").filter(Boolean),
    notas: document.getElementById("rr-no")?.value || "",
    fecha: today(),
    autor: "Dirección"
  };
  if (id !== null && id !== undefined) {
    const existing = list.find((r) => r._i === id);
    if (existing) Object.assign(existing, payload);
  } else {
    const newId = list.length ? Math.max(...list.map((r) => r._i ?? r.id ?? 0)) + 1 : 1;
    list.push({ _i: newId, ...payload });
    D[colKey] = list;
  }
  save(colKey);
  cModal();
  rEmpresaDetalle(empId, "recetario");
}

function dRestRec(empId, col, id) {
  if (!confirm("¿Eliminar esta receta?")) return;
  const colKey = `${col}_recetas`;
  D[colKey] = (D[colKey] || []).filter((r) => r._i !== id);
  save(colKey);
  rEmpresaDetalle(empId, "recetario");
}

function buildRestFichaHTML(recipe, scale = 1) {
  const subs = recipe.subrecetas || [];
  const alerg = recipe.alergenos || [];
  const ingredients = (recipe.ingredientes || []).length ? `
    <div class="rs">
      <h4>Ingredientes principales</h4>
      <div class="ig">
        <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
        ${(recipe.ingredientes || []).map((raw) => { const item = normalizeIngItem(raw); return `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(scaleQty(item.c, scale) || "—")}</div><div>${safeText(item.u || "")}</div>`; }).join("")}
      </div>
    </div>` : "";
  const subsHtml = subs.map((sub) => `
    <div class="rs">
      <h4>Subreceta · ${safeText(sub.nombre)}</h4>
      ${sub.descripcion ? `<p style="margin-bottom:10px;color:#5e5a54">${safeText(sub.descripcion)}</p>` : ""}
      ${(sub.ingredientes || []).length ? `
        <div class="ig" style="margin-bottom:14px">
          <div class="ih">Ingrediente</div><div class="ih">Cantidad</div><div class="ih">Unidad</div>
          ${(sub.ingredientes || []).map((raw) => { const item = normalizeIngItem(raw); return `<div>${safeText(item.i)}</div><div style="text-align:right">${safeText(scaleQty(item.c, scale) || "—")}</div><div>${safeText(item.u || "")}</div>`; }).join("")}
        </div>` : ""}
      ${(sub.pasos || []).length ? `<ol class="sl">${sub.pasos.map((step, i) => `<li><div class="sn">${i+1}</div><div>${safeText(step)}</div></li>`).join("")}</ol>` : ""}
    </div>`).join("");
  const steps = (recipe.pasos || []).length ? `
    <div class="rs">
      <h4>Elaboración final</h4>
      <ol class="sl">${recipe.pasos.map((step, i) => `<li><div class="sn">${i+1}</div><div>${safeText(step)}</div></li>`).join("")}</ol>
    </div>` : "";
  const alergHtml = alerg.length ? `
    <div class="rs">
      <h4>Alérgenos</h4>
      <div class="ca">${alerg.map((a) => `<span class="badge" style="border-color:#b84337;color:#b84337">${safeText(a)}</span>`).join("")}</div>
    </div>` : "";
  const scaleBar = _rscaleBase > 0 ? `
    <div class="scale-bar">
      <span class="scale-label">Base: <strong>${_rscaleBase}</strong> rac.</span>
      <div class="scale-ctrl">
        <span class="scale-label">Escalar a:</span>
        <button class="scale-btn" onclick="changeRestScale(-1)">−</button>
        <strong>${_rscaleCur}</strong>
        <button class="scale-btn" onclick="changeRestScale(1)">+</button>
        <span class="scale-label">raciones</span>
      </div>
    </div>` : "";
  return `
    ${scaleBar}
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

function openRestRecipe(empId, col, id) {
  const colKey = `${col}_recetas`;
  const recipe = (D[colKey] || []).find((r) => r._i === id);
  if (!recipe) return;
  activeRestRecipeId = id;
  restRecipeEmpId = empId;
  restRecipeCol = col;
  _rscaleBase = parseRaciones(recipe.raciones) || 4;
  _rscaleCur = _rscaleBase;
  _initScaleBar("restdet-scalebar", "restdet-scale-n", "restdet-scale-base", _rscaleBase);
  document.getElementById("restdet-tit").textContent = recipe.nombre;
  restRecipePrintMarkup = buildRestFichaHTML(recipe);
  document.getElementById("restdet-body").innerHTML = restRecipePrintMarkup;
  const photoBtn = document.getElementById("restdet-photo-btn");
  if (photoBtn) {
    if (recipe.hasPhoto || recipe.foto) {
      photoBtn.style.display = "";
      photoBtn.onclick = () => viewRestPhoto(id, col);
    } else {
      photoBtn.style.display = "none";
    }
  }
  document.getElementById("restdet").classList.add("open");
  updateOverlayState();
}

function closeRestRecipe() {
  document.getElementById("restdet").classList.remove("open");
  activeRestRecipeId = null;
  restRecipeEmpId = null;
  restRecipeCol = "";
  updateOverlayState();
}

async function viewRestPhoto(id, col) {
  const colKey = `${col}_recetas`;
  const recipe = (D[colKey] || []).find((r) => r._i === id);
  if (!recipe) return;

  // Get foto: in-memory → IndexedDB → Firestore _fotos
  let foto = recipe.foto;
  if (!foto) foto = await _getPhoto(col, id);
  if (!foto) {
    // Last resort: fetch single doc from Firestore
    try {
      const snap = await db.collection(`${col}_recetas_fotos`).where("_i", "==", id).limit(1).get();
      if (!snap.empty) { foto = snap.docs[0].data().foto; recipe.foto = foto; _setPhoto(col, id, foto); }
    } catch (e) { console.warn("Error fetching photo", e); }
  }
  if (!foto) return;

  const overlay = document.createElement("div");
  overlay.id = "photo-lightbox";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;padding:20px";
  overlay.innerHTML = `
    <button onclick="document.getElementById('photo-lightbox').remove()" style="position:absolute;top:18px;right:22px;background:none;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1">✕</button>
    <img src="${foto}" alt="${safeText(recipe.nombre)}" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.6)">
    <p style="color:#ccc;margin-top:14px;font-size:15px;letter-spacing:.5px">${safeText(recipe.nombre)}</p>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function printRestFicha() {
  if (!activeRestRecipeId || !restRecipeCol) return;
  const recipe = (D[`${restRecipeCol}_recetas`] || []).find((r) => r._i === activeRestRecipeId);
  if (!recipe) return;
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${safeText(recipe.nombre)}</title>
    <style>
      @page{size:A4;margin:14mm 12mm 14mm 12mm}
      body{font-family:Arial,sans-serif;padding:0;margin:0;line-height:1.32;color:#111;font-size:11px}
      h1{font-size:22px;line-height:1.1;margin:0 0 10px}
      h4{font-size:10px;text-transform:uppercase;letter-spacing:.12em;border-bottom:1px solid #ddd;padding-bottom:5px;margin:14px 0 8px}
      p{margin:0 0 8px}
      .notice{padding:10px 12px;border-left:4px solid #5f7f4c;background:#eef3ea;font-size:10.5px}
      .ig{display:grid;grid-template-columns:minmax(0,1.6fr) auto auto;gap:5px 10px;align-items:baseline;font-size:10.5px}
      .ih{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#726b61}
      .sl{list-style:none;padding:0;margin:0}
      .sl li{display:flex;gap:8px;margin-bottom:6px;padding:8px 9px;background:#f6f4ee;font-size:10.5px}
      .sn{font-weight:700;color:#405735;min-width:14px}
      .rs{margin-bottom:12px}
      .ca{display:flex;gap:6px;flex-wrap:wrap}
      .badge{border:1px solid #b84337;color:#b84337;padding:2px 7px;border-radius:4px;font-size:10px}
    </style>
  </head>
  <body>
    <h1>${safeText(recipe.nombre)}</h1>
    ${restRecipePrintMarkup}
  </body>
  </html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
}

// ─────────────────────────────────────────────────────────────────────────────

function toggleRestMenuEstado(empId, itemId) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  const col = `${REST_COL_MAP[e.theme] || e.theme}_menus`;
  const item = (D[col] || []).find((x) => x.id === itemId);
  if (!item) return;
  item.estado = item.estado === "activo" ? "retirado" : "activo";
  save(col);
  rEmpresaDetalle(empId, "menu");
}

function setRestIdeaEstado(empId, itemId, estado, colPrefix) {
  const col = `${colPrefix}_ideas`;
  const item = (D[col] || []).find((x) => x.id === itemId);
  if (!item) return;
  item.estado = estado;
  save(col);
}

function oRestKpiM(empId) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  const col = REST_COL_MAP[e.theme] || e.theme;
  oModal(`
    <h2>Registrar KPI — ${safeText(e.nombre)}</h2>
    <label>Covers (comensales)</label>
    <input class="field-input" id="kpi-covers" type="number" placeholder="45">
    <label>Ticket medio (€)</label>
    <input class="field-input" id="kpi-ticket" type="number" step="0.1" placeholder="38.5">
    <label>Valoración media (1-5)</label>
    <input class="field-input" id="kpi-nota" type="number" step="0.1" min="1" max="5" placeholder="4.8">
    <label>Fecha</label>
    <input class="field-input" id="kpi-fecha" type="date" value="${today()}">
    <div class="form-actions">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sRestKpi(${empId},'${col}')">Guardar</button>
    </div>`);
}

function sRestKpi(empId, col) {
  const covers = parseFloat(document.getElementById("kpi-covers")?.value) || null;
  const ticket = parseFloat(document.getElementById("kpi-ticket")?.value) || null;
  const nota = parseFloat(document.getElementById("kpi-nota")?.value) || null;
  const fecha = document.getElementById("kpi-fecha")?.value || today();
  if (!covers && !ticket && !nota) { alert("Rellena al menos un campo."); return; }
  const colKey = `${col}_kpis`;
  const list = D[colKey] || [];
  const id = list.length ? Math.max(...list.map((x) => x.id || 0)) + 1 : 1;
  list.push({ id, covers, ticket, nota, fecha, autor: "Dirección" });
  D[colKey] = list;
  save(colKey);
  cModal();
  rEmpresaDetalle(empId, "kpis");
}

function setEstadoEmpresa(id, estado) {
  const e = (D.empresas || []).find((x) => x.id === id);
  if (!e) return;
  e.estado = estado;
  save("empresas");
  // update badge in-place
  const badge = document.querySelector(`.emp-estado.emp-estado-lg`);
  if (badge) {
    Object.values(ESTADO_LABELS).forEach((v) => badge.classList.remove(v.cls));
    const est = ESTADO_LABELS[estado] || ESTADO_LABELS.abierto;
    badge.classList.add(est.cls);
    badge.textContent = est.label;
  }
}

// ─── GOOGLE REVIEWS AUTO-SYNC ────────────────────────────────────────────────

const GG_KEY_LS = "gg_places_key";

function getGGKey() { return localStorage.getItem(GG_KEY_LS) || ""; }
function setGGKey(k) { if (k) localStorage.setItem(GG_KEY_LS, k); else localStorage.removeItem(GG_KEY_LS); }

function pGGKey() {
  oModal(`
    <h3>Conectar Google Reviews</h3>
    <div class="setup-steps">
      <div class="setup-step"><span class="step-num">1</span>Ve a <a class="setup-link" href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" target="_blank">Google Cloud Console →</a> y activa <strong>Places API (New)</strong></div>
      <div class="setup-step"><span class="step-num">2</span>En <strong>Credenciales</strong> crea una clave de API y restringe su uso a tu dominio <code class="ia-code">intranet.obarestaurante.es</code></div>
      <div class="setup-step"><span class="step-num">3</span>Pega la clave aquí — se guarda solo en este dispositivo</div>
    </div>
    <div class="fr" style="margin-top:16px"><label>API Key de Google</label>
      <input id="gg-key-input" type="password" placeholder="AIzaSy…" value="${safeText(getGGKey())}">
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="saveGGKey()">Guardar clave</button>
    </div>`);
}

function saveGGKey() {
  const k = document.getElementById("gg-key-input")?.value.trim();
  if (!k) { alert("Pega tu clave de API."); return; }
  setGGKey(k);
  cModal();
  // update key buttons
  document.querySelectorAll(".gg-key-btn").forEach((btn) => btn.textContent = "API configurada ✓");
}

function oSetPlaceId(empId) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  oModal(`
    <h3>Google Place ID — ${safeText(e.nombre)}</h3>
    <p style="color:var(--muted);font-size:13px;margin-bottom:16px">El Place ID identifica a tu restaurante en Google Maps. Es único por local.</p>
    <div class="setup-steps">
      <div class="setup-step"><span class="step-num">1</span>Busca <strong>"${safeText(e.googleSearch)}"</strong> en <a class="setup-link" href="https://maps.google.com/?q=${encodeURIComponent(e.googleSearch)}" target="_blank">Google Maps →</a></div>
      <div class="setup-step"><span class="step-num">2</span>Haz clic en el restaurante → toca <strong>Compartir</strong> → copia el enlace</div>
      <div class="setup-step"><span class="step-num">3</span>O usa <a class="setup-link" href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank">Place ID Finder →</a> para encontrarlo directamente</div>
    </div>
    <div class="fr" style="margin-top:16px"><label>Place ID</label>
      <input id="place-id-input" placeholder="ChIJ…" value="${safeText(e.googlePlaceId || "")}">
    </div>
    <div class="mf">
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="savePlaceId(${empId})">Guardar</button>
    </div>`);
}

function savePlaceId(empId) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  const pid = document.getElementById("place-id-input")?.value.trim();
  e.googlePlaceId = pid || "";
  save("empresas");
  cModal();
  rEmpresaDetalle(empId, "resumen");
}

async function syncGoogleReviews(empId) {
  const e = (D.empresas || []).find((x) => x.id === empId);
  if (!e) return;
  const apiKey = getGGKey();
  if (!apiKey) { pGGKey(); return; }
  if (!e.googlePlaceId) { oSetPlaceId(empId); return; }

  const btn = document.getElementById(`gg-sync-btn-${empId}`);
  const status = document.getElementById(`gg-sync-status-${empId}`);
  if (btn) { btn.disabled = true; btn.textContent = "Sincronizando…"; }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(e.googlePlaceId)}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,displayName"
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Error ${res.status}`);
    }
    const data = await res.json();
    const nota = data.rating ? Math.round(data.rating * 10) / 10 : null;
    const total = data.userRatingCount || null;
    if (!nota) throw new Error("Sin datos de valoración");

    // Save as KPI entry
    const col = `${REST_COL_MAP[e.theme] || e.theme}_kpis`;
    const list = D[col] || [];
    // Remove previous auto entries from today to avoid duplicates
    const todayStr = today();
    const filtered = list.filter((k) => !(k.autor === "Google Reviews (auto)" && k.fecha === todayStr));
    const newId = (list.length ? Math.max(...list.map((k) => k.id || 0)) : 0) + 1;
    filtered.push({ id: newId, nota, total_resenas: total, covers: null, ticket: null, fecha: todayStr, autor: "Google Reviews (auto)" });
    D[col] = filtered;
    save(col);

    if (status) status.innerHTML = `<span style="color:var(--green)">⭐ ${nota} · ${total ? total + " reseñas" : ""} · Actualizado ahora</span>`;
    if (btn) { btn.disabled = false; btn.innerHTML = `${ico('arrows-clockwise', 13)} Actualizar`; }
    // refresh resumen stats
    const statsEl = document.getElementById(`emp-gg-rating-${empId}`);
    if (statsEl) statsEl.innerHTML = `<strong style="font-size:22px">⭐ ${nota}</strong><span class="nd" style="margin-left:8px">${total || ""} reseñas</span>`;
  } catch (err) {
    if (status) status.innerHTML = `<span style="color:var(--red)">Error: ${safeText(err.message)}</span>`;
    if (btn) { btn.disabled = false; btn.innerHTML = `${ico('arrows-clockwise', 13)} Reintentar`; }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function saveNotaDia(id) {
  const e = (D.empresas || []).find((x) => x.id === id);
  if (!e) return;
  e.notaDia = document.getElementById(`nota-dia-${id}`)?.value.trim() || "";
  save("empresas");
  const btn = event.currentTarget;
  btn.textContent = "✓ Guardado";
  setTimeout(() => { btn.textContent = "Guardar nota"; }, 1500);
}

function registerPWA() {
  const isLocalPreview = ["127.0.0.1", "localhost"].includes(location.hostname);

  // Unregister any stale SW on local dev only
  if (isLocalPreview && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    return;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            sw.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    }).catch((error) => console.warn("SW error:", error));
    // Reload page when a new SW takes control so users always get fresh assets
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
    // Also listen for explicit SW_UPDATED message
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") window.location.reload();
    });
  }

  const installCard = document.getElementById("install-card");
  const isInstallBannerDismissed = () => localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1";
  const hideInstallCardOnly = () => {
    if (!installCard) return;
    installCard.hidden = true;
    installCard.style.display = "none";
  };
  const hideInstallEverywhere = () => {
    hideInstallCardOnly();
  };
  const showInstall = () => {
    if (isStandaloneMode() || !supportsManualInstallHint()) {
      hideInstallEverywhere();
      return;
    }
    if (installCard) {
      installCard.hidden = isInstallBannerDismissed();
      installCard.style.display = isInstallBannerDismissed() ? "none" : "";
    }
  };

  if (isStandaloneMode()) {
    hideInstallEverywhere();
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
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    hideInstallEverywhere();
  });
}

function dismissInstallHint(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
  const installCard = document.getElementById("install-card");
  if (installCard) {
    installCard.hidden = true;
    installCard.style.display = "none";
  }
}

async function installApp() {
  if (isStandaloneMode()) {
    const installCard = document.getElementById("install-card");
    if (installCard) {
      installCard.hidden = true;
      installCard.style.display = "none";
    }
    return;
  }
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    const installCard = document.getElementById("install-card");
    if (installCard) {
      installCard.hidden = true;
      installCard.style.display = "none";
    }
    return;
  }
  oModal(`
    ${installHelpMarkup()}
    <div class="mf">
      <button class="primary-btn" onclick="cModal()">Entendido</button>
    </div>`);
}

function setupMobileNavToggle() {
  const nav = document.querySelector(".main-nav");
  const toggle = document.getElementById("mobile-nav-toggle");
  if (!nav || !toggle) return;
  const media = window.matchMedia("(max-width: 720px)");

  window.applyMobileNavState = () => {
    if (!media.matches) {
      nav.classList.remove("nav-hidden");
      toggle.hidden = true;
      toggle.setAttribute("aria-expanded", "true");
      return;
    }
    toggle.hidden = true; // hamburger takes over on mobile
  };

  window.addEventListener("resize", window.applyMobileNavState);
  window.applyMobileNavState();
}

let _pedToolbarHidden = false; // true cuando el toolbar ha salido del viewport

function updatePedFloatBar() {
  const floatBar = document.getElementById("ped-float-bar");
  if (!floatBar) return;
  const pedidosActive = document.getElementById("panel-pedidos")?.classList.contains("active");
  const hasItems = D.ingredientes.some((item) => String(item.cant || "").trim());
  floatBar.classList.toggle("visible", !!pedidosActive && hasItems && _pedToolbarHidden && pedT === "lista");
}

function setupPedFloatBar() {
  const toolbar = document.getElementById("ped-action-toolbar");
  const floatBar = document.getElementById("ped-float-bar");
  if (!toolbar || !floatBar) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      _pedToolbarHidden = !entry.isIntersecting;
      updatePedFloatBar();
    },
    { threshold: 0, rootMargin: "0px" }
  );
  obs.observe(toolbar);
}

function setupHamburgerMenu() {
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("hamburger-menu");
  const overlay = document.getElementById("hamburger-overlay");
  if (!btn || !menu || !overlay) return;

  window.toggleHamburger = () => {
    const isOpen = menu.classList.contains("open");
    if (isOpen) { closeHamburger(); } else { openHamburger(); }
  };

  window.openHamburger = () => {
    menu.classList.add("open");
    overlay.classList.add("open");
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  window.closeHamburger = () => {
    menu.classList.remove("open");
    overlay.classList.remove("open");
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") cModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTopOverlay();
  });
  const installCardClose = document.getElementById("install-card-close");
  if (installCardClose) {
    installCardClose.onclick = dismissInstallHint;
  }
  setupMobileNavToggle();
  setupHamburgerMenu();
  setupPedFloatBar();
  registerPWA();
  initIA();
  initFacturas();
  initData().catch((error) => showError(error.message));
});

/* ═══════════════════════════════════════════════════════
   ESCÁNER DE FACTURAS
   ═══════════════════════════════════════════════════════ */

// Secreto compartido con la Cloud Function.
// Debe coincidir con el valor de firebase functions:secrets:set INTRANET_SECRET
const INVOICE_SECRET = "oba-facturas-2025";
const FCT_COL = "facturas";
const PRECIOS_COL = "precios";
const IMGS_COL = "factura_imgs";
const FCT_URL_KEY = "fct_url_v1";

let fctFiles = [];       // array de { file, dataUrl } — páginas de la factura actual
let fctExtracted = null;
let fctInvoices = [];
let fctImageDataUrl = null; // kept for compat
let fctQueue = [];      // [{file, name, status:'pending'|'done'|'error'}] — cola de facturas distintas
let fctQueueIdx = -1;   // -1 = modo normal (no lote)
// fctPriceIndex: Map normalizedName → [{proveedor,fecha,precio_unitario,precio_total,cantidad,unidad,rawName}] (newest first)
let fctPriceIndex = {};

/* ── Tab switching ── */
function fctTab(name, btn) {
  ["escanear","precios","proveedores"].forEach(t => {
    const el = document.getElementById("fct-tab-" + t);
    if (el) el.style.display = t === name ? "" : "none";
  });
  document.querySelectorAll(".fct-tab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (name === "precios") fctRenderPrecios();
  if (name === "proveedores") fctRenderProveedores();
}

/* ── Price index helpers ── */
function fctNorm(s) {
  return (s || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function fctBuildPriceIndex() {
  fctPriceIndex = {};
  const sorted = [...fctInvoices].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  sorted.forEach(inv => {
    (inv.lineas || []).forEach(l => {
      if (!l.producto) return;
      const entry = {
        proveedor: inv.proveedor || "—",
        fecha: inv.fecha || null,
        precio_unitario: l.precio_unitario ?? null,
        precio_total: l.precio_total ?? null,
        cantidad: l.cantidad ?? null,
        unidad: l.unidad || null,
        rawName: l.alias || l.producto,
        alias: l.alias || null,
      };
      // Index by product name
      const key = fctNorm(l.producto);
      if (key) {
        if (!fctPriceIndex[key]) fctPriceIndex[key] = [];
        fctPriceIndex[key].push(entry);
      }
      // Also index by alias so pedidos matching finds it by kitchen name
      if (l.alias) {
        const aliasKey = fctNorm(l.alias);
        if (aliasKey && aliasKey !== key) {
          if (!fctPriceIndex[aliasKey]) fctPriceIndex[aliasKey] = [];
          fctPriceIndex[aliasKey].push(entry);
        }
      }
    });
  });
}

function fctMatchKey(name) {
  const norm = fctNorm(name);
  if (!norm) return null;
  if (fctPriceIndex[norm]) return norm;
  const words = norm.split(" ").filter(w => w.length > 2);
  let best = null, bestScore = 0;
  Object.keys(fctPriceIndex).forEach(key => {
    const keyWords = key.split(" ").filter(w => w.length > 2);
    const common = words.filter(w => keyWords.some(kw => kw.includes(w) || w.includes(kw))).length;
    const score = common / Math.max(words.length, keyWords.length, 1);
    if (score > bestScore && score >= 0.5) { best = key; bestScore = score; }
  });
  return best;
}

function fctPriceBadge(name) {
  const key = fctMatchKey(name);
  if (!key) return "";
  const entries = fctPriceIndex[key];
  if (!entries || !entries.length) return "";
  const last = entries[0];
  const price = last.precio_unitario ?? last.precio_total;
  if (price == null) return "";
  let trend = "→", tClass = "neutral";
  if (entries.length >= 2) {
    const prev = entries[1].precio_unitario ?? entries[1].precio_total;
    if (prev != null) {
      if (price > prev) { trend = "↑"; tClass = "up"; }
      else if (price < prev) { trend = "↓"; tClass = "down"; }
    }
  }
  const label = last.precio_unitario != null
    ? `${price.toFixed(2)} €/${last.unidad || "ud"}`
    : `${price.toFixed(2)} € total`;
  return `<span class="price-badge price-badge-${tClass}" title="${escHtml(last.proveedor)} · ${last.fecha || "—"}">${trend} ${escHtml(label)}</span>`;
}

const FCT_DEFAULT_URL = "https://oba-invoice-scanner.obarestaurante.workers.dev";

function initFacturas() {
  if (!localStorage.getItem(FCT_URL_KEY)) {
    localStorage.setItem(FCT_URL_KEY, FCT_DEFAULT_URL);
  }
}

/* ── Drag & drop helpers ── */
function fctDragOver(e) {
  e.preventDefault();
  document.getElementById("fct-drop").classList.add("drag-over");
}
function fctDragLeave() {
  document.getElementById("fct-drop").classList.remove("drag-over");
}
function fctDrop(e) {
  e.preventDefault();
  document.getElementById("fct-drop").classList.remove("drag-over");
  const files = [...(e.dataTransfer?.files || [])];
  if (files.length) fctAddFiles(files);
}
function fctFileChosen(e) {
  const files = [...(e.target.files || [])];
  e.target.value = "";
  if (files.length) fctAddFiles(files);
}

function fctAddFiles(files) {
  const valid = files.filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
  if (!valid.length) { showToast("Formato no compatible. Usa JPG, PNG, HEIC o PDF.", "error"); return; }

  // Múltiples archivos distintos → modo lote (cada archivo = una factura)
  if (valid.length > 1 && fctQueueIdx === -1) {
    fctInitBatch(valid);
    return;
  }

  // Modo normal: añadir como páginas de la factura actual
  let loaded = 0;
  valid.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      fctFiles.push({ file, dataUrl: e.target.result });
      loaded++;
      if (loaded === valid.length) {
        fctExtracted = null;
        document.getElementById("fct-drop").style.display = "none";
        document.getElementById("fct-preview-area").style.display = "";
        document.getElementById("fct-result").style.display = "none";
        fctRenderThumbs();
        const n = fctFiles.length;
        document.getElementById("fct-scan-status").textContent =
          n === 1 ? "1 página lista para escanear" : `${n} páginas listas para escanear`;
      }
    };
    reader.readAsDataURL(file);
  });
}

function fctInitBatch(files) {
  fctQueue = files.map(f => ({ file: f, name: f.name.replace(/\.[^.]+$/, ""), status: "pending" }));
  fctQueueIdx = 0;
  document.getElementById("fct-drop").style.display = "none";
  document.getElementById("fct-preview-area").style.display = "";
  document.getElementById("fct-result").style.display = "none";
  fctRenderBatchBar();
  fctLoadBatchItem(0);
}

function fctLoadBatchItem(idx) {
  const item = fctQueue[idx];
  if (!item) return;
  fctFiles = [];
  fctExtracted = null;
  document.getElementById("fct-result").style.display = "none";
  const reader = new FileReader();
  reader.onload = e => {
    fctFiles = [{ file: item.file, dataUrl: e.target.result }];
    fctRenderThumbs();
    fctRenderBatchBar();
    document.getElementById("fct-scan-status").textContent =
      `Factura ${idx + 1} de ${fctQueue.length} — lista para escanear`;
    const btn = document.getElementById("fct-save-btn");
    if (btn) btn.innerHTML = idx < fctQueue.length - 1
      ? '<i class="ph-fill ph-floppy-disk"></i> Guardar y siguiente'
      : '<i class="ph-fill ph-floppy-disk"></i> Guardar factura';
  };
  reader.readAsDataURL(item.file);
}

function fctRenderBatchBar() {
  const bar = document.getElementById("fct-batch-bar");
  if (!bar) return;
  if (fctQueue.length < 2) { bar.style.display = "none"; return; }
  bar.style.display = "";
  const done = fctQueue.filter(q => q.status === "done").length;
  const chips = fctQueue.map((item, i) => {
    const s = item.status;
    const cls = s === "done" ? "fct-q-done" : s === "error" ? "fct-q-err" : i === fctQueueIdx ? "fct-q-cur" : "";
    const icon = s === "done" ? "✓" : s === "error" ? "✕" : i === fctQueueIdx ? "▶" : `${i + 1}`;
    const label = item.name.length > 18 ? item.name.slice(0, 18) + "…" : item.name;
    return `<span class="fct-q-chip ${cls}" title="${escHtml(item.name)}">${icon} ${escHtml(label)}</span>`;
  }).join("");
  bar.innerHTML = `<div class="fct-batch-meta"><i class="ph-fill ph-stack"></i> Lote — <b>${done}</b> de <b>${fctQueue.length}</b> guardadas</div><div class="fct-batch-chips">${chips}</div>`;
}

function fctAdvanceBatch(warning) {
  if (fctQueueIdx < 0) return;
  fctQueue[fctQueueIdx].status = "done";
  const next = fctQueueIdx + 1;
  const prefix = warning ? `${warning} · ` : "";
  if (next < fctQueue.length) {
    fctQueueIdx = next;
    fctLoadBatchItem(next);
    showToast(`${prefix}Guardada ✓ — Cargando factura ${next + 1} de ${fctQueue.length}…`, warning ? "warn" : undefined);
  } else {
    const total = fctQueue.length;
    fctQueue = []; fctQueueIdx = -1;
    fctReset();
    showToast(`${prefix}Lote completo — ${total} facturas guardadas ✓`, warning ? "warn" : undefined);
  }
}

function fctRenderThumbs() {
  const strip = document.getElementById("fct-thumb-strip");
  if (!strip) return;
  strip.innerHTML = fctFiles.map((f, i) => {
    const isPdf = f.file.type === "application/pdf";
    const thumb = isPdf
      ? `<div class="fct-thumb-img fct-thumb-pdf"><i class="ph-fill ph-file-pdf" style="font-size:28px"></i><span style="font-size:10px;margin-top:2px">PDF</span></div>`
      : `<img src="${f.dataUrl}" class="fct-thumb-img" alt="Página ${i+1}">`;
    return `<div class="fct-thumb">${thumb}<span class="fct-thumb-label">${isPdf ? f.file.name.replace(/\.pdf$/i,"").slice(0,14) : `Pág. ${i+1}`}</span><button class="fct-thumb-del" onclick="fctRemovePage(${i})" title="Quitar">✕</button></div>`;
  }).join("");
}

function fctRemovePage(idx) {
  fctFiles.splice(idx, 1);
  if (!fctFiles.length) {
    if (fctQueueIdx >= 0) {
      // Mid-batch: omitir esta factura y avanzar a la siguiente
      fctQueue[fctQueueIdx].status = "error";
      const next = fctQueueIdx + 1;
      if (next < fctQueue.length) {
        fctQueueIdx = next;
        fctLoadBatchItem(next);
        showToast("Factura omitida — cargando la siguiente…", "warn");
      } else {
        const total = fctQueue.length;
        fctQueue = []; fctQueueIdx = -1;
        fctReset();
        showToast(`Lote finalizado — última factura omitida`, "warn");
      }
    } else {
      fctReset();
    }
    return;
  }
  fctRenderThumbs();
  const n = fctFiles.length;
  document.getElementById("fct-scan-status").textContent =
    n === 1 ? "1 página lista para escanear" : `${n} páginas listas para escanear`;
}

function fctReset() {
  fctFiles = [];
  fctExtracted = null;
  fctImageDataUrl = null;
  document.getElementById("fct-drop").style.display = "";
  document.getElementById("fct-preview-area").style.display = "none";
  document.getElementById("fct-result").style.display = "none";
  document.getElementById("fct-file").value = "";
  const strip = document.getElementById("fct-thumb-strip");
  if (strip) strip.innerHTML = "";
  const bar = document.getElementById("fct-batch-bar");
  if (bar) bar.style.display = "none";
}

// Cancela todo: limpia el lote y el formulario actual
function fctCancelAll() {
  fctQueue = [];
  fctQueueIdx = -1;
  fctReset();
}

/* ── Escanear con IA ── */
async function fctScan() {
  const url = localStorage.getItem(FCT_URL_KEY) || FCT_DEFAULT_URL;
  if (!fctFiles.length) return;

  const btn = document.getElementById("fct-scan-btn");
  const status = document.getElementById("fct-scan-status");
  btn.disabled = true;
  const n = fctFiles.length;
  btn.innerHTML = '<span class="fct-spinner"></span> Analizando…';
  status.textContent = fctQueueIdx >= 0
    ? `Analizando factura ${fctQueueIdx + 1} de ${fctQueue.length}…`
    : (n === 1 ? "Claude está leyendo la factura…" : `Claude está leyendo ${n} páginas…`);

  try {
    // Build images array from all pages
    const images = await Promise.all(fctFiles.map(async f => ({
      base64: (await fctToBase64(f.file)),
      mediaType: f.file.type || "image/jpeg",
    })));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${INVOICE_SECRET}`,
      },
      body: JSON.stringify({ images }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    fctExtracted = await res.json();
    fctPopulateForm(fctExtracted);
    document.getElementById("fct-result").style.display = "";
    status.textContent = fctQueueIdx >= 0
      ? `Factura ${fctQueueIdx + 1}/${fctQueue.length} — revisa y guarda`
      : "Datos extraídos — revísalos antes de guardar.";
    if (fctQueueIdx >= 0) fctRenderBatchBar();
    localStorage.setItem(FCT_URL_KEY, url);

  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    showToast("No se pudo escanear la factura. Revisa la URL y vuelve a intentarlo.", "error");
    console.error("fctScan:", err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph-fill ph-sparkle"></i> Escanear con IA';
  }
}

/* Strip HTTP response headers that some suppliers (e.g. Hendi) accidentally prepend to PDFs.
   A valid PDF must start with %PDF-; anything before that is junk. */
async function fctCleanPdf(file) {
  if (file.type !== "application/pdf") return file;
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Find %PDF signature (0x25 0x50 0x44 0x46)
  let offset = 0;
  for (let i = 0; i < Math.min(bytes.length - 4, 4096); i++) {
    if (bytes[i] === 0x25 && bytes[i+1] === 0x50 && bytes[i+2] === 0x44 && bytes[i+3] === 0x46) {
      offset = i;
      break;
    }
  }
  if (offset === 0) return file; // already clean
  console.info(`fctCleanPdf: stripped ${offset} bytes of junk header from "${file.name}"`);
  return new File([bytes.slice(offset)], file.name, { type: "application/pdf" });
}

async function fctToBase64(file) {
  const cleanFile = file.type === "application/pdf" ? await fctCleanPdf(file) : file;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // DataURL format: "data:image/jpeg;base64,XXXX" — queremos solo XXXX
      const result = reader.result;
      const b64 = result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(cleanFile);
  });
}

/* ── Rellenar formulario editable ── */
function fctPopulateForm(data) {
  document.getElementById("fe-proveedor").value = data.proveedor || "";
  document.getElementById("fe-fecha").value = data.fecha || "";
  document.getElementById("fe-numero").value = data.numero_factura || "";
  document.getElementById("fe-base").value = data.base_imponible ?? "";
  document.getElementById("fe-iva-pct").value = data.iva_pct ?? "";
  document.getElementById("fe-iva").value = data.iva_total ?? "";
  document.getElementById("fe-total").value = data.total_factura ?? "";
  fctRenderLines(data.lineas || []);
}

function fctPriceAnomaly(l) {
  if (l.precio_unitario == null) return null;
  const key = fctMatchKey(l.alias || l.producto || "");
  if (!key) return null;
  const hist = fctPriceIndex[key]?.filter(e => e.precio_unitario != null);
  if (!hist?.length) return null;
  const avg = hist.slice(0, 5).reduce((s, e) => s + e.precio_unitario, 0) / Math.min(hist.length, 5);
  const ratio = l.precio_unitario / avg;
  if (ratio > 2) return `⚠️ Precio ${l.precio_unitario.toFixed(2)} €, histórico ~${avg.toFixed(2)} €. ¿Es precio/ud o total de línea?`;
  if (ratio < 0.4) return `⚠️ Precio muy bajo vs histórico ~${avg.toFixed(2)} €. Revisa.`;
  return null;
}

function fctRenderLines(lines) {
  const tbody = document.getElementById("fct-lines-body");
  tbody.innerHTML = lines.map((l, i) => {
    const warn = fctPriceAnomaly(l);
    return `
    <tr id="fct-line-${i}"${warn ? ' class="fct-line-warn"' : ''}>
      <td>
        <input value="${escHtml(l.producto || "")}" placeholder="Producto" oninput="fctLineChange(${i},'producto',this.value)">
        <input value="${escHtml(l.alias || "")}" placeholder="Nombre en cocina (opcional)" class="fct-alias-input" oninput="fctLineChange(${i},'alias',this.value)">
        ${warn ? `<div class="fct-line-warn-msg">${warn}</div>` : ""}
      </td>
      <td><input type="number" step="0.001" value="${l.cantidad ?? ""}" placeholder="—" style="width:72px" oninput="fctLineChange(${i},'cantidad',this.value)"></td>
      <td><input value="${escHtml(l.unidad || "")}" placeholder="kg" style="width:52px" oninput="fctLineChange(${i},'unidad',this.value)"></td>
      <td><input type="number" step="0.001" value="${l.precio_unitario ?? ""}" placeholder="—" style="width:80px" oninput="fctLineChange(${i},'precio_unitario',this.value)"></td>
      <td><input type="number" step="0.01" value="${l.precio_total ?? ""}" placeholder="—" style="width:80px" oninput="fctLineChange(${i},'precio_total',this.value)"></td>
      <td class="fct-td-del"><button onclick="fctDeleteLine(${i})" title="Eliminar línea">×</button></td>
    </tr>`;
  }).join("");
}

function fctLineChange(idx, field, value) {
  if (!fctExtracted) return;
  if (!fctExtracted.lineas[idx]) return;
  fctExtracted.lineas[idx][field] = (field === "producto" || field === "unidad" || field === "alias") ? value : (value === "" ? null : Number(value));
}

function fctDeleteLine(idx) {
  if (!fctExtracted) return;
  fctExtracted.lineas.splice(idx, 1);
  fctRenderLines(fctExtracted.lineas);
}

function fctAddLine() {
  if (!fctExtracted) fctExtracted = { proveedor: null, fecha: null, numero_factura: null, lineas: [], total_factura: null };
  fctExtracted.lineas.push({ producto: "", cantidad: null, unidad: null, precio_unitario: null, precio_total: null });
  fctRenderLines(fctExtracted.lineas);
}

/* ── Guardar en Firestore ── */
/* Comprime la imagen a max 1200px JPEG 65% para guardar en Firestore (~150-300KB) */
function fctCompressImage(file) {
  if (file.type === "application/pdf") {
    return fctCleanPdf(file).then(cleanFile => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(cleanFile);
    }));
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        // Convert to grayscale to reduce size
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const g = Math.round(0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]);
          d[i] = d[i+1] = d[i+2] = g;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function fctSave() {
  const provEl = document.getElementById("fe-proveedor");
  const saveBtn = document.getElementById("fct-save-btn");

  const data = {
    proveedor: provEl.value.trim() || null,
    fecha: document.getElementById("fe-fecha").value || null,
    numero_factura: document.getElementById("fe-numero").value.trim() || null,
    base_imponible: parseFloat(document.getElementById("fe-base").value) || null,
    iva_pct: parseInt(document.getElementById("fe-iva-pct").value) || null,
    iva_total: parseFloat(document.getElementById("fe-iva").value) || null,
    total_factura: parseFloat(document.getElementById("fe-total").value) || null,
    lineas: fctExtracted?.lineas || [],
    guardadoEn: new Date().toISOString(),
    id: "f_" + Date.now(),
  };

  // Validación visible
  if (!data.proveedor) {
    provEl.classList.add("fct-input-error");
    provEl.addEventListener("input", () => provEl.classList.remove("fct-input-error"), { once: true });
    showToast("Escribe el nombre del proveedor antes de guardar.", "warn");
    provEl.focus();
    return;
  }

  // Botón en estado de carga
  const btnOriginal = saveBtn?.innerHTML || "";
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<span class="fct-spinner"></span> Guardando…'; }

  // Comprimir / leer imágenes
  // PDFs: se leen tal cual (dataURL completo). Imágenes: se comprimen en escala de grises.
  let compressed = [];
  if (fctFiles.length) {
    try {
      compressed = (await Promise.all(fctFiles.map(f => fctCompressImage(f.file)))).filter(Boolean);
    } catch(e) { console.warn("fctSave compress:", e); }
  }

  // Límite Firestore: 1 MB por documento. Base64 ~1.33× el tamaño real.
  // Guardamos imágenes solo si caben (PDFs escaneados pueden ser muy grandes).
  const FIRESTORE_IMG_LIMIT = 900_000; // ~680 KB real — margen de seguridad
  const saveableImgs = compressed.filter(b64 => b64.length <= FIRESTORE_IMG_LIMIT);
  const imgTooBig = compressed.length > 0 && saveableImgs.length === 0;

  if (saveableImgs.length) {
    data.imagenesBase64 = saveableImgs;
    if (saveableImgs.length === 1) data.imagenBase64 = saveableImgs[0];
  }

  // ── Firestore: guardar en bloques independientes para que un fallo no bloquee los demás ──
  if (storageMode === "firebase" && db) {

    // 1. Documento principal (sin imágenes — siempre ligero)
    try {
      const { imagenesBase64, imagenBase64, ...dataFirestore } = data;
      if (saveableImgs.length) dataFirestore.numPaginas = saveableImgs.length;
      await db.collection(FCT_COL).doc(data.id).set({ ...dataFirestore, _i: Date.now() });
    } catch(e) {
      console.warn("Firestore FCT_COL:", e);
      showToast("Error al guardar en la nube: " + e.message, "error");
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = btnOriginal; }
      return; // sin el doc principal no tiene sentido continuar
    }

    // 2. Imágenes (bloque independiente — fallo aquí no borra la factura)
    if (saveableImgs.length) {
      try {
        const imgBatch = db.batch();
        saveableImgs.forEach((b64, i) => {
          imgBatch.set(db.collection(IMGS_COL).doc(`${data.id}_${i}`),
            { facturaId: data.id, pagina: i, base64: b64, _i: Date.now() });
        });
        await imgBatch.commit();
        data.numPaginas = saveableImgs.length;
      } catch(e) {
        console.warn("Firestore IMGS_COL:", e);
        // No bloqueamos — la factura ya está guardada, solo falta la imagen
      }
    }

    // 3. Precios (bloque independiente — siempre se intenta)
    try {
      const pBatch = db.batch();
      (data.lineas || []).forEach((l, i) => {
        if (!l.producto || (l.precio_unitario == null && l.precio_total == null)) return;
        pBatch.set(db.collection(PRECIOS_COL).doc(`${data.id}_${i}`), {
          producto: l.producto, alias: l.alias || null,
          proveedor: data.proveedor, fecha: data.fecha,
          precio_unitario: l.precio_unitario ?? null,
          precio_total: l.precio_total ?? null,
          cantidad: l.cantidad ?? null, unidad: l.unidad || null,
          facturaId: data.id, _i: Date.now(),
        });
      });
      await pBatch.commit();
    } catch(e) { console.warn("Firestore PRECIOS_COL:", e); }
  }

  // ── localStorage: guardar siempre, pero sin imágenes grandes para no reventar la cuota ──
  const LOCAL_IMG_LIMIT = 400_000; // ~300 KB real
  const dataLocal = { ...data };
  const localImgTooBig = dataLocal.imagenesBase64?.some(b => b.length > LOCAL_IMG_LIMIT)
    || dataLocal.imagenBase64?.length > LOCAL_IMG_LIMIT;
  if (localImgTooBig) { delete dataLocal.imagenesBase64; delete dataLocal.imagenBase64; }

  fctInvoices.unshift(dataLocal);
  fctPersistLocal();
  fctBuildPriceIndex();
  fctRenderHistory();

  if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = btnOriginal; }

  const bigPdfWarning = imgTooBig ? "PDF grande: imagen no guardada en nube" : null;

  if (fctQueueIdx >= 0) {
    fctAdvanceBatch(bigPdfWarning);
  } else {
    showToast(
      bigPdfWarning
        ? `Guardada ✓ — ${bigPdfWarning}`
        : `Factura de ${data.proveedor} guardada ✓`,
      bigPdfWarning ? "warn" : undefined
    );
    fctReset();
  }
}

/* ── Persistencia local ── */
function fctPersistLocal() {
  try {
    const MAX = 400_000;
    const slim = fctInvoices.map(f => {
      const big = f.imagenesBase64?.some(b => b.length > MAX) || f.imagenBase64?.length > MAX;
      if (!big) return f;
      const { imagenesBase64, imagenBase64, ...rest } = f;
      return rest;
    });
    localStorage.setItem("fct_invoices_v1", JSON.stringify(slim));
  } catch(e) { console.warn("fctPersistLocal:", e); }
}

let _fctUnsub = null;

function fctLoadInvoices() {
  // Fallback: load from localStorage immediately so UI isn't blank
  try {
    const s = localStorage.getItem("fct_invoices_v1");
    if (s) fctInvoices = JSON.parse(s);
  } catch(e) {}
  fctBuildPriceIndex();
  fctRenderHistory();
  if (typeof rPedLista === "function" && document.getElementById("pp-lista")) rPedLista();

  // Real-time Firestore listener — updates all devices instantly
  if (storageMode === "firebase" && db && !_fctUnsub) {
    _fctUnsub = db.collection(FCT_COL).orderBy("_i", "desc").limit(200)
      .onSnapshot(snap => {
        // Build a map of local images keyed by invoice id so they survive the Firestore sync
        const localImgs = {};
        fctInvoices.forEach(f => {
          if (f.imagenesBase64?.length || f.imagenBase64) {
            localImgs[f.id] = { imagenesBase64: f.imagenesBase64, imagenBase64: f.imagenBase64 };
          }
        });
        fctInvoices = snap.docs.map(d => {
          const o = { ...d.data() };
          delete o._i;
          // Re-attach local images if this device has them
          if (localImgs[o.id]) Object.assign(o, localImgs[o.id]);
          return o;
        });
        fctPersistLocal();
        fctBuildPriceIndex();
        fctRenderHistory();
        if (typeof rPedLista === "function" && document.getElementById("pp-lista")) rPedLista();
      }, e => console.warn("fctLoadInvoices onSnapshot:", e));
  }
}

async function fctDeleteInvoice(id) {
  if (!confirm("¿Borrar esta factura?")) return;
  fctInvoices = fctInvoices.filter(f => f.id !== id);
  fctPersistLocal();
  try { localStorage.removeItem("fct_img_" + id); } catch(e) {}
  if (storageMode === "firebase" && db) {
    try { await db.collection(FCT_COL).doc(id).delete(); } catch(e) {}
  }
  fctRenderHistory();
  showToast("Factura borrada", "warn");
}

/* ── Ver / descargar imagen original ── */
async function fctViewImage(id) {
  const inv = fctInvoices.find(f => f.id === id);

  // Try local first (this device scanned it), then Firestore
  let pages = inv?.imagenesBase64 || (inv?.imagenBase64 ? [inv.imagenBase64] : null);

  if (!pages?.length && storageMode === "firebase" && db) {
    showToast("Cargando factura…");
    try {
      const numPag = inv?.numPaginas ?? 1;
      const refs = Array.from({ length: numPag }, (_, i) =>
        db.collection(IMGS_COL).doc(`${id}_${i}`).get()
      );
      const snaps = await Promise.all(refs);
      pages = snaps.filter(s => s.exists).sort((a, b) => a.data().pagina - b.data().pagina).map(s => s.data().base64);
    } catch(e) { console.warn("fctViewImage Firestore:", e); }
  }

  if (!pages?.length) { showToast("Imagen no disponible", "warn"); return; }

  let current = 0;
  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px";
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const pageLabel = document.createElement("div");
  pageLabel.style.cssText = "color:#fff;font-size:13px;font-weight:600;opacity:.7";

  const viewer = document.createElement("div");
  viewer.style.cssText = "max-width:100%;max-height:75vh;display:flex;align-items:center;justify-content:center";

  const navRow = document.createElement("div");
  navRow.style.cssText = "display:flex;align-items:center;gap:10px";

  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:10px";

  function render() {
    viewer.innerHTML = "";
    const src = pages[current];
    const isPdf = src.startsWith("data:application/pdf");
    if (isPdf) {
      const embed = document.createElement("embed");
      embed.src = src;
      embed.type = "application/pdf";
      embed.style.cssText = "width:min(700px,90vw);height:75vh;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,.5)";
      viewer.appendChild(embed);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.style.cssText = "max-width:100%;max-height:75vh;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,.5)";
      viewer.appendChild(img);
    }
    pageLabel.textContent = pages.length > 1 ? `Página ${current + 1} de ${pages.length}` : "";
    navRow.innerHTML = "";
    if (pages.length > 1) {
      const prev = document.createElement("button");
      prev.textContent = "←";
      prev.disabled = current === 0;
      prev.style.cssText = "background:rgba(255,255,255,.2);color:#fff;border:none;padding:8px 16px;border-radius:16px;font-size:18px;cursor:pointer;disabled:opacity:.3";
      prev.onclick = () => { current--; render(); };
      const next = document.createElement("button");
      next.textContent = "→";
      next.disabled = current === pages.length - 1;
      next.style.cssText = prev.style.cssText;
      next.onclick = () => { current++; render(); };
      navRow.append(prev, next);
    }
  }

  const dlBtn = document.createElement("a");
  dlBtn.textContent = "Descargar";
  dlBtn.style.cssText = "background:#007AFF;color:#fff;padding:10px 22px;border-radius:20px;font-weight:600;font-size:14px;text-decoration:none;cursor:pointer";
  dlBtn.onclick = () => {
    const src = pages[current];
    const isPdf = src.startsWith("data:application/pdf");
    const a = document.createElement("a");
    a.href = src;
    a.download = `factura_${id}_p${current+1}.${isPdf ? "pdf" : "jpg"}`;
    a.click();
  };
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Cerrar";
  closeBtn.style.cssText = "background:rgba(255,255,255,.15);color:#fff;border:none;padding:10px 22px;border-radius:20px;font-weight:600;font-size:14px;cursor:pointer";
  closeBtn.onclick = () => modal.remove();
  btnRow.append(dlBtn, closeBtn);
  modal.append(pageLabel, viewer, navRow, btnRow);
  document.body.appendChild(modal);
  render();
}

/* ── Renderizar historial ── */
function fctRenderHistory() {
  const container = document.getElementById("fct-history-list");
  if (!container) return;
  const q = (document.getElementById("fct-search")?.value || "").toLowerCase();
  const filtered = (q
    ? fctInvoices.filter(f => (f.proveedor || "").toLowerCase().includes(q) || (f.numero_factura || "").toLowerCase().includes(q) || (f.lineas||[]).some(l => (l.alias||l.producto||"").toLowerCase().includes(q)))
    : fctInvoices
  ).slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (!filtered.length) {
    container.innerHTML = `<div class="fct-empty">${q ? "Sin resultados para esa búsqueda." : "Aún no hay facturas guardadas."}</div>`;
    return;
  }

  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  let lastMonth = null;
  const parts = [];
  filtered.forEach(f => {
    const monthKey = (f.fecha || "").slice(0, 7); // "YYYY-MM"
    if (monthKey && monthKey !== lastMonth) {
      const [y, m] = monthKey.split("-");
      const label = m ? `${MONTHS[parseInt(m,10)-1]} ${y}` : monthKey;
      parts.push(`<div class="fct-month-header">${label}</div>`);
      lastMonth = monthKey;
    } else if (!monthKey && lastMonth !== "") {
      parts.push(`<div class="fct-month-header">Sin fecha</div>`);
      lastMonth = "";
    }
    const lineas = f.lineas || [];
    const renderLine = l =>
      `<div class="fct-inv-line-row">
        <span class="fct-inv-line-name">${escHtml(l.alias || l.producto || "—")}${l.alias ? `<span class="fct-inv-line-orig">${escHtml(l.producto)}</span>` : ""}</span>
        <span class="fct-inv-line-qty">${l.cantidad != null ? `${l.cantidad} ${l.unidad || ""}` : ""}</span>
        <span class="fct-inv-line-price">${l.precio_total != null ? `${l.precio_total.toFixed(2)} €` : l.precio_unitario != null ? `${l.precio_unitario.toFixed(2)} €/ud` : ""}</span>
      </div>`;
    const preview = lineas.slice(0, 3).map(renderLine).join("");
    const rest = lineas.slice(3).map(renderLine).join("");
    const hasMore = lineas.length > 3;
    parts.push(`
      <div class="fct-inv-card" id="fic-${f.id}">
        <div class="fct-inv-head" onclick="fctToggleCard('${f.id}')" style="cursor:pointer">
          <span class="fct-inv-proveedor">${escHtml(f.proveedor || "Proveedor desconocido")}</span>
          <span class="fct-inv-fecha">${f.fecha || "—"}</span>
          <span class="fct-inv-num">${f.numero_factura ? "Fac. " + escHtml(f.numero_factura) : ""}</span>
          ${f.total_factura != null ? `<span class="fct-inv-total">${Number(f.total_factura).toFixed(2)} €</span>` : ""}
          <span class="fct-inv-chevron">›</span>
        </div>
        ${lineas.length ? `
        <div class="fct-inv-body" id="ficb-${f.id}">
          <div class="fct-inv-lines-grid">
            ${preview}
            ${hasMore ? `<div class="fct-inv-more" id="ficm-${f.id}">${rest}</div>
            <button class="fct-inv-expand" id="fice-${f.id}" onclick="fctExpandCard('${f.id}')">Ver los ${lineas.length} ingredientes ▾</button>` : ""}
          </div>
          ${(f.base_imponible != null || f.iva_total != null) ? `
          <div class="fct-inv-iva-row">
            ${f.base_imponible != null ? `<span>Base: <b>${f.base_imponible.toFixed(2)} €</b></span>` : ""}
            ${f.iva_pct != null ? `<span>IVA ${f.iva_pct}%${f.iva_total != null ? `: <b>${f.iva_total.toFixed(2)} €</b>` : ""}</span>` : ""}
            ${f.total_factura != null ? `<span class="fct-inv-iva-total">Total: <b>${f.total_factura.toFixed(2)} €</b></span>` : ""}
          </div>` : ""}
          <div class="fct-inv-actions">
            ${(f.numPaginas || f.imagenesBase64?.length || f.imagenBase64) ? `<button class="fct-inv-view" onclick="event.stopPropagation();fctViewImage('${f.id}')">Ver factura</button>` : ""}
            <button class="fct-inv-del" onclick="event.stopPropagation();fctDeleteInvoice('${f.id}')" title="Borrar">Eliminar</button>
          </div>
        </div>` : ""}
      </div>`);
  });
  container.innerHTML = parts.join("");
}

function fctToggleCard(id) {
  const body = document.getElementById("ficb-" + id);
  const chevron = document.querySelector(`#fic-${id} .fct-inv-chevron`);
  if (!body) return;
  const open = body.classList.toggle("open");
  if (chevron) chevron.textContent = open ? "⌄" : "›";
}

function fctExpandCard(id) {
  const more = document.getElementById("ficm-" + id);
  const btn = document.getElementById("fice-" + id);
  if (!more || !btn) return;
  more.classList.add("open");
  btn.remove();
}

/* ── Pestaña Precios ── */
function fctRenderPrecios() {
  const container = document.getElementById("fct-precios-list");
  if (!container) return;
  const q = fctNorm(document.getElementById("fct-price-search")?.value || "");
  const keys = Object.keys(fctPriceIndex).filter(k => !q || k.includes(q) || fctNorm(fctPriceIndex[k][0]?.rawName || "").includes(q));
  keys.sort();

  if (!keys.length) {
    container.innerHTML = `<div class="fct-empty">${q ? "Sin resultados." : "Aún no hay datos de precios. Escanea y guarda facturas para ver la evolución."}</div>`;
    return;
  }

  container.innerHTML = keys.map(key => {
    const entries = fctPriceIndex[key];
    const rawName = entries[0].rawName;
    const last = entries[0];
    const lastPrice = last.precio_unitario ?? last.precio_total;

    let trend = "→", tClass = "neutral";
    if (entries.length >= 2) {
      const prev = entries[1].precio_unitario ?? entries[1].precio_total;
      if (prev != null && lastPrice != null) {
        if (lastPrice > prev) { trend = "↑"; tClass = "up"; }
        else if (lastPrice < prev) { trend = "↓"; tClass = "down"; }
      }
    }

    const sparklines = entries.slice(0, 8).reverse().map((e, i, arr) => {
      const p = e.precio_unitario ?? e.precio_total ?? 0;
      const maxP = Math.max(...arr.map(x => x.precio_unitario ?? x.precio_total ?? 0), 0.01);
      const h = Math.round((p / maxP) * 32);
      return `<div class="price-spark-bar" style="height:${h}px" title="${e.fecha || "—"}: ${p.toFixed(2)} €"></div>`;
    }).join("");

    const history = entries.slice(0, 6).map(e => {
      const p = e.precio_unitario ?? e.precio_total;
      return `<div class="price-hist-row">
        <span class="price-hist-date">${e.fecha || "—"}</span>
        <span class="price-hist-prov">${escHtml(e.proveedor)}</span>
        <span class="price-hist-price">${p != null ? p.toFixed(2) + " €" : "—"}${e.precio_unitario != null && e.unidad ? `/${e.unidad}` : ""}</span>
      </div>`;
    }).join("");

    return `<div class="price-card">
      <div class="price-card-head">
        <div>
          <div class="price-card-name">${escHtml(rawName)}</div>
          <div class="price-card-prov">${escHtml(last.proveedor)} · ${last.fecha || "—"}</div>
        </div>
        <div class="price-card-right">
          <span class="price-badge price-badge-lg price-badge-${tClass}">${trend} ${lastPrice != null ? lastPrice.toFixed(2) + " €" : "—"}</span>
          <div class="price-spark">${sparklines}</div>
        </div>
      </div>
      <div class="price-hist">${history}</div>
    </div>`;
  }).join("");
}

/* ── Pestaña Proveedores ── */
function fctRenderProveedores() {
  const container = document.getElementById("fct-proveedores-list");
  if (!container) return;
  const q = fctNorm(document.getElementById("fct-prov-search")?.value || "");

  // Build provider → products map
  const provMap = {};
  Object.values(fctPriceIndex).forEach(entries => {
    entries.forEach(e => {
      const prov = e.proveedor || "—";
      if (q && !fctNorm(prov).includes(q)) return;
      if (!provMap[prov]) provMap[prov] = {};
      const key = fctNorm(e.rawName);
      if (!provMap[prov][key]) provMap[prov][key] = { rawName: e.rawName, entries: [] };
      provMap[prov][key].entries.push(e);
    });
  });

  const provs = Object.keys(provMap).sort();
  if (!provs.length) {
    container.innerHTML = `<div class="fct-empty">${q ? "Sin resultados." : "Aún no hay datos de proveedores."}</div>`;
    return;
  }

  container.innerHTML = provs.map(prov => {
    const products = Object.values(provMap[prov]).sort((a,b) => a.rawName.localeCompare(b.rawName, "es"));
    const rows = products.map(p => {
      const last = p.entries[0];
      const prev = p.entries[1];
      const lastP = last.precio_unitario ?? last.precio_total;
      const prevP = prev ? (prev.precio_unitario ?? prev.precio_total) : null;
      let trend = "→", tClass = "neutral";
      if (prevP != null && lastP != null) {
        if (lastP > prevP) { trend = "↑"; tClass = "up"; }
        else if (lastP < prevP) { trend = "↓"; tClass = "down"; }
      }
      return `<div class="prov-product-row">
        <span class="prov-product-name">${escHtml(p.rawName)}</span>
        <span class="prov-product-date">${last.fecha || "—"}</span>
        <span class="price-badge price-badge-${tClass}">${trend} ${lastP != null ? lastP.toFixed(2) + " €" : "—"}</span>
      </div>`;
    }).join("");
    return `<div class="prov-card">
      <div class="prov-card-head">${escHtml(prov)} <span class="prov-card-count">${products.length} producto${products.length !== 1 ? "s" : ""}</span></div>
      <div class="prov-card-body">${rows}</div>
    </div>`;
  }).join("");
}

/* ── Informe mensual ── */
function fctOpenReportModal() {
  const now = new Date();
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const years = [];
  const minYear = Math.min(...fctInvoices.map(f => parseInt((f.fecha||"").slice(0,4))).filter(Boolean), now.getFullYear());
  for (let y = now.getFullYear(); y >= (minYear || now.getFullYear() - 3); y--) years.push(y);

  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px";
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:20px;padding:28px;max-width:340px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.2)">
      <h2 style="margin:0 0 6px;font-size:20px">Informe mensual</h2>
      <p style="margin:0 0 20px;font-size:14px;color:var(--muted)">Selecciona el mes para generar el informe PDF para tu gestor.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--muted);display:block;margin-bottom:4px">MES</label>
          <select id="rpt-month" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--separator);background:var(--bg);font-size:14px;font-weight:600">
            ${months.map((m,i) => `<option value="${i+1}"${i === now.getMonth() ? " selected" : ""}>${m}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--muted);display:block;margin-bottom:4px">AÑO</label>
          <select id="rpt-year" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--separator);background:var(--bg);font-size:14px;font-weight:600">
            ${years.map(y => `<option value="${y}"${y === now.getFullYear() ? " selected" : ""}>${y}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;padding:12px;border-radius:12px;border:none;background:var(--bg);font-size:14px;font-weight:600;cursor:pointer">Cancelar</button>
        <button onclick="fctGenerateReport(parseInt(document.getElementById('rpt-month').value),parseInt(document.getElementById('rpt-year').value));this.closest('div[style*=fixed]').remove()" style="flex:2;padding:12px;border-radius:12px;border:none;background:var(--blue);color:#fff;font-size:14px;font-weight:600;cursor:pointer">Generar PDF</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function fctGenerateReport(month, year) {
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const monthStr = `${year}-${String(month).padStart(2,"0")}`;
  const invoices = fctInvoices.filter(f => (f.fecha || "").startsWith(monthStr));

  if (!invoices.length) {
    showToast(`Sin facturas en ${months[month-1]} ${year}`, "warn");
    return;
  }

  const totalConIva  = invoices.reduce((s,f) => s + (f.total_factura  || 0), 0);
  const totalBase    = invoices.reduce((s,f) => s + (f.base_imponible || 0), 0);
  const totalIva     = invoices.reduce((s,f) => s + (f.iva_total      || 0), 0);
  const numFacturas  = invoices.length;

  // Agrupación por proveedor
  const byProv = {};
  invoices.forEach(f => {
    const p = f.proveedor || "Sin proveedor";
    if (!byProv[p]) byProv[p] = { invoices: [], total: 0, base: 0, iva: 0 };
    byProv[p].invoices.push(f);
    byProv[p].total += f.total_factura  || 0;
    byProv[p].base  += f.base_imponible || 0;
    byProv[p].iva   += f.iva_total      || 0;
  });
  const provSorted = Object.entries(byProv).sort((a,b) => b[1].total - a[1].total);
  const maxProvTotal = provSorted[0]?.[1].total || 1;

  // Paleta de colores para proveedores
  const COLORS = ["#1a1a2e","#16213e","#0f3460","#533483","#e94560","#457b9d","#1d3557","#2b2d42"];

  // ── Gráfico de barras horizontal por proveedor ──
  const barRows = provSorted.map(([prov, d], i) => {
    const pct = totalConIva > 0 ? Math.round(d.total / totalConIva * 100) : 0;
    const barW = maxProvTotal > 0 ? Math.round(d.total / maxProvTotal * 100) : 0;
    const color = COLORS[i % COLORS.length];
    return `
      <div style="display:grid;grid-template-columns:160px 1fr 90px 44px;gap:10px;align-items:center;margin-bottom:11px">
        <div style="font-size:12px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${escHtml(prov)}">${escHtml(prov)}</div>
        <div style="background:#f0f0f0;border-radius:4px;height:18px;overflow:hidden">
          <div style="width:${barW}%;height:100%;background:${color};border-radius:4px;transition:width .3s"></div>
        </div>
        <div style="font-size:13px;font-weight:700;text-align:right;color:#1a1a1a">${d.total.toFixed(2)} €</div>
        <div style="font-size:11px;color:#888;text-align:right">${pct}%</div>
      </div>`;
  }).join("");

  // ── Top productos (por frecuencia) ──
  const ingFreq = {};
  invoices.forEach(f => (f.lineas||[]).forEach(l => {
    const k = l.alias || l.producto || "";
    if (k) ingFreq[k] = (ingFreq[k] || 0) + 1;
  }));
  const topIngs = Object.entries(ingFreq).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const topIngHtml = topIngs.map(([name, n]) =>
    `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:12px">
      <span style="color:#333">${escHtml(name)}</span>
      <span style="font-weight:600;color:#1a1a1a">${n}×</span>
    </div>`).join("");

  // ── Detalle por proveedor (páginas siguientes) ──
  const detailSections = provSorted.map(([prov, d], pi) => {
    const color = COLORS[pi % COLORS.length];
    const invSections = d.invoices.map(f => {
      const lineRows = (f.lineas||[]).map(l => `
        <tr>
          <td style="padding-left:12px;color:#333;font-size:11.5px">${escHtml(l.alias || l.producto || "—")}</td>
          <td style="text-align:center;font-size:11.5px;color:#555">${l.cantidad != null ? l.cantidad + " " + (l.unidad||"") : "—"}</td>
          <td style="text-align:right;font-size:11.5px;color:#555">${l.precio_unitario != null ? l.precio_unitario.toFixed(2)+" €" : "—"}</td>
          <td style="text-align:right;font-size:11.5px;font-weight:600">${l.precio_total != null ? l.precio_total.toFixed(2)+" €" : "—"}</td>
        </tr>`).join("");
      return `
        <tr style="background:#fafafa">
          <td style="font-weight:700;font-size:12px;padding:7px 8px;color:#1a1a1a">
            ${escHtml(f.numero_factura ? "Factura " + f.numero_factura : "Sin número")}
          </td>
          <td style="text-align:center;font-size:12px;color:#666">${f.fecha || "—"}</td>
          <td style="text-align:right;font-size:12px;color:#666">${f.base_imponible != null ? f.base_imponible.toFixed(2)+" €" : "—"}</td>
          <td style="text-align:right;font-size:12px;font-weight:700;color:#1a1a1a">${f.total_factura != null ? f.total_factura.toFixed(2)+" €" : "—"}</td>
        </tr>
        ${lineRows}
        <tr><td colspan="4" style="padding:0;height:6px"></td></tr>`;
    }).join("");

    return `
      <div style="page-break-before:${pi===0?"always":"auto"};margin-bottom:36px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:10px;border-bottom:3px solid ${color}">
          <div style="width:10px;height:32px;background:${color};border-radius:3px;flex-shrink:0"></div>
          <div>
            <div style="font-size:17px;font-weight:800;color:#1a1a1a">${escHtml(prov)}</div>
            <div style="font-size:12px;color:#888">${d.invoices.length} factura${d.invoices.length!==1?"s":""} · Base ${d.base.toFixed(2)} € · IVA ${d.iva.toFixed(2)} € · <strong>Total ${d.total.toFixed(2)} €</strong></div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:${color}08">
              <th style="text-align:left;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#888;border-bottom:1px solid #e0e0e0;font-weight:700">Concepto / Producto</th>
              <th style="text-align:center;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#888;border-bottom:1px solid #e0e0e0;font-weight:700">Cant.</th>
              <th style="text-align:right;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#888;border-bottom:1px solid #e0e0e0;font-weight:700">P. Unit.</th>
              <th style="text-align:right;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#888;border-bottom:1px solid #e0e0e0;font-weight:700">Total</th>
            </tr>
          </thead>
          <tbody>${invSections}</tbody>
        </table>
        <div style="text-align:right;margin-top:10px;font-size:13px;color:#888">
          Subtotal ${escHtml(prov)}: <strong style="color:#1a1a1a">${d.total.toFixed(2)} €</strong>
        </div>
      </div>`;
  }).join("");

  const fmt = n => n.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2});

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Informe ${months[month-1]} ${year} — Oba</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#fff;font-size:13px;line-height:1.5}
      .page{max-width:794px;margin:0 auto;padding:40px 48px}
      @media print{
        .page{padding:0;max-width:none}
        @page{margin:16mm 18mm;size:A4}
        .no-print{display:none}
      }
    </style>
  </head><body>

  <!-- ══════════ PÁGINA 1: PORTADA VISUAL ══════════ -->
  <div class="page">

    <!-- Cabecera -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;padding-bottom:20px;border-bottom:4px solid #1a1a2e">
      <div>
        <div style="font-size:36px;font-weight:900;letter-spacing:-2px;color:#1a1a2e;line-height:1">oba-</div>
        <div style="font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px">Informe de Compras</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-1px">${months[month-1]} ${year}</div>
        <div style="font-size:11px;color:#aaa;margin-top:2px">Generado el ${new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}</div>
      </div>
    </div>

    <!-- KPIs principales -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;margin-bottom:36px">
      <div style="background:#1a1a2e;color:#fff;border-radius:14px;padding:20px 18px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.6;font-weight:600">Total con IVA</div>
        <div style="font-size:24px;font-weight:900;margin-top:6px;letter-spacing:-1px">${fmt(totalConIva)} €</div>
      </div>
      <div style="background:#f5f5f8;border-radius:14px;padding:20px 18px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600">Base imponible</div>
        <div style="font-size:22px;font-weight:800;margin-top:6px;letter-spacing:-0.5px">${fmt(totalBase)} €</div>
      </div>
      <div style="background:#f5f5f8;border-radius:14px;padding:20px 18px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600">IVA total</div>
        <div style="font-size:22px;font-weight:800;margin-top:6px;letter-spacing:-0.5px">${fmt(totalIva)} €</div>
      </div>
      <div style="background:#f5f5f8;border-radius:14px;padding:20px 18px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600">Facturas</div>
        <div style="font-size:22px;font-weight:800;margin-top:6px">${numFacturas}</div>
        <div style="font-size:11px;color:#aaa;margin-top:2px">${Object.keys(byProv).length} proveedores</div>
      </div>
    </div>

    <!-- Gráfico de barras -->
    <div style="margin-bottom:32px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:16px">Gasto por proveedor</div>
      ${barRows}
    </div>

    <!-- Dos columnas: tabla resumen + top productos -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px">

      <!-- Tabla resumen proveedores -->
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:12px">Resumen</div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="font-size:10px;text-transform:uppercase;color:#aaa;font-weight:600;padding:4px 0;border-bottom:1px solid #e8e8e8;text-align:left">Proveedor</th>
            <th style="font-size:10px;text-transform:uppercase;color:#aaa;font-weight:600;padding:4px 0;border-bottom:1px solid #e8e8e8;text-align:center">Fact.</th>
            <th style="font-size:10px;text-transform:uppercase;color:#aaa;font-weight:600;padding:4px 0;border-bottom:1px solid #e8e8e8;text-align:right">Total</th>
          </tr></thead>
          <tbody>
            ${provSorted.map(([prov,d])=>`
            <tr>
              <td style="padding:6px 0;font-size:12px;border-bottom:1px solid #f5f5f5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${escHtml(prov)}</td>
              <td style="padding:6px 0;font-size:12px;border-bottom:1px solid #f5f5f5;text-align:center;color:#888">${d.invoices.length}</td>
              <td style="padding:6px 0;font-size:12px;border-bottom:1px solid #f5f5f5;text-align:right;font-weight:700">${d.total.toFixed(2)} €</td>
            </tr>`).join("")}
            <tr style="border-top:2px solid #1a1a2e">
              <td style="padding:8px 0;font-size:13px;font-weight:800">TOTAL</td>
              <td style="padding:8px 0;font-size:13px;text-align:center;color:#888">${numFacturas}</td>
              <td style="padding:8px 0;font-size:13px;font-weight:900;text-align:right">${fmt(totalConIva)} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top productos -->
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:12px">Productos más comprados</div>
        ${topIngHtml || '<div style="color:#aaa;font-size:12px">Sin datos de líneas</div>'}
      </div>
    </div>

    <!-- Footer página 1 -->
    <div style="margin-top:40px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#bbb">
      <span>Oba Restaurante · Intranet de gestión interna</span>
      <span>Datos extraídos con IA a partir de facturas escaneadas</span>
    </div>
  </div>

  <!-- ══════════ PÁGINAS SIGUIENTES: DETALLE ══════════ -->
  <div class="page">
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#aaa;font-weight:700;margin-bottom:24px">
      Detalle de facturas · ${months[month-1]} ${year}
    </div>
    ${detailSections}

    <!-- Total final -->
    <div style="page-break-inside:avoid;margin-top:32px;padding:18px 20px;background:#1a1a2e;color:#fff;border-radius:14px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:13px;font-weight:600;opacity:.7">Total ${months[month-1]} ${year}</div>
      <div>
        <span style="font-size:12px;opacity:.6">Base ${fmt(totalBase)} €  ·  IVA ${fmt(totalIva)} €  ·  </span>
        <span style="font-size:20px;font-weight:900;letter-spacing:-0.5px">${fmt(totalConIva)} €</span>
      </div>
    </div>

    <div style="margin-top:28px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#bbb">
      <span>Oba Restaurante · Intranet de gestión interna</span>
      <span>Datos extraídos con IA a partir de facturas escaneadas</span>
    </div>
  </div>

  <script>window.onload=()=>window.print();<\/script>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) { showToast("Permite ventanas emergentes para generar el informe", "warn"); return; }
  win.document.write(html);
  win.document.close();
}

/* ── Exportar CSV ── */
function fctExportCSV() {
  if (!fctInvoices.length) { showToast("No hay facturas para exportar", "warn"); return; }
  const rows = [["Proveedor","Fecha","N. Factura","Total €","Producto","Cantidad","Unidad","P.Unit €","P.Total €"]];
  fctInvoices.forEach(f => {
    if (!(f.lineas || []).length) {
      rows.push([f.proveedor||"",f.fecha||"",f.numero_factura||"",f.total_factura||"","","","","",""]);
    } else {
      f.lineas.forEach((l, i) => {
        rows.push([
          i === 0 ? (f.proveedor||"") : "",
          i === 0 ? (f.fecha||"") : "",
          i === 0 ? (f.numero_factura||"") : "",
          i === 0 ? (f.total_factura||"") : "",
          l.producto||"", l.cantidad??""  , l.unidad||"", l.precio_unitario??"", l.precio_total??""
        ]);
      });
    }
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "facturas_oba_" + new Date().toISOString().slice(0,10) + ".csv";
  a.click();
  showToast("CSV exportado");
}

function escHtml(s) {
  return String(s || "").replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"}[c]));
}

function showToast(msg, kind) {
  const el = document.getElementById("toast-global") || (() => {
    const t = document.createElement("div");
    t.id = "toast-global";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1c1c1e;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap";
    document.body.appendChild(t);
    return t;
  })();
  el.textContent = msg;
  el.style.background = kind === "error" ? "#FF3B30" : kind === "warn" ? "#FF9500" : "#1c1c1e";
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; }, 2800);
}
