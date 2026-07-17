const PWD = "oba2025";
const REPORTES_USER = "reportescañitasgastro";
const REPORTES_PWD  = "reportescañitasgastro";
const REPORTES_SESSION_KEY = "oba_reportes_unlocked_v1";
const REPORTES_ONLY_KEY    = "oba_reportes_only_v1";

// ── Cuentas con roles (Firebase Auth) ──────────────────
// Roles: "admin" (todo), "encargado" (su restaurante + sus reportes),
// "reportes" (solo formulario de reporte).
const ROL_KEY        = "oba_rol_v1";
const ENC_REST_KEY   = "oba_enc_rest_v1";
const USER_NOMBRE_KEY = "oba_user_nombre_v1";
const REST_THEME_MAP = {
  "OBA": "oba",
  "ME x Cañitas Maite Malaga": "canitas",
  "Cebo": "cebo",
  "EÑE": "ene",
  "Can Domo": "candomo"
};
const FN_BASE = "https://europe-west1-intranet-oba.cloudfunctions.net";
const FB = {
  apiKey: "AIzaSyAUUgLnKnh1xUbCjis4nPoEzoLLrJp9loY",
  authDomain: "intranet-oba.firebaseapp.com",
  projectId: "intranet-oba",
  storageBucket: "intranet-oba.firebasestorage.app",
  messagingSenderId: "603055689454",
  appId: "1:603055689454:web:4e25c2a58f6a42c9c0adff"
};

const SECS = ["Bienvenida", "Huerta", "Bosque", "Afluente", "Corral", "Acantilado", "Monte Bajo", "Llanura", "Rivera", "Postres"];
const REST_SECS = ["Entrantes", "Principales", "Postres", "Snacks", "Petit Fours", "Bebidas", "Bases y Técnicas"];
const CATS = ["Bienvenida", "Huerta", "Bosque", "Afluente", "Corral", "Acantilado", "Monte Bajo", "Llanura", "Rivera", "Fermentos"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const SKILLS = ["Mise en place", "Fondos y salsas", "Carnes", "Pescados", "Pastelería", "Fermentos", "Limpieza y orden", "Trabajo en equipo"];
const ALERGEN_LIST = ["Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja", "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Dióxido de azufre", "Altramuces", "Moluscos"];
const COLLECTIONS = ["recipes", "ingredientes", "avisos", "proyectos", "eventos", "proveedores", "practicantes", "centros", "habitaciones", "pedidosHistorial", "descargables", "empresas", "grupo_descargables", "oba_recetas", "oba_menus", "oba_ideas", "oba_kpis", "ene_recetas", "ene_menus", "ene_ideas", "ene_kpis", "candomo_recetas", "candomo_menus", "candomo_ideas", "candomo_kpis", "canitas_recetas", "canitas_menus", "canitas_ideas", "canitas_kpis", "cebo_recetas", "cebo_menus", "cebo_ideas", "cebo_kpis", "huerta_plantas", "inventario"];

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

function _applyRepOnlyMode() {
  document.getElementById("app")?.classList.add("rep-only");
  document.body.classList.add("rep-only");
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
  huerta_plantas: [],
  inventario: [],
  cebo_recetas: [{"_i":1,"nombre":"Snack tartaleta de lechuga de mar y anchoallade","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Alga codium","c":"","u":""}],"subrecetas":[{"nombre":"Cebo base de tartaleta de lechuga de mar","descripcion":"","ingredientes":[{"i":"Lechuga de mar en sal","c":"","u":""},{"i":"Alga nori seca","c":"","u":""},{"i":"Harina de trigo","c":"","u":""},{"i":"Harina de arroz","c":"","u":""},{"i":"Maizena","c":"","u":""},{"i":"Huevo","c":"","u":""},{"i":"Codium en polvo liofilizado","c":"","u":""},{"i":"Sal fina","c":"","u":""}],"pasos":[]},{"nombre":"Licuado de algas","descripcion":"","ingredientes":[{"i":"Alga kombu deshidratada","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base de anchoallade","descripcion":"","ingredientes":[{"i":"Anchoa ahumada","c":"","u":""},{"i":"Chapata","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""},{"i":"Pepinillo en vinagre","c":"","u":""},{"i":"Alcaparras","c":"","u":""},{"i":"Cebolletas blancas","c":"","u":""},{"i":"Cebollino","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Perejil","c":"","u":""},{"i":"Vinagre de jerez","c":"","u":""},{"i":"Alga codium","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":2,"nombre":"Snack crujiente de espina de boquerón","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Boquerón grande","c":"","u":""}],"subrecetas":[{"nombre":"Cebo crujiente de arroz boquerón","descripcion":"","ingredientes":[{"i":"Arroz SOS","c":"","u":""},{"i":"Katsuo bushi","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":3,"nombre":"Snack anchoa sobada \"López\"","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Anchoa en salazón","c":"","u":""},{"i":"Aceite de oliva virgen extra","c":"","u":""}],"subrecetas":[],"pasos":[],"notas":"Pendiente: añadir elaboración de desobar","fecha":"2026-06-21","autor":"Cebo"},{"_i":4,"nombre":"Snack de crujiente de piel, rillete de pintada y trufa","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Trufa T. melanosporum","c":"","u":""}],"subrecetas":[{"nombre":"Cebo crujiente de piel de pollo","descripcion":"","ingredientes":[{"i":"Pieles de pollo","c":"","u":""},{"i":"Cebo caldo de ave oscuro","c":"","u":""},{"i":"Harina de arroz blanco","c":"","u":""},{"i":"Maizena","c":"","u":""},{"i":"Levadura fresca","c":"","u":""},{"i":"Goma xantana","c":"","u":""},{"i":"Katakuriko almidón de patata","c":"","u":""}],"pasos":[]},{"nombre":"Cebo rillete de pintada","descripcion":"","ingredientes":[{"i":"Manteca de cerdo","c":"","u":""},{"i":"Pintada (muslo, contramuslo e interiores)","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Romero","c":"","u":""},{"i":"Tomillo","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""}],"pasos":[]},{"nombre":"Cebo consomé de pintada","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave claro","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":5,"nombre":"Snack bikini de pintada y queso comté","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[],"subrecetas":[{"nombre":"Cebo pan de arroz glutinoso y trufa","descripcion":"","ingredientes":[{"i":"Arroz glutinoso","c":"","u":""},{"i":"Leche entera","c":"","u":""},{"i":"Huevos de pollita","c":"","u":""},{"i":"Levadura","c":"","u":""},{"i":"Trufa otoño tuber uncinatum","c":"","u":""},{"i":"Mantequilla","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]},{"nombre":"Cebo crema de queso comté","descripcion":"","ingredientes":[{"i":"Queso Comté 16/24 meses","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"XP Flaxfiber","c":"","u":""}],"pasos":[]},{"nombre":"Cebo chacina de pintada y trufa","descripcion":"","ingredientes":[{"i":"Pintada (pechuga)","c":"","u":""},{"i":"Pimienta negra molida","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Trufa T. melanosporum","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":6,"nombre":"Snack consomé de pintada","seccion":"Snacks","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Manzanilla pasada Pastrana Hidalgo","c":"","u":""},{"i":"Trufa T. melanosporum","c":"","u":""}],"subrecetas":[{"nombre":"Cebo consomé de pintada","descripcion":"","ingredientes":[{"i":"Pintada (carcasa, mollejas y alas)","c":"","u":""},{"i":"Gallina","c":"","u":""},{"i":"Carcasa de pollo limpia","c":"","u":""},{"i":"Tendones de ternera","c":"","u":""},{"i":"Puerros","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Apio con hoja","c":"","u":""},{"i":"Garbanzos","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Perejil","c":"","u":""},{"i":"Zanahoria","c":"","u":""},{"i":"Champiñón botón","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""},{"i":"Bayas de enebro","c":"","u":""},{"i":"Cebo caldo de ave claro","c":"","u":""}],"pasos":[]},{"nombre":"Cebo caldo de ave claro","descripcion":"","ingredientes":[{"i":"Ajo morado","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Carcasas de ave","c":"","u":""},{"i":"Gallina","c":"","u":""},{"i":"Laurel","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":7,"nombre":"Cerdo de bellota - La croqueta de Cañitas","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Coppa","c":"","u":""}],"subrecetas":[{"nombre":"Masa croqueta Joselito","descripcion":"","ingredientes":[{"i":"Lingote mantequilla oveja","c":"","u":""},{"i":"Leche entera","c":"","u":""},{"i":"Nata pasteurizada oveja","c":"","u":""},{"i":"Leche oveja","c":"","u":""},{"i":"Harina azul suave floja","c":"","u":""},{"i":"Jamón ibérico en tacos","c":"","u":""},{"i":"Gelatina hoja","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""}],"pasos":[]},{"nombre":"Empanado de croqueta","descripcion":"","ingredientes":[{"i":"Pan rallado panko","c":"","u":""},{"i":"Huevo","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":8,"nombre":"Tomate embotado - Lácteo de cabra","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Quinoa","c":"","u":""},{"i":"Brotes lentejuela","c":"","u":""},{"i":"Brotes mostaza verde","c":"","u":""},{"i":"Brotes albahaca limón","c":"","u":""},{"i":"Brotes remolacha","c":"","u":""},{"i":"Brotes mizuna púrpura","c":"","u":""},{"i":"Brotes rabanito morado","c":"","u":""},{"i":"Brote apio montaña","c":"","u":""},{"i":"Oxalis morado","c":"","u":""},{"i":"Vene cress acedera roja","c":"","u":""}],"subrecetas":[{"nombre":"Embotado de tomate","descripcion":"","ingredientes":[{"i":"Tomate pera gordo","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]},{"nombre":"Lácteo de cabra","descripcion":"","ingredientes":[{"i":"Nata pasteurizada oveja","c":"","u":""},{"i":"Queso Payoyo curado con chicharrones","c":"","u":""},{"i":"Gelatina hoja","c":"","u":""},{"i":"Queso crema Ameland","c":"","u":""},{"i":"Goma xantana","c":"","u":""}],"pasos":[]},{"nombre":"Tomate Bloody Mary","descripcion":"","ingredientes":[{"i":"Tomate maduro en rama","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Zumo de lima","c":"","u":""},{"i":"Salsa Perrins","c":"","u":""},{"i":"Salsa kimchi Popo Umami","c":"","u":""},{"i":"Apio con hoja","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""},{"i":"Vino dulce palo cortado","c":"","u":""}],"pasos":[]},{"nombre":"Aceite de tomate","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Gel de tomate","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":9,"nombre":"Navaja de buceo - Escarcha de marisma","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Navaja de buceo fresca","c":"","u":""},{"i":"Almendras peladas","c":"","u":""}],"subrecetas":[{"nombre":"Base caldo de navaja","descripcion":"","ingredientes":[{"i":"Navaja Delta Ebre","c":"","u":""}],"pasos":[]},{"nombre":"Gelee caldo de navaja","descripcion":"","ingredientes":[{"i":"Cebo base caldo navaja","c":"","u":""},{"i":"Salsa kimchi Popo Umami","c":"","u":""},{"i":"Limas","c":"","u":""},{"i":"Agar-agar en polvo","c":"","u":""},{"i":"Sosa Instantgel","c":"","u":""}],"pasos":[]},{"nombre":"Gazpachuelo codium","descripcion":"","ingredientes":[{"i":"Huevos de pollita","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""},{"i":"Limas","c":"","u":""},{"i":"Cebo base caldo navaja","c":"","u":""},{"i":"Sal","c":"","u":""}],"pasos":[]},{"nombre":"Codium escarcha","descripcion":"","ingredientes":[{"i":"Alga codium","c":"","u":""},{"i":"Nitrógeno líquido food","c":"","u":""},{"i":"Gelatina hoja","c":"","u":""}],"pasos":[]},{"nombre":"Cebo aceite de eneldo","descripcion":"","ingredientes":[{"i":"Eneldo","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""}],"pasos":[]},{"nombre":"Licuado de algas","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo navaja de buceo confitada en AOVE","descripcion":"","ingredientes":[{"i":"Navaja de buceo fresca","c":"","u":""},{"i":"Aceite de oliva virgen extra","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""}],"pasos":[]},{"nombre":"Cebo paté de navaja de buceo","descripcion":"","ingredientes":[{"i":"Cebo navaja de buceo confitada en AOVE","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Vino blanco joven El Sotillo","c":"","u":""}],"pasos":[]},{"nombre":"Cebo aceite de ajo","descripcion":"","ingredientes":[{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Ajo morado","c":"","u":""}],"pasos":[]},{"nombre":"Cebo pil pil de navaja","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caseína de ajo","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":10,"nombre":"Concha fina - Camarón gallego","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Camarón rojo","c":"","u":""},{"i":"Concha fina","c":"","u":""},{"i":"Micro zanahoria","c":"","u":""}],"subrecetas":[{"nombre":"Cebo escabeche de zanahorias","descripcion":"","ingredientes":[{"i":"Cebo fumet","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""},{"i":"Vinagre de sidra","c":"","u":""},{"i":"Vinagre de jerez","c":"","u":""},{"i":"Zanahoria","c":"","u":""}],"pasos":[]},{"nombre":"Cebo fumet","descripcion":"","ingredientes":[{"i":"Cabeza de rape grande","c":"","u":""},{"i":"Espinas de pescado","c":"","u":""},{"i":"Zanahoria","c":"","u":""},{"i":"Cebolla de Figueres","c":"","u":""},{"i":"Puerros","c":"","u":""},{"i":"Ajos pelados","c":"","u":""},{"i":"Tomate pera gordo","c":"","u":""},{"i":"Vino fino La Ina","c":"","u":""},{"i":"Licor sake","c":"","u":""},{"i":"Mejillón gallego","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base encurtido","descripcion":"","ingredientes":[{"i":"Vinagre de sidra","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]},{"nombre":"Cebo ajada","descripcion":"","ingredientes":[{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Cebolla blanca","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Pimentón dulce","c":"","u":""},{"i":"Pimentón picante","c":"","u":""},{"i":"Vinagre de jerez","c":"","u":""}],"pasos":[]},{"nombre":"Cebo puré de zanahoria","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo néctar de camarón gallego","descripcion":"","ingredientes":[{"i":"Ajo morado","c":"","u":""},{"i":"Aceite de oliva virgen extra","c":"","u":""},{"i":"Brandy Fundador","c":"","u":""},{"i":"Goma xantana","c":"","u":""},{"i":"Camarón rojo","c":"","u":""},{"i":"Gelcrem Fred Sosa","c":"","u":""},{"i":"Kizami wasabi","c":"","u":""}],"pasos":[]},{"nombre":"Cebo pollo umami","descripcion":"","ingredientes":[{"i":"Carcasa de pollo limpia","c":"","u":""},{"i":"Contramuslo de pollo entero","c":"","u":""},{"i":"Champiñón botón","c":"","u":""},{"i":"Cebolla de Figueres","c":"","u":""},{"i":"Tomate pera gordo","c":"","u":""},{"i":"Lechuga de mar fresca en sal","c":"","u":""},{"i":"Vino tinto joven","c":"","u":""},{"i":"Vino fino La Ina","c":"","u":""},{"i":"Almeja blanca","c":"","u":""},{"i":"Shiro miso pasta soja clara","c":"","u":""}],"pasos":[]},{"nombre":"Cebo concha fina seca","descripcion":"","ingredientes":[{"i":"Concha fina","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":11,"nombre":"Esturión ahumado - Caviar Oscietra","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Caviar Oscietra","c":"","u":""},{"i":"Flores de aliso blanco","c":"","u":""}],"subrecetas":[{"nombre":"Base brandada de esturión","descripcion":"","ingredientes":[{"i":"Ajos secos","c":"","u":""},{"i":"Apio con hoja","c":"","u":""},{"i":"Cebolla tierna","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Vino blanco joven El Sotillo","c":"","u":""},{"i":"Vino fino La Ina","c":"","u":""},{"i":"Esturión fresco","c":"","u":""},{"i":"Nata pasteurizada oveja","c":"","u":""}],"pasos":[]},{"nombre":"Cebo brandada de esturión","descripcion":"","ingredientes":[{"i":"Cebo base brandada esturión","c":"","u":""},{"i":"Patata agria","c":"","u":""},{"i":"Ajos secos","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Esturión ahumado","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base beurre blanc","descripcion":"","ingredientes":[{"i":"Lingote mantequilla oveja","c":"","u":""},{"i":"Cebolla chalota","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Cava Privat Brut Nature","c":"","u":""},{"i":"Nata pasteurizada oveja","c":"","u":""}],"pasos":[]},{"nombre":"Cebo esturión ahumado","descripcion":"","ingredientes":[{"i":"Esturión fresco","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":12,"nombre":"Champiñón botón - Mantequilla tostada","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Champiñón botón","c":"","u":""},{"i":"Mantequilla","c":"","u":""},{"i":"Champiñón portobello","c":"","u":""}],"subrecetas":[{"nombre":"Cebo flan de champiñón botón","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo emulsión de escabeche de ortiga y amontillado","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo toffee de champiñones","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave claro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo douxelle de champiñón lactofermentado","descripcion":"","ingredientes":[{"i":"Aceite de oliva virgen extra","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Cebolla de Figueres","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Vino blanco joven","c":"","u":""},{"i":"Champiñón botón","c":"","u":""},{"i":"Champiñón portobello","c":"","u":""},{"i":"Cebo base encurtido de anís estrellado","c":"","u":""},{"i":"Cebo aceite de ajo","c":"","u":""},{"i":"Goma xantana","c":"","u":""}],"pasos":[]},{"nombre":"Cebo toffee de champiñones","descripcion":"","ingredientes":[{"i":"Champiñón botón (recortes)","c":"","u":""},{"i":"Azúcar panela","c":"","u":""},{"i":"Salsa soja","c":"","u":""},{"i":"Vinagre de jerez","c":"","u":""},{"i":"Yondu Vegetable Essence","c":"","u":""},{"i":"Aceite de oliva virgen extra","c":"","u":""},{"i":"Nata líquida 35%","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base encurtido de anís estrellado","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo aceite de ajo","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo helado de champiñón lactofermentado","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":13,"nombre":"Guisante lágrima - Erizo de mar","seccion":"Entrantes","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Guisante maresme lágrima","c":"","u":""},{"i":"Erizos de mar","c":"","u":""},{"i":"Germinado de guisante","c":"","u":""}],"subrecetas":[{"nombre":"Cebo salsa verde","descripcion":"","ingredientes":[{"i":"Cebo caldo de bacalao","c":"","u":""},{"i":"Cebo aceite de ajo","c":"","u":""},{"i":"Vino fino La Ina","c":"","u":""},{"i":"Perejil","c":"","u":""},{"i":"Espinacas","c":"","u":""},{"i":"Ajos secos","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""}],"pasos":[]},{"nombre":"Cebo salsa yodada","descripcion":"","ingredientes":[{"i":"Cebo infusión de algas","c":"","u":""},{"i":"Cebo sofrito en blanco de butifarra de pato","c":"","u":""},{"i":"Nata","c":"","u":""},{"i":"Sucro emul Sosa","c":"","u":""},{"i":"Toufood cítrico","c":"","u":""}],"pasos":[]},{"nombre":"Cebo caldo de bacalao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo aceite de ajo","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo sofrito en blanco de butifarra de pato","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo tartaleta de espinaca","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo miel de erizo","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo kéfir","descripcion":"","ingredientes":[{"i":"Kéfir","c":"","u":""},{"i":"Leche","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":14,"nombre":"Angulas del Miño","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Angula fresca","c":"","u":""}],"subrecetas":[{"nombre":"Salsa polloalao","descripcion":"","ingredientes":[{"i":"Cebo caldo de ave oscuro","c":"","u":""},{"i":"Cebo caldo de bacalao","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Cebo grasa de pollo","c":"","u":""},{"i":"Tomillo","c":"","u":""},{"i":"Romero","c":"","u":""},{"i":"Goma xantana","c":"","u":""},{"i":"Sal","c":"","u":""}],"pasos":[]},{"nombre":"Cebo caldo de ave oscuro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de bacalao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo grasa de pollo","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":15,"nombre":"Calamar de anzuelo - Rancio Ibérico","seccion":"Principales","temporada":"Todo el año","descripcion":"Tallarín de calamar de potera sobre crema de yema, salsa rancio ibérico con caldo de jamón y polvo de tinta de calamar.","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":["Huevos","Moluscos","Lácteos"],"ingredientes":[{"i":"Bote esencia Joselito curado","c":"","u":""},{"i":"Garum colatura de anchoa","c":"","u":""}],"subrecetas":[{"nombre":"Cebo calamar producido","descripcion":"Rendimiento: de 12 kg de calamar potera se obtienen 4,3 kg de calamar producido.","ingredientes":[{"i":"Calamar potera","c":"12","u":"kg"}],"pasos":["Siempre con baños maría invertidos con hielo para hacer que se mantengan lo más frío posible el calamar.","Retirar las patas, cabeza, cococha, tripas y pluma.","Cortar a la mitad para abrir su cuerpo.","Quitar la punta de arriba y cortar la base.","Retirar perfectamente las dos telillas (exterior e interior).","Desangrar en agua con hielo junto con un punto de sal para limpiar perfectamente el resto de tinta que pueda tener.","Superponer los cuerpos uno encima de otro para congelarlo en el abatidor en forma de bloque.","Después se cortará en la corta fiambres para obtener el tallarín del tamaño deseado."]},{"nombre":"Cebo crema yema premium","descripcion":"","ingredientes":[{"i":"Yemas de huevo","c":"15","u":"uds"},{"i":"Pimienta","c":"2","u":"g"},{"i":"Sal","c":"2","u":"g"}],"pasos":["Separar las yemas de las claras y colar las yemas para eliminar cualquier resto de la parte mucosa.","Salpimentar las yemas e introducirlas en una bolsa de vacío.","Sellar la bolsa mediana lo más al filo posible para poder estirar el contenido.","Cocinar en horno con un 100 % de humedad a 68 ºC durante 10 minutos.","Finalizado el tiempo de cocción, verificar la textura. La elaboración será correcta si, al inclinar la bolsa, el contenido presenta una consistencia densa y desciende lentamente. Si no es así, cocinar 5 minutos más, hasta conseguir la densidad deseada.","Transferir el producto a mangas pasteleras cuando sea necesario y conservar refrigerado."]},{"nombre":"Cebo caldo de jamón","descripcion":"","ingredientes":[{"i":"Huesos de jamón","c":"20","u":"kg"},{"i":"Agua","c":"40","u":"l"},{"i":"Cebolla","c":"3","u":"uds"},{"i":"Garbanzos","c":"1","u":"kg"}],"pasos":["Hidratar los garbanzos 12 horas antes.","Cortar la cebolla en mirepoix y quemar las caras en un planchón o a la brasa.","Escaldar 3 veces el codillo del jamón.","Cocer todo junto durante 2 horas y 20 min.","Reposar otras 2 horas todo junto a fuego lento.","Colar, desgrasar y reducir."]},{"nombre":"Cebo polvo de tinta de calamar","descripcion":"","ingredientes":[{"i":"Polvo de tinta de calamar","c":"","u":""}],"pasos":["Poner el polvo de tinta de calamar dentro de unas gasas."]},{"nombre":"Cebo salsa rancio ibérico","descripcion":"","ingredientes":[{"i":"Nata líquida 35%","c":"150","u":"g"},{"i":"Cebo caldo de jamón","c":"500","u":"g"},{"i":"Patata agria","c":"120","u":"g"},{"i":"Goma xantana","c":"0,6","u":"g"}],"pasos":["Cocer la patata en cachelos en el caldo de jamón.","Triturar.","Añadir la nata y colar por chino fino."]},{"nombre":"Cebo velo de calamar","descripcion":"","ingredientes":[{"i":"Cebo calamar procesado","c":"","u":""},{"i":"Cebo fumet de cabeza de rape","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Goma xantana","c":"","u":""}],"pasos":[]},{"nombre":"Cebo crujiente de calamar","descripcion":"","ingredientes":[{"i":"Cebo calamar procesado","c":"","u":""},{"i":"Cebo fumet de cabeza de rape","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Goma xantana","c":"","u":""}],"pasos":[]},{"nombre":"Cebo calamar procesado","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo fumet de cabeza de rape","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":["Poner en el centro del plato un punto pequeño de crema yema.","Poner la cantidad de tallarín de calamar encima del punto.","Espolvorear polvo de tinta de calamar encima del tallarín.","Salsear alrededor del tallarín."],"notas":"De 12 kg de calamar potera se obtienen 4,3 kg de calamar producido.","fecha":"2026-06-21","autor":"Cebo"},{"_i":16,"nombre":"Esparraguín de villena","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Esparraguín","c":"","u":""},{"i":"Anguila ahumada","c":"","u":""},{"i":"Flor de sauco","c":"","u":""}],"subrecetas":[{"nombre":"Cebo salsa polloalao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave oscuro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de bacalao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo grasa de pollo","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":17,"nombre":"Gamba roja de Palamós - Manteca de orza","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Gamba roja extra","c":"","u":""}],"subrecetas":[{"nombre":"Cebo orza","descripcion":"","ingredientes":[{"i":"Chorizo de León dulce","c":"","u":""},{"i":"Manteca de cerdo","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""}],"pasos":[]},{"nombre":"Cebo consomé de gamba roja","descripcion":"","ingredientes":[{"i":"Cabeza de gamba alistada \"Pescaviva\"","c":"","u":""},{"i":"Lorito congelado \"Pescaviva\"","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Vino blanco joven El Sotillo","c":"","u":""},{"i":"Vino fino La Ina","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""}],"pasos":[]},{"nombre":"Cebo tapioca cocida","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":18,"nombre":"Virrey reposado - Bulbo de espinaca","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Palometa roja virrey","c":"","u":""},{"i":"Aceite de oliva virgen extra","c":"","u":""},{"i":"Espinaca bulbos","c":"","u":""}],"subrecetas":[{"nombre":"Cebo mantequilla cítrica ahumada","descripcion":"","ingredientes":[{"i":"Puerros","c":"","u":""},{"i":"Apio con hoja","c":"","u":""},{"i":"Cebolla blanca","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Palometa roja virrey","c":"","u":""},{"i":"Mantequilla ahumada","c":"","u":""},{"i":"Mantequilla","c":"","u":""},{"i":"Aceite de oliva 0,4°","c":"","u":""},{"i":"Limones","c":"","u":""},{"i":"Vinagre de manzana","c":"","u":""},{"i":"Cebo caldo de bacalao","c":"","u":""},{"i":"Cebo fumet","c":"","u":""},{"i":"Goma xantana","c":"","u":""}],"pasos":[]},{"nombre":"Cebo caldo de bacalao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo fumet","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":19,"nombre":"Cabrito malagueño - Arroz envejecido","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Mollejas de cordero lechal","c":"","u":""},{"i":"Coliflor","c":"","u":""},{"i":"Col repollo","c":"","u":""},{"i":"Lingote mantequilla oveja","c":"","u":""}],"subrecetas":[{"nombre":"Cebo arroz carnaroli para cabrito","descripcion":"","ingredientes":[{"i":"Arroz carnaroli old","c":"","u":""},{"i":"Lingote mantequilla oveja","c":"","u":""},{"i":"Cebolla chalota","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Cebo caldo de ave claro","c":"","u":""}],"pasos":[]},{"nombre":"Cebo falda de cordero","descripcion":"","ingredientes":[{"i":"Falda de cordero recental","c":"","u":""},{"i":"Cebo caldo de ave claro","c":"","u":""}],"pasos":[]},{"nombre":"Cebo caldo de ave claro","descripcion":"","ingredientes":[{"i":"Ajo morado","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Carcasas de ave","c":"","u":""},{"i":"Gallina","c":"","u":""},{"i":"Laurel","c":"","u":""}],"pasos":[]},{"nombre":"Vinagreta de cordero","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo kofta de cabrito","descripcion":"","ingredientes":[{"i":"Cebo falda de cordero","c":"","u":""},{"i":"Pierna de cordero","c":"","u":""},{"i":"Cebo sofrito en blanco de butifarra de pato","c":"","u":""},{"i":"Cebo caldo de ave oscuro","c":"","u":""},{"i":"Piñones","c":"","u":""},{"i":"Col repollo rizado","c":"","u":""}],"pasos":[]},{"nombre":"Cebo queso pata de mulo","descripcion":"","ingredientes":[{"i":"Queso pata de mulo","c":"","u":""},{"i":"XP Gracila Gel","c":"","u":""},{"i":"Cebo licuado de espinaca","c":"","u":""}],"pasos":[]},{"nombre":"Cebo sofrito en blanco de butifarra de pato","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave oscuro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo licuado de espinaca","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":20,"nombre":"Canetón semisalvaje - Colmenilla del Pirineo","seccion":"Principales","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Canetón de sangre","c":"","u":""},{"i":"Colmenilla","c":"","u":""}],"subrecetas":[{"nombre":"Cebo parfait de colmenilla","descripcion":"","ingredientes":[{"i":"Cebo base paté hígado de pollo","c":"","u":""},{"i":"Alcaparras","c":"","u":""},{"i":"Jamón ibérico en tacos","c":"","u":""},{"i":"Cebo caldo de ave oscuro","c":"","u":""},{"i":"Papada de cerdo ibérico","c":"","u":""}],"pasos":[]},{"nombre":"Cebo jugo de pata barbarie","descripcion":"","ingredientes":[{"i":"Pata barbarie (carcasas)","c":"","u":""},{"i":"Tendones de ternera","c":"","u":""},{"i":"Cebolla","c":"","u":""},{"i":"Puerro","c":"","u":""},{"i":"Ajo morado","c":"","u":""},{"i":"Laurel","c":"","u":""},{"i":"Pimienta negra en grano","c":"","u":""},{"i":"Enebro","c":"","u":""},{"i":"Pimienta de Jamaica","c":"","u":""},{"i":"Vino tinto \"El Sotillo\"","c":"","u":""},{"i":"Vino tinto \"Tintilla de Rota\"","c":"","u":""},{"i":"Huevo","c":"","u":""}],"pasos":[]},{"nombre":"Cebo butifarra de pato","descripcion":"","ingredientes":[{"i":"Cebo guiso de patas de pata barbarie","c":"","u":""},{"i":"Cebo sofrito en blanco de butifarra de pato","c":"","u":""},{"i":"Huevo","c":"","u":""},{"i":"Trufa T. melanosporum","c":"","u":""},{"i":"Papada de cerdo ibérico","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base paté hígado de pollo","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave oscuro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo guiso de patas de pata barbarie","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo sofrito en blanco de butifarra de pato","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de gallina","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo caldo de ave claro","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo pan de arroz glutinoso y trufa","descripcion":"","ingredientes":[{"i":"Arroz glutinoso","c":"","u":""},{"i":"Leche entera","c":"","u":""},{"i":"Huevos de pollita","c":"","u":""},{"i":"Levadura","c":"","u":""},{"i":"Trufa otoño tuber uncinatum","c":"","u":""},{"i":"Mantequilla","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]},{"nombre":"Cebo mantequilla de pieles de pato","descripcion":"","ingredientes":[{"i":"Mantequilla","c":"","u":""},{"i":"Boletus en polvo","c":"","u":""},{"i":"Trufa T. melanosporum","c":"","u":""},{"i":"Champiñón botón","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Pieles de pollo","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":21,"nombre":"Fresón blanco - Flor de Sauco","seccion":"Postres","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Fresa mara de bois","c":"","u":""},{"i":"Fresón blanco","c":"","u":""},{"i":"Hierba luisa","c":"","u":""},{"i":"Hoja santa","c":"","u":""}],"subrecetas":[{"nombre":"Cebo yogur licor de sauco","descripcion":"","ingredientes":[{"i":"Yogur griego","c":"","u":""},{"i":"Nata líquida 35%","c":"","u":""},{"i":"Licor Elderflower St. Germain","c":"","u":""}],"pasos":[]},{"nombre":"Cebo sorbete de fresa mara de bois","descripcion":"","ingredientes":[{"i":"Fresa mara de bois","c":"","u":""},{"i":"Sosa Instantgel","c":"","u":""},{"i":"Profiber","c":"","u":""},{"i":"Procrema base Sosa","c":"","u":""},{"i":"Dextrosa","c":"","u":""},{"i":"Zumo de lima","c":"","u":""},{"i":"Licor Elderflower St. Germain","c":"","u":""}],"pasos":[]},{"nombre":"Mermelada de fresa mara de bois","descripcion":"","ingredientes":[{"i":"Fresa mara de bois","c":"","u":""},{"i":"Pectina neutra","c":"","u":""}],"pasos":[]},{"nombre":"Cebo helado de fresa mara de bois","descripcion":"","ingredientes":[{"i":"Cebo base licuado de fresa","c":"","u":""},{"i":"Goma xantana","c":"","u":""},{"i":"Sosa Instantgel","c":"","u":""},{"i":"Glicerina","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Licor Elderflower St. Germain","c":"","u":""}],"pasos":[]},{"nombre":"Cebo base licuado de fresa","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":22,"nombre":"Cacao de origen - Chufa levantina","seccion":"Postres","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[],"subrecetas":[{"nombre":"Cebo helado de chufa","descripcion":"","ingredientes":[{"i":"Cebo horchata chufa cacao","c":"","u":""},{"i":"Dextrosa","c":"","u":""},{"i":"Glicerina","c":"","u":""},{"i":"Procrema base Sosa","c":"","u":""},{"i":"XP Profiber Stab 5","c":"","u":""},{"i":"Goma xantana","c":"","u":""},{"i":"Cebo nata-chufa","c":"","u":""}],"pasos":[]},{"nombre":"Cebo crepe choco nitro","descripcion":"","ingredientes":[{"i":"Chocolate Bolivia","c":"","u":""},{"i":"Leche semi s/lactosa","c":"","u":""},{"i":"Azúcar muscovado dark","c":"","u":""}],"pasos":[]},{"nombre":"Cebo miel de miso","descripcion":"","ingredientes":[{"i":"Miel","c":"","u":""},{"i":"Shiro miso pasta soja clara","c":"","u":""}],"pasos":[]},{"nombre":"Cebo barquillo","descripcion":"","ingredientes":[{"i":"Harina azul suave floja","c":"","u":""},{"i":"Azúcar glas","c":"","u":""},{"i":"Clara líquida","c":"","u":""},{"i":"Mantequilla Echire","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Canela molida","c":"","u":""}],"pasos":[]},{"nombre":"Cebo horchata chufa cacao","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo base horchata","descripcion":"","ingredientes":[],"pasos":[]},{"nombre":"Cebo nata-chufa","descripcion":"","ingredientes":[],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":23,"nombre":"Petit Almendra","seccion":"Petit Fours","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Leche en polvo","c":"","u":""},{"i":"Moscatel Pino Viejo","c":"","u":""}],"subrecetas":[{"nombre":"Cebo bizcocho de naranja","descripcion":"","ingredientes":[{"i":"Huevo","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Naranja de zumo","c":"","u":""},{"i":"Aceite de girasol","c":"","u":""},{"i":"Harina azul suave floja","c":"","u":""},{"i":"Levadura","c":"","u":""}],"pasos":[]},{"nombre":"Cebo ganache de almendra","descripcion":"","ingredientes":[{"i":"Almendras peladas","c":"","u":""},{"i":"Ivoire blanca 35% Valrhona","c":"","u":""},{"i":"Nata líquida 35%","c":"","u":""}],"pasos":[]},{"nombre":"Cebo almendra garrapiñada","descripcion":"","ingredientes":[{"i":"Almendras peladas","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":24,"nombre":"Petit Piñón","seccion":"Petit Fours","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Miel de espliego","c":"","u":""}],"subrecetas":[{"nombre":"Cebo praliné de piñón","descripcion":"","ingredientes":[{"i":"Piñones","c":"","u":""},{"i":"Azúcar","c":"","u":""}],"pasos":[]},{"nombre":"Cebo muselina de piñón","descripcion":"","ingredientes":[{"i":"Leche entera","c":"","u":""},{"i":"Yema líquida","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Maizena","c":"","u":""},{"i":"Mantequilla Echire","c":"","u":""},{"i":"Ivoire blanca 35% Valrhona","c":"","u":""},{"i":"Cebo praliné de piñón","c":"","u":""},{"i":"Queso crema Ameland","c":"","u":""}],"pasos":[]},{"nombre":"Cebo sucre","descripcion":"","ingredientes":[{"i":"Huevo","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Azúcar glas","c":"","u":""},{"i":"Almendras peladas","c":"","u":""},{"i":"Harina de trigo","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"},{"_i":25,"nombre":"Petit Pistacho","seccion":"Petit Fours","temporada":"Todo el año","descripcion":"","raciones":"","tiempoElaboracion":"","temperatura":"","alergenos":[],"ingredientes":[{"i":"Pistacho pelado ecológico","c":"","u":""}],"subrecetas":[{"nombre":"Cebo praliné de pistacho","descripcion":"","ingredientes":[{"i":"Pistacho pelado ecológico","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Sal escamas Maldon","c":"","u":""}],"pasos":[]},{"nombre":"Cebo muselina de pistacho","descripcion":"","ingredientes":[{"i":"Leche entera","c":"","u":""},{"i":"Yema líquida","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Maizena Express","c":"","u":""},{"i":"Mantequilla Echire","c":"","u":""},{"i":"Ivoire blanca 35% Valrhona","c":"","u":""},{"i":"Cebo praliné de piñón","c":"","u":""},{"i":"Queso crema Ameland","c":"","u":""}],"pasos":[]},{"nombre":"Cebo pasta choux","descripcion":"","ingredientes":[{"i":"Leche entera","c":"","u":""},{"i":"Sal","c":"","u":""},{"i":"Azúcar","c":"","u":""},{"i":"Mantequilla","c":"","u":""},{"i":"Harina de trigo","c":"","u":""},{"i":"Huevo","c":"","u":""}],"pasos":[]},{"nombre":"Cebo craquelín","descripcion":"","ingredientes":[{"i":"Mantequilla","c":"","u":""},{"i":"Azúcar moreno","c":"","u":""},{"i":"Harina de trigo","c":"","u":""}],"pasos":[]}],"pasos":[],"notas":"","fecha":"2026-06-21","autor":"Cebo"}], cebo_menus: [], cebo_ideas: [], cebo_kpis: []
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

// Logo como data URI para impresión/PDF, YA EN NEGRO. El logo original es
// blanco y en pantalla se ennegrece con filter:invert(1), pero los motores
// de PDF ignoran los filtros CSS en imágenes → el logo blanco quedaría
// invisible sobre papel blanco. Aquí invertimos los colores en un canvas
// para que el PNG embebido sea negro y se vea siempre, sin depender del CSS.
let _logoDataUrlCache = null;
function _ensureLogoDataUrl() {
  if (_logoDataUrlCache) return Promise.resolve(_logoDataUrlCache);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          px[i] = 255 - px[i];       // R
          px[i + 1] = 255 - px[i + 1]; // G
          px[i + 2] = 255 - px[i + 2]; // B  (alpha intacto → conserva transparencia)
        }
        ctx.putImageData(data, 0, 0);
        _logoDataUrlCache = canvas.toDataURL("image/png");
      } catch (e) {
        _logoDataUrlCache = logoWhiteUrl();
      }
      resolve(_logoDataUrlCache);
    };
    img.onerror = () => resolve(logoWhiteUrl());
    img.src = logoWhiteUrl();
  });
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
  window.__appLoaded = true;
  updateStorageStatus();
  const form = document.getElementById("lf");
  if (form) form.style.display = "flex";
  if (sessionStorage.getItem("oba-auth") === "1") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("visible");
    setLoginMode(false);
    const greetEl = document.getElementById("greet-sub");
    if (greetEl) greetEl.innerHTML = getGreeting();
    if (sessionStorage.getItem(REPORTES_ONLY_KEY) === "1") {
      _repOnlyStart();
    } else if (_esEncargado()) {
      _encargadoStart();
    } else {
      _dataReady.then(() => {
        startApp();
        // Restaurar la última sección visitada tras una recarga (no forzar reportes)
        const lastPanel = sessionStorage.getItem("oba_last_panel");
        if (lastPanel && lastPanel !== "inicio") setTimeout(() => sp(lastPanel), 30);
      });
    }
  } else {
    setLoginMode(true);
  }
}

// Lightweight startup for report writers: no renderAll, no facturas,
// no seeds — straight to the report form.
function _repOnlyStart() {
  _applyRepOnlyMode();
  const label = formatLongDate(new Date());
  const hd = document.getElementById("hdate");
  if (hd) hd.textContent = label;
  sp("reportes");
}

let _dataReady = Promise.resolve();

async function initData() {
  try {
    const canUseFirebase = typeof firebase !== "undefined" && location.protocol !== "file:";
    if (canUseFirebase) {
      firebase.initializeApp(FB);
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
      storageMode = "firebase";
      // Load data in the background: the login form shows immediately
      // and startApp() waits on _dataReady.
      const _timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000));
      _dataReady = Promise.race([loadFromFirebase(), _timeout])
        .catch((error) => {
          console.warn("Firebase no disponible, usando local:", error);
          storageMode = "local";
          loadFromLocal();
        })
        .then(() => { computeNextId(); });
    } else {
      loadFromLocal();
      storageMode = "local";
      computeNextId();
    }
  } catch (error) {
    console.warn("Firebase no disponible, usando local:", error);
    storageMode = "local";
    loadFromLocal();
    computeNextId();
  }
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
  const usrInput = document.getElementById("usr");
  const pwdInput = document.getElementById("pwd");
  const errorEl  = document.getElementById("le");
  if (!pwdInput) return;
  const usr = (usrInput?.value || "").trim();
  const pwd = pwdInput.value;

  const _enterApp = (repOnly) => {
    sessionStorage.setItem("oba-auth", "1");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("visible");
    setLoginMode(false);
    const greetEl = document.getElementById("greet-sub");
    if (greetEl) greetEl.innerHTML = getGreeting();
    if (repOnly) {
      _repOnlyStart();
    } else {
      _dataReady.then(() => startApp());
    }
  };

  // Login con cuenta personal (email + contraseña → Firebase Auth)
  if (usr.includes("@")) {
    _loginConEmail(usr, pwd, errorEl, _enterApp);
    return;
  }

  if (usr === REPORTES_USER && pwd === REPORTES_PWD) {
    sessionStorage.setItem(REPORTES_SESSION_KEY, "1");
    sessionStorage.setItem(REPORTES_ONLY_KEY, "1");
    _enterApp(true);
  } else if (!usr && pwd === PWD) {
    _enterApp(false);
  } else if (usr && !(usr === REPORTES_USER && pwd === REPORTES_PWD)) {
    if (errorEl) { errorEl.textContent = "Usuario o contraseña incorrectos"; setTimeout(() => { errorEl.textContent = ""; }, 2500); }
  } else if (errorEl) {
    errorEl.textContent = "Contraseña incorrecta";
    setTimeout(() => { errorEl.textContent = ""; }, 2000);
  }
}

// ── Gestión de usuarios (solo admins) ──────────────────
function _updateUsersBtn() {
  const btn = document.getElementById("users-btn");
  if (btn) btn.style.display = _esAdmin() ? "" : "none";
}

async function oUsuarios() {
  if (!_esAdmin()) return;
  oModal(`<h3>Usuarios</h3><p style="color:var(--muted);font-size:13px">Cargando…</p>`);
  try {
    const snap = await db.collection("usuarios").orderBy("nombre").get();
    const usuarios = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    _renderUsuariosModal(usuarios);
  } catch (e) {
    oModal(`<h3>Usuarios</h3><p style="color:var(--red);font-size:13px">Error cargando usuarios: ${safeText(e.message)}</p>`);
  }
}

function _renderUsuariosModal(usuarios) {
  const restChecks = Object.keys(REST_THEME_MAP).map(r =>
    `<label class="nu-check"><input type="checkbox" class="nu-rest-check" value="${safeText(r)}"> ${safeText(r)}</label>`
  ).join("");
  const filas = usuarios.map(u => {
    const rests = (Array.isArray(u.restaurantes) && u.restaurantes.length) ? u.restaurantes.join(", ") : (u.restaurante || "");
    return `
    <div class="usr-row${u.activo === false ? " usr-off" : ""}">
      <div class="usr-info">
        <strong>${safeText(u.nombre || "—")}</strong>
        <span>${safeText(u.email || "")}</span>
        <span class="usr-meta">${safeText(u.rol || "")}${rests ? " · " + safeText(rests) : ""}${u.activo === false ? " · DESACTIVADA" : ""}</span>
      </div>
      <button class="ghost-btn ghost-btn-sm" onclick="toggleUsuario('${safeText(u.uid)}', ${u.activo === false ? "true" : "false"})">${u.activo === false ? "Reactivar" : "Desactivar"}</button>
    </div>`;
  }).join("") || `<p style="color:var(--muted);font-size:13px">No hay usuarios todavía.</p>`;

  oModal(`
    <h3>Usuarios</h3>
    <div class="usr-list">${filas}</div>
    <h4 style="margin:18px 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Crear usuario</h4>
    <div class="fr"><label>Nombre</label><input class="field-input" id="nu-nombre" placeholder="Nombre y apellido"></div>
    <div class="fr"><label>Email</label><input class="field-input" id="nu-email" type="email" placeholder="correo@ejemplo.com"></div>
    <div class="fr"><label>Contraseña temporal</label><input class="field-input" id="nu-pwd" placeholder="Mínimo 6 caracteres"></div>
    <div class="fr"><label>Rol</label>
      <select class="field-select" id="nu-rol" onchange="document.getElementById('nu-rest-wrap').style.display = this.value==='encargado' ? '' : 'none'">
        <option value="encargado">Encargado (su restaurante + sus reportes)</option>
        <option value="reportes">Solo reportes</option>
        <option value="admin">Administrador (todo)</option>
      </select>
    </div>
    <div class="fr" id="nu-rest-wrap"><label>Restaurante(s) — marca uno o varios</label>
      <div class="nu-rest-checks">${restChecks}</div>
    </div>
    <button class="primary-btn" style="width:100%;margin-top:8px" id="nu-crear" onclick="crearUsuario()">Crear usuario</button>
    <div class="login-error" id="nu-err" style="margin-top:8px"></div>
    <h4 style="margin:22px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Recordatorio mensual</h4>
    <p style="font-size:12px;color:var(--muted);margin:0 0 10px">El día 5 de cada mes, cada encargado con reportes pendientes recibe un correo con un botón para hacerlo al momento.</p>
    <button class="secondary-btn" style="width:100%" id="rec-test-btn" onclick="probarRecordatorio()">📬 Enviarme una prueba a mi correo</button>
  `);
}

async function probarRecordatorio() {
  const btn = document.getElementById("rec-test-btn");
  try {
    if (btn) { btn.disabled = true; btn.textContent = "Enviando prueba…"; }
    const token = await firebase.auth().currentUser.getIdToken();
    const res = await fetch(`${FN_BASE}/recordatorioReporteTest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    toast(`✓ Prueba enviada a tu correo (${data.enviados?.length || 0} email${data.enviados?.length === 1 ? "" : "s"}, mes: ${data.mes})`, "ok");
  } catch (e) {
    console.error("probarRecordatorio:", e);
    toast("No se pudo enviar la prueba: " + e.message, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "📬 Enviarme una prueba a mi correo"; }
  }
}

async function crearUsuario() {
  const nombre = document.getElementById("nu-nombre")?.value.trim();
  const email = document.getElementById("nu-email")?.value.trim().toLowerCase();
  const pwd = document.getElementById("nu-pwd")?.value;
  const rol = document.getElementById("nu-rol")?.value;
  const restaurantes = rol === "encargado"
    ? Array.from(document.querySelectorAll(".nu-rest-check:checked")).map(c => c.value)
    : [];
  const err = document.getElementById("nu-err");
  const btn = document.getElementById("nu-crear");
  const showErr = (m) => { if (err) err.textContent = m; };
  if (!nombre || !email || !email.includes("@")) { showErr("Nombre y email válido son obligatorios."); return; }
  if (!pwd || pwd.length < 6) { showErr("La contraseña debe tener al menos 6 caracteres."); return; }
  if (rol === "encargado" && !restaurantes.length) { showErr("Marca al menos un restaurante."); return; }
  try {
    if (btn) { btn.disabled = true; btn.textContent = "Creando…"; }
    const token = await firebase.auth().currentUser.getIdToken();
    const res = await fetch(`${FN_BASE}/crearUsuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ nombre, email, password: pwd, rol, restaurante: restaurantes[0] || "" })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    // La lista completa de restaurantes se guarda directamente en el perfil
    if (data.uid && restaurantes.length) {
      await db.collection("usuarios").doc(data.uid).update({ restaurantes }).catch(() => {});
    }
    toast(`Usuario ${nombre} creado.`, "ok");
    oUsuarios();
  } catch (e) {
    console.error("crearUsuario:", e);
    showErr("No se pudo crear: " + e.message);
    if (btn) { btn.disabled = false; btn.textContent = "Crear usuario"; }
  }
}

async function toggleUsuario(uid, activar) {
  try {
    const token = await firebase.auth().currentUser.getIdToken();
    const res = await fetch(`${FN_BASE}/actualizarUsuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ uid, activo: activar })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    toast(activar ? "Cuenta reactivada." : "Cuenta desactivada.", "ok");
    oUsuarios();
  } catch (e) {
    toast("No se pudo actualizar: " + e.message, "error");
  }
}

// ── Login con cuenta personal ──────────────────────────
async function _loginConEmail(email, pwd, errorEl, _enterApp) {
  const showErr = (msg) => {
    if (errorEl) { errorEl.textContent = msg; setTimeout(() => { errorEl.textContent = ""; }, 3500); }
  };
  if (typeof firebase === "undefined" || !firebase.auth || storageMode !== "firebase") {
    showErr("El acceso con cuenta no está disponible ahora mismo.");
    return;
  }
  try {
    const cred = await firebase.auth().signInWithEmailAndPassword(email.toLowerCase(), pwd);
    const perfil = await _cargarPerfilUsuario(cred.user);
    if (!perfil) {
      await firebase.auth().signOut().catch(() => {});
      showErr("Tu cuenta no está dada de alta en la intranet. Habla con un administrador.");
      return;
    }
    if (perfil.activo === false) {
      await firebase.auth().signOut().catch(() => {});
      showErr("Esta cuenta está desactivada.");
      return;
    }
    sessionStorage.setItem(ROL_KEY, perfil.rol || "reportes");
    sessionStorage.setItem(USER_NOMBRE_KEY, perfil.nombre || "");
    const rests = (Array.isArray(perfil.restaurantes) && perfil.restaurantes.length)
      ? perfil.restaurantes
      : (perfil.restaurante ? [perfil.restaurante] : []);
    sessionStorage.setItem(ENC_REST_KEY, JSON.stringify(rests));
    if (perfil.rol === "admin") {
      _enterApp(false);
    } else if (perfil.rol === "encargado") {
      sessionStorage.setItem(REPORTES_SESSION_KEY, "1"); // sus reportes, sin gate extra
      sessionStorage.setItem("oba-auth", "1");
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("app").classList.add("visible");
      setLoginMode(false);
      _encargadoStart();
    } else {
      sessionStorage.setItem(REPORTES_SESSION_KEY, "1");
      sessionStorage.setItem(REPORTES_ONLY_KEY, "1");
      _enterApp(true);
    }
  } catch (err) {
    console.warn("login email:", err.code || err.message);
    showErr(err.code === "auth/too-many-requests"
      ? "Demasiados intentos. Espera unos minutos."
      : "Email o contraseña incorrectos.");
  }
}

// Carga el perfil (usuarios/{uid}). Bootstrap: si la colección está vacía,
// la primera persona que inicia sesión se convierte en administrador.
async function _cargarPerfilUsuario(user) {
  const ref = db.collection("usuarios").doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data();
  const any = await db.collection("usuarios").limit(1).get();
  if (any.empty) {
    const perfil = {
      nombre: user.email.split("@")[0],
      email: user.email,
      rol: "admin",
      restaurante: "",
      activo: true,
      creado: firebase.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(perfil);
    return perfil;
  }
  return null;
}

// Modo encargado: sus restaurantes en Cañitas Gastro + sus reportes
function _encargadoStart() {
  document.getElementById("app")?.classList.add("enc-mode");
  document.body.classList.add("enc-mode");
  if (_encRestList().length <= 1) document.getElementById("app")?.classList.add("enc-single");
  const label = formatLongDate(new Date());
  const hd = document.getElementById("hdate");
  if (hd) hd.textContent = label;
  const greetEl = document.getElementById("greet-sub");
  if (greetEl) greetEl.innerHTML = getGreeting();
  _dataReady.then(() => {
    startApp();
    // Restaurar su última sección (grupo o reportes); por defecto, su restaurante
    const lastPanel = sessionStorage.getItem("oba_last_panel");
    sp(lastPanel === "reportes" ? "reportes" : "grupo");
  });
}

function _encRestList() {
  const raw = sessionStorage.getItem(ENC_REST_KEY) || "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [raw]; // sesiones antiguas guardaban el nombre a pelo
  }
}

function _encEmpresaIds() {
  const themes = _encRestList().map((r) => REST_THEME_MAP[r]).filter(Boolean);
  return (D.empresas || []).filter((e) => themes.includes(e.theme)).map((e) => e.id);
}

function _esEncargado() {
  return sessionStorage.getItem(ROL_KEY) === "encargado";
}

function _esAdmin() {
  return sessionStorage.getItem(ROL_KEY) === "admin";
}

function logout() {
  if (typeof firebase !== "undefined" && firebase.auth) firebase.auth().signOut().catch(() => {});
  sessionStorage.removeItem(ROL_KEY);
  sessionStorage.removeItem(ENC_REST_KEY);
  sessionStorage.removeItem(USER_NOMBRE_KEY);
  document.getElementById("app")?.classList.remove("enc-mode");
  document.getElementById("app")?.classList.remove("enc-single");
  document.body.classList.remove("enc-mode");
  sessionStorage.removeItem("oba-auth");
  sessionStorage.removeItem(REPORTES_SESSION_KEY);
  sessionStorage.removeItem(REPORTES_ONLY_KEY);
  document.getElementById("app")?.classList.remove("rep-only");
  document.body.classList.remove("rep-only");
  _repView = "dashboard";
  const repInner = document.getElementById("rep-inner");
  if (repInner) repInner.innerHTML = "";
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app").classList.remove("visible");
  setLoginMode(true);
  const pwd = document.getElementById("pwd");
  if (pwd) pwd.value = "";
  const usr = document.getElementById("usr");
  if (usr) usr.value = "";
}

function seedRestRecetas(col) {
  const colKey = `${col}_recetas`;
  const defaults = DEFAULTS[colKey];
  if (!defaults || !defaults.length) return;
  if (!confirm(`¿Cargar las ${defaults.length} recetas de fábrica en ${col.toUpperCase()}? Esto reemplazará el recetario actual.`)) return;
  D[colKey] = JSON.parse(JSON.stringify(defaults));
  save(colKey);
  const empId = D.empresas?.find(e => e.theme === col)?.id;
  if (empId) rEmpresaDetalle(empId, 'recetario');
  toast(`✓ ${defaults.length} recetas cargadas`);
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

function startApp() {
  _updateUsersBtn();
  _ensureLogoDataUrl().catch(() => {}); // precalienta el logo para impresión/PDF
  seedHabitaciones();
  seedEmpresas();
  seedDescargablesInternos();
  seedInventario();
  seedFermentos();
  migrateInventario();
  const label = formatLongDate(new Date());
  document.getElementById("hdate").textContent = label;
  document.getElementById("ifecha").textContent = label;

  // Escape key closes the topmost open overlay
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.getElementById("modal")?.classList.contains("open"))           { cModal();           return; }
    if (document.getElementById("restdet")?.classList.contains("open"))        { closeRestRecipe();  return; }
    if (document.getElementById("rdet")?.classList.contains("open"))           { cRD();              return; }
    if (document.getElementById("pfdet")?.classList.contains("open"))          { cPF();              return; }
    if (document.getElementById("huerta-detail-overlay")?.classList.contains("open")) { closeHuertaDetail(); return; }
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
  if (_deepCaja) setTimeout(_applyDeepCaja, 300);
}

function renderAll() {
  if (!document.getElementById("app").classList.contains("visible")) return;
  const fns = [
    rInicio, rRec, rPedLista, calRender, rPrac, rProj, rAv, rGrupo,
    () => { if (pedT === "resumen") rPedRes(); },
    () => { if (pedT === "prov") rPedProv(); },
    () => { if (pedT === "historial") rPedHistorial(); }
  ];
  fns.forEach((fn) => { try { fn(); } catch(e) { console.warn("renderAll error:", e); } });
}

function sp(id) {
  if (sessionStorage.getItem(REPORTES_ONLY_KEY) === "1" && id !== "reportes") return;
  if (_esEncargado() && id !== "grupo" && id !== "reportes") return;
  // Recordar la sección actual para restaurarla tras una recarga automática
  try { sessionStorage.setItem("oba_last_panel", id); } catch (e) {}
  if (id === "grupo") { showGrupoPanel(); return; }
  if (id === "id") { showIDPanel(); return; }
  if (id === "huerta") { showHuertaPanel(); return; }
  if (id === "partidas") { showPartidasPanel(); return; }
  if (id === "reportes") { showReportesPanel(); return; }
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

function _safeCloseModal() {
  const mi = document.getElementById("mi");
  if (!mi) { cModal(); return; }
  const hasContent = Array.from(mi.querySelectorAll("input,textarea,select")).some((el) => {
    if (el.type === "checkbox" || el.type === "file" || el.type === "hidden") return false;
    return (el.value || "").trim().length > 0;
  });
  if (hasContent && !confirm("¿Cerrar sin guardar? Los cambios se perderán.")) return;
  cModal();
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
  const upcoming = [...D.eventos]
    .filter((e) => e.fecha >= today())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 3);
  const recentNotices = [...D.avisos].reverse().slice(0, 2);

  let feed = "";
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
    const enMenu = recipe.enMenu !== false;
    return `
      <article class="card${enMenu ? "" : " card-off-menu"}">
        <div class="card-menu-row">
          ${bsec(recipe.seccion)}
          <button class="menu-toggle${enMenu ? " menu-toggle-on" : ""}" onclick="toggleEnMenu(${recipe.id})" title="${enMenu ? "En carta · pulsa para retirar" : "Fuera de carta · pulsa para activar"}">
            <span class="menu-toggle-knob"></span>
            <span class="menu-toggle-label">${enMenu ? "En carta" : "Fuera de carta"}</span>
          </button>
        </div>
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

  // Banner "datos PDF disponibles" (mismo mecanismo que las fichas de restaurante)
  const nomKeyM = _pdfKey(recipe.nombre || "");
  const pdfDataM = _PDF_RECIPES[nomKeyM];
  const recipeStepsM = (recipe.pasos||[]).length + (recipe.subrecetas||[]).reduce((n,s)=>n+(s.pasos||[]).length,0);
  const pdfStepsM = pdfDataM ? (pdfDataM.pasos||[]).length + (pdfDataM.subrecetas||[]).reduce((n,s)=>n+(s.pasos||[]).length,0) : 0;
  const pdfBannerM = (pdfDataM && recipeStepsM < pdfStepsM) ? `
    <div id="pdf-import-banner" style="background:#fff8e1;border:1.5px solid #f9a825;border-radius:12px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px"><strong>Datos del PDF disponibles</strong><div style="font-size:13px;color:#7a6a20">Esta ficha se puede completar con la receta oficial en PDF (subrecetas, cantidades y pasos).</div></div>
      <button class="primary-btn" id="pdf-import-btn" onclick="applyPdfRecipeMain(${recipe.id})">Aplicar datos PDF</button>
    </div>` : "";

  return `
    <div class="recipe-brand">
      <img class="logo-mark logo-mark-black" src="${logoWhiteUrl()}" alt="OBA">
    </div>
    ${pdfBannerM}
    ${photo}
    ${scaleBar}
    <div class="rs">
      <h4>Información general</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
        ${recipe.seccion ? `<div><strong>Sección:</strong> ${safeText(recipe.seccion)}</div>` : ""}
        ${recipe.temporada ? `<div><strong>Temporada:</strong> ${safeText(recipe.temporada)}</div>` : ""}
        ${recipe.raciones ? `<div class="rec-raciones"><strong>Raciones:</strong> ${safeText(recipe.raciones)}</div>` : ""}
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

// CSS compartido para imprimir y guardar en PDF (recetario y fichas de restaurante)
function _printRecipeCSS() {
  return `
    @page{size:A4;margin:15mm 15mm 16mm 15mm}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#1a1a1a;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact}

    /* Cabecera de la ficha: logo OBA arriba, limpio y alineado */
    .print-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding-bottom:10px;margin-bottom:14px;border-bottom:2px solid #1a1a1a}
    .print-head-logo{width:88px;height:auto;display:block;flex-shrink:0}
    .print-head-txt{min-width:0}
    .print-head-tag{font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:#8a8478;margin-bottom:3px}
    h1{font-size:22px;line-height:1.12;margin:0;font-weight:700;letter-spacing:-.01em}
    .print-desc{color:#666;font-size:11.5px;margin:5px 0 0}

    h4{font-size:10px;text-transform:uppercase;letter-spacing:.13em;color:#405735;border-bottom:1px solid #d8d3c8;padding-bottom:4px;margin:0 0 9px}
    p{margin:0 0 8px}
    strong{font-size:inherit}

    /* Cada sección/subreceta no se parte entre páginas */
    .rs{margin-bottom:16px;break-inside:avoid;page-break-inside:avoid}

    .ig{display:grid;grid-template-columns:minmax(0,1fr) 60px 70px;gap:3px 12px;align-items:baseline;font-size:11px;margin-bottom:6px}
    .ig>div{padding:2px 0;border-bottom:1px dotted #e3ded3}
    .ih{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8a8478;border-bottom:1px solid #cfc9bd !important;font-weight:700}

    .sl{list-style:none;padding:0;margin:0}
    .sl li{display:flex;gap:9px;margin-bottom:5px;padding:7px 10px;background:#f7f5ef;border-radius:4px;font-size:10.5px;break-inside:avoid;page-break-inside:avoid}
    .sn{font-weight:700;color:#405735;min-width:15px;font-variant-numeric:tabular-nums}

    .ca{display:flex;gap:6px;flex-wrap:wrap}
    .badge{border:1px solid #b84337;color:#b84337;padding:2px 8px;border-radius:999px;font-size:9.5px;font-weight:600}
    .notice{padding:10px 12px;border-left:3px solid #5f7f4c;background:#eef3ea;font-size:10px;border-radius:0 4px 4px 0;break-inside:avoid}

    img{max-width:100%}

    /* Ocultar en impresión lo que no corresponde a la ficha */
    .recipe-brand,.scale-bar,#pdf-import-banner,.rep-detail-actions,.rec-raciones{display:none !important}
  `;
}

async function _openPrintDoc(recipe, markup) {
  const w = window.open("", "_blank");
  if (!w) { toast("Permite las ventanas emergentes para imprimir.", "error"); return; }
  const printLogo = await _ensureLogoDataUrl();
  const desc = recipe.descripcion ? `<p class="print-desc">${safeText(recipe.descripcion)}</p>` : "";
  w.document.write(`<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${safeText(recipe.nombre)}</title>
    <style>${_printRecipeCSS()}</style>
  </head>
  <body>
    <div class="print-head">
      <div class="print-head-txt">
        <div class="print-head-tag">Recetario OBA</div>
        <h1>${safeText(recipe.nombre)}</h1>
        ${desc}
      </div>
      <img class="print-head-logo" src="${printLogo}" alt="OBA">
    </div>
    ${markup}
  </body>
  </html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

function printFicha() {
  if (!activeRecipeId) return;
  const recipe = D.recipes.find((item) => item.id === activeRecipeId);
  if (!recipe) return;
  _openPrintDoc(recipe, printRecipeMarkup);
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

function toggleEnMenu(id) {
  const recipe = D.recipes.find((item) => item.id === id);
  if (!recipe) return;
  recipe.enMenu = recipe.enMenu === false ? true : false;
  save("recipes");
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
  const titleSide = document.getElementById("cal-title-side");
  if (titleSide) titleSide.textContent = `${MESES[cM]} ${cY}`;
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
    const events = D.eventos.filter((item) => {
      if (item.tipo === "vacaciones" && item.fechaInicio && item.fechaFin) {
        return dateStr >= item.fechaInicio && dateStr <= item.fechaFin;
      }
      return item.fecha === dateStr;
    });
    const trainees = D.practicantes.filter((item) => item.fechaEntrada === dateStr);
    const hasVac = events.some((item) => item.tipo === "vacaciones");
    let content = events.map((item) => {
      if (item.tipo === "vacaciones") {
        return `<div class="ce-vac">${safeText(item.persona || "Vacaciones")}</div>`;
      }
      const cls = item.tipo === "especial" ? "ce-esp" : item.urgente || item.tipo === "urgente" ? "ce-urg" : "ce";
      return `<div class="${cls}">${item.tipo === "especial" ? `${ico('star',12)} ` : item.urgente ? `${ico('warning',12)} ` : ""}${safeText(item.titulo)}</div>`;
    }).join("");
    content += trainees.map((item) => `<div class="ce-prac" onclick="event.stopPropagation();oPF(${item.id})">${ico('user', 14)} ${safeText(item.nombre)}</div>`).join("");
    html += `<div class="cd${dateStr === today() ? " today" : ""}${hasVac ? " has-vac" : ""}" onclick="openDayPanel('${dateStr}')"><div class="cdn">${day}</div>${content}</div>`;
  }

  const remaining = (7 - ((startDay + last.getDate()) % 7)) % 7;
  for (let i = 1; i <= remaining; i += 1) {
    html += `<div class="cd om"><div class="cdn">${i}</div></div>`;
  }

  document.getElementById("cbody").innerHTML = html;

  const mPrefix = `${cY}-${String(cM + 1).padStart(2, "0")}`;
  const monthlyEvents = D.eventos.filter((item) => {
    if (item.tipo === "vacaciones" && item.fechaInicio && item.fechaFin) {
      return item.fechaInicio.startsWith(mPrefix) || item.fechaFin.startsWith(mPrefix) ||
        (item.fechaInicio <= mPrefix + "-01" && item.fechaFin >= mPrefix + "-31");
    }
    return item.fecha.startsWith(mPrefix);
  });
  const monthlyTrainees = D.practicantes.filter((item) => item.fechaEntrada?.startsWith(mPrefix));
  let listHtml = "";
  listHtml += monthlyEvents.map((item) => {
    const delBtn = `<button class="btn btn-s btn-d" style="margin-top:8px;font-size:11px" onclick="dEv(${item.id})">Eliminar</button>`;
    if (item.tipo === "vacaciones") {
      return `<div class="notice" style="border-left-color:#d97706;background:#fff7ed">
        <strong>Vacaciones · ${safeText(item.persona || "")}</strong>
        ${item.nota ? `<div>${safeText(item.nota)}</div>` : ""}
        <div class="nd">${safeText(item.fechaInicio)} → ${safeText(item.fechaFin)}</div>
        ${delBtn}
      </div>`;
    }
    return `<div class="notice${item.urgente ? " urgent" : ""}"><strong>${safeText(item.titulo)}</strong><div>${safeText(item.nota || "Evento")}</div><div class="nd">${safeText(item.fecha)}</div>${delBtn}</div>`;
  }).join("");
  listHtml += monthlyTrainees.map((item) => `<div class="notice" style="border-left-color:#335d87;background:#e7eff7;cursor:pointer" onclick="oPF(${item.id})"><strong>Practicante: ${safeText(item.nombre)}</strong><div>${safeText(item.partida || "Sin partida asignada")}</div><div class="nd">${safeText(item.fechaEntrada)}</div></div>`).join("");
  document.getElementById("clist").innerHTML = listHtml || `<div class="notice"><strong>Mes despejado</strong><div>No hay eventos destacados en este mes.</div></div>`;
}

function oCM(dateValue) {
  const d = typeof dateValue === "string" ? dateValue : today();
  oModal(`
    <h3>Nuevo evento</h3>
    <div class="fr"><label>Tipo</label>
      <select id="etipo" onchange="toggleVacFields()">
        <option value="normal">Normal</option>
        <option value="especial">Especial</option>
        <option value="urgente">Urgente</option>
        <option value="vacaciones">Vacaciones</option>
      </select>
    </div>
    <div class="fr" id="vac-persona-row" style="display:none"><label>Persona *</label><input id="epersona" placeholder="Nombre del trabajador"></div>
    <div class="fr"><label id="ef-label">Fecha</label><input type="date" id="ef" value="${safeText(d)}"></div>
    <div class="fr" id="vac-fin-row" style="display:none"><label>Fecha fin *</label><input type="date" id="effin" value="${safeText(d)}"></div>
    <div class="fr" id="ev-titulo-row"><label>Título *</label><input id="et"></div>
    <div class="fr"><label>Notas</label><input id="enota"></div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cancelar</button><button class="primary-btn" onclick="sEv()">Guardar</button></div>`);
}

function dEv(id) {
  if (!confirm("¿Eliminar este evento?")) return;
  D.eventos = D.eventos.filter((item) => item.id !== id);
  save("eventos");
  cModal();
}

function openDayPanel(dateStr) {
  const DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const label = `${DIAS[dow]}, ${d} de ${MESES[m - 1]} ${y}`;

  const dayEvents = D.eventos.filter((item) => {
    if (item.tipo === "vacaciones" && item.fechaInicio && item.fechaFin) {
      return dateStr >= item.fechaInicio && dateStr <= item.fechaFin;
    }
    return item.fecha === dateStr;
  });
  const trainees = D.practicantes.filter((item) => item.fechaEntrada === dateStr);

  const evHtml = dayEvents.map((item) => {
    const badge = item.tipo === "vacaciones"
      ? `<span class="ce-vac" style="display:inline-block;margin-bottom:0">${safeText(item.persona || "Vacaciones")}</span>`
      : item.tipo === "especial"
        ? `<span class="ce-esp" style="display:inline-block;margin-bottom:0">${safeText(item.titulo)}</span>`
        : item.urgente
          ? `<span class="ce-urg" style="display:inline-block;margin-bottom:0">${safeText(item.titulo)}</span>`
          : `<span class="ce" style="display:inline-block;margin-bottom:0">${safeText(item.titulo)}</span>`;
    const rango = item.tipo === "vacaciones" ? `<div class="nd" style="margin-top:4px">${safeText(item.fechaInicio)} → ${safeText(item.fechaFin)}</div>` : "";
    const nota = item.nota ? `<div style="font-size:12px;color:var(--muted);margin-top:4px">${safeText(item.nota)}</div>` : "";
    return `<div style="padding:10px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
      <div>${badge}${rango}${nota}</div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-s btn-o" onclick="editEv(${item.id},'${dateStr}')">Editar</button>
        <button class="btn btn-s btn-d" onclick="dEv(${item.id})">Eliminar</button>
      </div>
    </div>`;
  }).join("");

  const pracHtml = trainees.map((item) => `
    <div style="padding:10px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:10px">
      <span class="ce-prac" style="display:inline-block;margin-bottom:0">${ico('user',12)} ${safeText(item.nombre)}</span>
      <button class="btn btn-s btn-o" onclick="cModal();oPF(${item.id})">Ver perfil</button>
    </div>`).join("");

  const empty = !dayEvents.length && !trainees.length
    ? `<div style="color:var(--muted);font-size:13px;padding:16px 0">Sin eventos este día.</div>` : "";

  oModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="margin:0;font-size:1rem">${label}</h3>
      <button class="primary-btn" style="font-size:12px;padding:6px 14px" onclick="oCM('${dateStr}')">+ Añadir</button>
    </div>
    ${evHtml}${pracHtml}${empty}
    <div class="mf" style="margin-top:16px"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>
  `);
}

function editEv(id, dateStr) {
  const item = D.eventos.find((e) => e.id === id);
  if (!item) return;
  const isVac = item.tipo === "vacaciones";
  oModal(`
    <h3>Editar evento</h3>
    <div class="fr"><label>Tipo</label>
      <select id="etipo" onchange="toggleVacFields()">
        <option value="normal"${item.tipo === "normal" ? " selected" : ""}>Normal</option>
        <option value="especial"${item.tipo === "especial" ? " selected" : ""}>Especial</option>
        <option value="urgente"${item.tipo === "urgente" ? " selected" : ""}>Urgente</option>
        <option value="vacaciones"${isVac ? " selected" : ""}>Vacaciones</option>
      </select>
    </div>
    <div class="fr" id="vac-persona-row" style="display:${isVac ? "" : "none"}"><label>Persona</label><input id="epersona" value="${safeText(item.persona || "")}"></div>
    <div class="fr"><label id="ef-label">${isVac ? "Fecha inicio" : "Fecha"}</label><input type="date" id="ef" value="${safeText(item.fechaInicio || item.fecha)}"></div>
    <div class="fr" id="vac-fin-row" style="display:${isVac ? "" : "none"}"><label>Fecha fin</label><input type="date" id="effin" value="${safeText(item.fechaFin || item.fecha)}"></div>
    <div class="fr" id="ev-titulo-row" style="display:${isVac ? "none" : ""}"><label>Título</label><input id="et" value="${safeText(item.titulo)}"></div>
    <div class="fr"><label>Notas</label><input id="enota" value="${safeText(item.nota || "")}"></div>
    <div class="mf">
      <button class="secondary-btn" onclick="openDayPanel('${dateStr}')">Volver</button>
      <button class="primary-btn" onclick="saveEditEv(${id},'${dateStr}')">Guardar</button>
    </div>`);
}

function saveEditEv(id, dateStr) {
  const item = D.eventos.find((e) => e.id === id);
  if (!item) return;
  const type = document.getElementById("etipo").value;
  const isVac = type === "vacaciones";
  const persona = isVac ? (document.getElementById("epersona")?.value.trim() || "") : "";
  const title = isVac ? (persona ? `Vacaciones · ${persona}` : "Vacaciones") : (document.getElementById("et")?.value.trim() || item.titulo);
  const fechaInicio = document.getElementById("ef").value;
  const fechaFin = isVac ? (document.getElementById("effin")?.value || fechaInicio) : fechaInicio;
  Object.assign(item, {
    titulo: title,
    fecha: fechaInicio,
    fechaInicio: isVac ? fechaInicio : undefined,
    fechaFin: isVac ? fechaFin : undefined,
    persona: isVac ? persona : undefined,
    tipo: type,
    urgente: type === "urgente",
    nota: document.getElementById("enota").value || ""
  });
  save("eventos");
  openDayPanel(dateStr);
}

function toggleVacFields() {
  const isVac = document.getElementById("etipo").value === "vacaciones";
  document.getElementById("vac-persona-row").style.display = isVac ? "" : "none";
  document.getElementById("vac-fin-row").style.display = isVac ? "" : "none";
  document.getElementById("ef-label").textContent = isVac ? "Fecha inicio *" : "Fecha";
  document.getElementById("ev-titulo-row").style.display = isVac ? "none" : "";
}

function sEv() {
  const type = document.getElementById("etipo").value;
  const isVac = type === "vacaciones";
  const persona = isVac ? (document.getElementById("epersona")?.value.trim() || "") : "";
  const title = isVac ? (persona ? `Vacaciones · ${persona}` : "Vacaciones") : (document.getElementById("et")?.value.trim() || "");
  if (!title) return alert("El título es obligatorio");
  if (isVac && !persona) return alert("Indica el nombre de la persona");
  const fechaInicio = document.getElementById("ef").value;
  const fechaFin = isVac ? (document.getElementById("effin")?.value || fechaInicio) : fechaInicio;
  if (isVac && fechaFin < fechaInicio) return alert("La fecha fin debe ser igual o posterior a la fecha inicio");
  D.eventos.push({
    id: nid++,
    titulo: title,
    fecha: fechaInicio,
    fechaInicio: isVac ? fechaInicio : undefined,
    fechaFin: isVac ? fechaFin : undefined,
    persona: isVac ? persona : undefined,
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
    _safeCloseModal();
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

/* ── Documentos internos imprimibles ─────────────────────
   Checklists/plantillas cuyo contenido vive en la propia intranet (no un
   enlace externo): se pueden abrir, imprimir o guardar como PDF, y el
   título de la tarjeta se puede renombrar libremente como cualquier otro
   descargable. */
const _INTERNAL_DOCS = {
  "checklist-tareas": {
    subtitulo: "Plantillas de reparto de tareas por turno",
    paginas: [
      {
        titulo: "Limpieza y Orden",
        intro: "Tareas específicas de cierre — escribe el nombre de cada persona en su casilla.",
        tabla: [
          { area: "Vajilla y Estanterías", tareas: ["Vajilla: limpiar superficies y reponer utensilios.", "Estanterías frías/calientes: limpiar superficies, que quede todo en su lugar."] },
          { area: "Producción", tareas: ["Limpieza de mesas.", "Orden total de la zona de producción.", "Retirada de basura."] },
          { area: "Cooler (Nevera de Servicio)", tareas: ["Limpieza de baldas y suelos de la nevera.", "Orden y tapado correcto de productos.", "FIFO riguroso etiquetado."] },
          { area: "Zona de Pica", tareas: ["Limpieza.", "Orden de la pica, que quede todo limpio y recogido."] },
          { area: "Bajos y Ventana", tareas: ["Bajos de servicio y del mesón de la ventana."] }
        ],
        notas: [
          { titulo: "Mantenimiento de Áreas Frías", texto: "Cada persona es responsable de que los equipos de frío bajo su cargo (neveras, cámaras, estanterías refrigeradas o congeladores) queden en perfecto estado de orden, limpieza y etiquetado al finalizar el turno." },
          { titulo: "Nevera de Servicio", texto: "Se debe prestar especial atención a que quede impecable, con los productos tapados y en sus ubicaciones correctas." },
          { titulo: "Supervisión Final", texto: "Ningún miembro del equipo podrá retirarse sin que el Encargado de Turno haya verificado visualmente su área asignada. Si el área no está en condiciones de cierre de turno, deberá permanecer hasta que esté correcta." }
        ]
      },
      {
        titulo: "Comida de Equipo",
        intro: "Tareas asignadas — escribe el nombre de cada persona en su casilla.",
        tabla: [
          { area: "Desmontar Comedor", tareas: ["Retirar platos, cubiertos y vasos usados.", "Limpiar mesas y superficies del comedor.", "Dejar el espacio listo para el montaje posterior."] },
          { area: "Guardar Comida", tareas: ["Almacenar correctamente los alimentos sobrantes.", "Tapar y etiquetar si es necesario.", "Asegurar que todo quede en nevera o despensa según corresponda."] },
          { area: "Lavado de Indumentaria", tareas: ["Lavar a fondo los gastronorm utilizados.", "Lavar y colgar la indumentaria de cocina empleada (delantales, paños, etc.)."] },
          { area: "Lavado de Gastros y Apoyo", tareas: ["Lavar los gastronorm junto con el compañero asignado a Lavado de Indumentaria.", "Ayudar con la limpieza de utensilios de cocina usados durante la preparación y el servicio de la comida."] },
          { area: "Montar el Comedor", tareas: ["Colocar vasos, cubiertos, platos y servilletas.", "Disponer todo lo necesario para que el equipo pueda comer.", "Verificar que el montaje esté completo antes del inicio de la comida."] }
        ],
        notas: [
          { titulo: "Revisión Final", texto: "Una vez montado el comedor, la persona a cargo del montaje avisa al equipo para que puedan sentarse a comer." },
          { titulo: "Aviso al Encargado", texto: "Avisar al Encargado si falta vajilla, cubiertos o algún elemento necesario para el montaje." }
        ]
      },
      {
        titulo: "Colada — Preparación y Montaje",
        intro: "Tareas específicas — escribe el nombre de cada persona en su casilla.",
        tabla: [
          { area: "Colada", tareas: ["Poner en marcha las lavadoras con los trapos y paños de cocina.", "Realizar las coladas necesarias para el turno."] },
          { area: "Producción y Servicio", tareas: ["Armar producción: preparar y montar producción con todos los utensilios necesarios.", "Rellenar Caja de Servicio: verificar y reponer el contenido de la caja de servicio."] },
          { area: "Apoyo a Colada", tareas: ["Ayudar a colgar las coladas recién lavadas.", "Ayudar a descolgar y recoger la ropa seca de las cuerdas."] },
          { area: "Apoyo a Colada y Secado", tareas: ["Ayudar a colgar la colada húmeda.", "Guardar ordenadamente todo lo que ya esté seco en su lugar correspondiente."] },
          { area: "Armado General de Cocina", tareas: ["Encender y montar todos los equipos (hornos, inducciones).", "Revisar que todas las áreas estén listas para el servicio."] }
        ],
        notas: [
          { titulo: "Prioridad de la Colada", texto: "Es fundamental tener trapos y paños limpios y secos antes de que comience el servicio fuerte. Si la lavadora termina su ciclo, se le da prioridad frente a otras tareas." },
          { titulo: "Verificación de Equipos", texto: "Al armar la cocina, cualquier anomalía en neveras, inducciones o extracción debe ser reportada al Encargado." },
          { titulo: "Trabajo en Equipo", texto: "Una vez finalizada la tarea individual, se espera que cada persona colabore con el armado general para agilizar la apertura." }
        ]
      }
    ]
  }
};

// Añade los documentos internos que aún no existan en Descargables (no
// pisa el título si el usuario ya lo renombró, ni duplica si ya está).
function seedDescargablesInternos() {
  if (!D.descargables) D.descargables = [];
  let changed = false;
  Object.entries(_INTERNAL_DOCS).forEach(([docKey, doc], i) => {
    const yaExiste = D.descargables.some((d) => d.docKey === docKey);
    if (!yaExiste) {
      D.descargables.push({
        id: nid++,
        titulo: doc.paginas?.[0]?.titulo && doc.paginas.length > 1 ? "Checklists de tareas por turno" : (doc.titulo || docKey),
        descripcion: doc.subtitulo || "",
        categoria: "Información general",
        docKey,
        url: "",
        fechaSubida: today()
      });
      changed = true;
    }
  });
  if (changed) save("descargables");
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
              ${d.docKey ? `<button class="btn btn-s btn-g desc-ver-btn" onclick="verDocInterno(${d.id})">Ver / Imprimir</button>` : ""}
              ${d.url ? `<a class="btn btn-s btn-g desc-ver-btn" href="${safeText(d.url)}" target="_blank" rel="noopener">Ver ↗</a>` : ""}
              ${d.url ? `<button class="desc-share-btn desc-share-wa" title="Enviar por WhatsApp" onclick="compartirDesc(${d.id},'wa')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.528 5.855L0 24l6.335-1.502A11.957 11.957 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.018-1.374l-.36-.213-3.757.89.946-3.658-.234-.376A9.818 9.818 0 1 1 12 21.818z"/></svg>
              </button>
              <button class="desc-share-btn desc-share-mail" title="Enviar por email" onclick="compartirDesc(${d.id},'email')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              </button>
              <button class="desc-share-btn desc-share-copy" title="Copiar enlace" onclick="compartirDesc(${d.id},'copy')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>` : ""}
              <button class="desc-share-btn desc-share-edit" title="Editar / Renombrar" onclick="oDescargableM(${d.id})">
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
  if (d.docKey) return ico('file-pdf', 16);
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
    ${d?.docKey ? `<div class="field-hint" style="margin-bottom:10px">Este documento se ve e imprime dentro de la intranet. Puedes cambiarle el título y la descripción libremente.</div>` : `
    <div class="fr">
      <label>Enlace al documento</label>
      <input id="durl" type="url" placeholder="https://drive.google.com/..." value="${safeText(d?.url || "")}">
      <div class="field-hint">Pega el enlace público del PDF (Google Drive, Dropbox, etc.)</div>
    </div>`}
    <div class="mf">
      ${d ? `<button class="btn btn-d btn-s" onclick="dDescargable(${id})">Eliminar</button>` : ""}
      <button class="secondary-btn" onclick="cModal()">Cancelar</button>
      <button class="primary-btn" onclick="sDescargable(${id || "null"})">Guardar</button>
    </div>`);
}

function sDescargable(id) {
  const titulo = document.getElementById("dtit").value.trim();
  if (!titulo) return alert("El título es obligatorio");
  const existente = id ? D.descargables.find((x) => x.id === id) : null;
  const payload = {
    titulo,
    descripcion: document.getElementById("ddesc").value.trim(),
    categoria: document.getElementById("dcat").value,
    url: existente?.docKey ? "" : (document.getElementById("durl")?.value.trim() || ""),
    fechaSubida: existente?.fechaSubida || today()
  };
  if (id) Object.assign(existente, payload);
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

// Vista de solo lectura + impresión/PDF de un documento interno (checklist).
// Las casillas de "Nombre" son editables: se escriben aquí, se guardan en
// el registro del descargable y salen ya rellenadas al imprimir.
function verDocInterno(docId) {
  const d = D.descargables.find((x) => x.id === docId);
  if (!d || !d.docKey) return;
  const doc = _INTERNAL_DOCS[d.docKey];
  if (!doc) return;
  const saved = d.nombres || {};
  const paginasHtml = (doc.paginas || []).map((p, pi) => `
    <div class="idoc-pagina">
      <h4 style="margin-bottom:2px">${safeText(p.titulo)}</h4>
      ${p.intro ? `<p style="color:var(--muted);font-size:12.5px;margin-bottom:10px">${safeText(p.intro)}</p>` : ""}
      <div class="idoc-tabla">
        <div class="idoc-th">Área asignada</div><div class="idoc-th">Nombre</div><div class="idoc-th">Tareas específicas</div>
        ${p.tabla.map((row, ri) => `
          <div class="idoc-td idoc-area">${safeText(row.area)}</div>
          <div class="idoc-td idoc-nombre"><input class="idoc-nombre-input" data-key="${pi}-${ri}" value="${safeText(saved[`${pi}-${ri}`] || "")}" placeholder="Escribe el nombre…"></div>
          <div class="idoc-td"><ul class="idoc-tareas">${row.tareas.map((t) => `<li>${safeText(t)}</li>`).join("")}</ul></div>
        `).join("")}
      </div>
      ${(p.notas || []).map((n) => `
        <div class="notice" style="margin-top:10px">
          <strong>${safeText(n.titulo)}</strong>
          <div>${safeText(n.texto)}</div>
        </div>`).join("")}
    </div>`).join("");

  oModal(`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px">
      <h3 style="margin:0">${safeText(d.titulo || doc.titulo || "Documento")}</h3>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button class="secondary-btn" onclick="guardarDocNombres(${docId})">Guardar</button>
        <button class="primary-btn" onclick="imprimirDocInterno(${docId})"><i class="ph-fill ph-printer"></i> Imprimir / PDF</button>
      </div>
    </div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:14px">Escribe el nombre de cada persona en su casilla. Se guarda para la próxima vez y aparece al imprimir.</p>
    <div class="idoc-preview">${paginasHtml}</div>
    <div class="mf"><button class="secondary-btn" onclick="cModal()">Cerrar</button></div>
  `);
}

// Recoge los nombres escritos en la vista previa
function _collectDocNombres() {
  const out = {};
  document.querySelectorAll(".idoc-nombre-input").forEach((inp) => {
    const v = inp.value.trim();
    if (v) out[inp.dataset.key] = v;
  });
  return out;
}

function guardarDocNombres(docId) {
  const d = D.descargables.find((x) => x.id === docId);
  if (!d) return;
  d.nombres = _collectDocNombres();
  save("descargables");
  toast("Nombres guardados ✓");
}

async function imprimirDocInterno(docId) {
  const d = D.descargables.find((x) => x.id === docId);
  if (!d || !d.docKey) return;
  const doc = _INTERNAL_DOCS[d.docKey];
  if (!doc) return;
  // Si el modal está abierto, guardar lo escrito antes de imprimir
  const nombres = document.querySelector(".idoc-nombre-input") ? _collectDocNombres() : (d.nombres || {});
  if (document.querySelector(".idoc-nombre-input")) { d.nombres = nombres; save("descargables"); }
  const tituloMostrado = d.titulo || doc.titulo || "Documento";
  const w = window.open("", "_blank");
  if (!w) { toast("Permite las ventanas emergentes para imprimir.", "error"); return; }
  const printLogo = await _ensureLogoDataUrl();
  const paginasHtml = (doc.paginas || []).map((p, pi) => `
    <section class="idoc-page"${pi > 0 ? ' style="page-break-before:always"' : ""}>
      <div class="print-head">
        <div class="print-head-txt">
          <div class="print-head-tag">${safeText(tituloMostrado)}</div>
          <h1>${safeText(p.titulo)}</h1>
          ${p.intro ? `<p class="print-desc">${safeText(p.intro)}</p>` : ""}
        </div>
        <img class="print-head-logo" src="${printLogo}" alt="OBA">
      </div>
      <table class="idoc-print-table">
        <thead><tr><th>Área asignada</th><th>Nombre</th><th>Tareas específicas</th></tr></thead>
        <tbody>
          ${p.tabla.map((row, ri) => `
            <tr>
              <td class="idoc-print-area">${safeText(row.area)}</td>
              <td class="idoc-print-nombre">${safeText(nombres[`${pi}-${ri}`] || "")}</td>
              <td><ul>${row.tareas.map((t) => `<li>${safeText(t)}</li>`).join("")}</ul></td>
            </tr>`).join("")}
        </tbody>
      </table>
      ${(p.notas || []).map((n) => `<div class="notice"><strong>${safeText(n.titulo)}</strong><div>${safeText(n.texto)}</div></div>`).join("")}
    </section>`).join("");

  w.document.write(`<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${safeText(tituloMostrado)}</title>
    <style>
      ${_printRecipeCSS()}
      .idoc-print-table{width:100%;border-collapse:collapse;margin-top:6px}
      .idoc-print-table th{text-align:left;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8a8478;border-bottom:1px solid #cfc9bd;padding:0 8px 5px 0}
      .idoc-print-table td{vertical-align:top;padding:8px 8px 8px 0;border-bottom:1px solid #e3ded3;font-size:11px}
      .idoc-print-area{font-weight:700;white-space:nowrap;width:22%}
      .idoc-print-nombre{width:20%;font-weight:600}
      .idoc-print-table ul{margin:0;padding-left:14px}
      .idoc-print-table li{margin-bottom:2px}
      .idoc-page{break-after:auto}
    </style>
  </head>
  <body>
    ${paginasHtml}
  </body>
  </html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
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

  if (_esEncargado()) {
    const encIds = _encEmpresaIds();
    if (!encIds.length) {
      document.getElementById("panel-grupo-body").innerHTML = `<div class="notice">Tu restaurante no está configurado. Habla con un administrador.</div>`;
    } else if (encIds.length === 1) {
      grupoView = encIds[0];
      rEmpresaDetalle(encIds[0]);
    } else {
      grupoSection = "restaurantes";
      if (typeof grupoView !== "number" || !encIds.includes(grupoView)) grupoView = "dashboard";
      rGrupo();
    }
    return;
  }

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
  const esEnc = _esEncargado();
  const encIds = esEnc ? _encEmpresaIds() : [];
  if (esEnc) {
    if (!encIds.length) return;
    if (encIds.length === 1) { grupoView = encIds[0]; rEmpresaDetalle(encIds[0]); return; }
    grupoSection = "restaurantes"; // sin kit de apertura para encargados
    if (typeof grupoView === "number" && !encIds.includes(grupoView)) grupoView = "dashboard";
  } else if (sessionStorage.getItem(CANITAS_SESSION_KEY) !== "1") {
    return; // panel locked — don't overwrite gate
  }
  if (grupoSection === "descargables") { rGrupoDescargables(); return; }
  if (typeof grupoView === "number") { rEmpresaDetalle(grupoView); return; }

  let empresas = (D.empresas || []).slice().sort((a, b) => a.id - b.id);
  if (esEnc) empresas = empresas.filter((e) => encIds.includes(e.id));
  const tabBar = esEnc ? "" : `
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
  if (_esEncargado() && !_encEmpresaIds().includes(id)) return;
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
          ${DEFAULTS[`${col}_recetas`]?.length && recetas.length === 0 ? `<button class="ghost-btn ghost-btn-sm" onclick="seedRestRecetas('${col}')" title="Cargar recetas de fábrica">${ico('database', 14)} Cargar recetas</button>` : ""}
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

const _PDF_RECIPES = {
  "calamar de anzuelo": {
    descripcion: "Tallarín de calamar de potera sobre crema de yema, salsa rancio ibérico con caldo de jamón y polvo de tinta de calamar.",
    alergenos: ["Huevos","Moluscos","Lácteos"],
    ingredientes: [
      {i:"Bote esencia Joselito curado",c:"",u:""},
      {i:"Garum colatura de anchoa",c:"",u:""}
    ],
    subrecetas: [
      {
        nombre:"Cebo calamar producido",
        descripcion:"Rendimiento: de 12 kg de calamar potera se obtienen 4,3 kg de calamar producido.",
        ingredientes:[{i:"Calamar potera",c:"12",u:"kg"}],
        pasos:[
          "Trabajar siempre con baños maría invertidos con hielo para mantener el calamar lo más frío posible.",
          "Retirar las patas, cabeza, cococha, tripas y pluma.",
          "Cortar a la mitad para abrir su cuerpo.",
          "Quitar la punta de arriba y cortar la base.",
          "Retirar perfectamente las dos telillas (exterior e interior).",
          "Desangrar en agua con hielo y un punto de sal para limpiar el resto de tinta.",
          "Superponer los cuerpos uno encima de otro y congelar en el abatidor en forma de bloque.",
          "Cortar en la corta fiambres para obtener el tallarín del tamaño deseado."
        ]
      },
      {
        nombre:"Cebo crema yema premium",
        descripcion:"",
        ingredientes:[
          {i:"Yemas de huevo",c:"15",u:"uds"},
          {i:"Pimienta",c:"2",u:"g"},
          {i:"Sal",c:"2",u:"g"}
        ],
        pasos:[
          "Separar las yemas de las claras y colarlas para eliminar cualquier resto mucoso.",
          "Salpimentar las yemas e introducirlas en una bolsa de vacío.",
          "Sellar la bolsa lo más al filo posible para poder estirar el contenido.",
          "Cocinar en horno con 100% de humedad a 68 °C durante 10 minutos.",
          "Verificar textura: al inclinar la bolsa el contenido debe descender lentamente con consistencia densa. Si no, cocinar 5 minutos más.",
          "Transferir a mangas pasteleras y conservar refrigerado."
        ]
      },
      {
        nombre:"Cebo caldo de jamón",
        descripcion:"",
        ingredientes:[
          {i:"Huesos de jamón",c:"20",u:"kg"},
          {i:"Agua",c:"40",u:"l"},
          {i:"Cebolla",c:"3",u:"uds"},
          {i:"Garbanzos",c:"1",u:"kg"}
        ],
        pasos:[
          "Hidratar los garbanzos 12 horas antes.",
          "Cortar la cebolla en mirepoix y quemar las caras en planchón o a la brasa.",
          "Escaldar 3 veces el codillo del jamón.",
          "Cocer todo junto durante 2 horas y 20 min.",
          "Reposar otras 2 horas todo junto a fuego lento.",
          "Colar, desgrasar y reducir."
        ]
      },
      {
        nombre:"Cebo polvo de tinta de calamar",
        descripcion:"",
        ingredientes:[{i:"Polvo de tinta de calamar",c:"",u:""}],
        pasos:["Poner el polvo de tinta de calamar dentro de unas gasas."]
      },
      {
        nombre:"Cebo salsa rancio ibérico",
        descripcion:"",
        ingredientes:[
          {i:"Nata líquida 35%",c:"150",u:"g"},
          {i:"Cebo caldo de jamón",c:"500",u:"g"},
          {i:"Patata agria",c:"120",u:"g"},
          {i:"Goma xantana",c:"0,6",u:"g"}
        ],
        pasos:[
          "Cocer la patata en cachelos en el caldo de jamón.",
          "Triturar.",
          "Añadir la nata y colar por chino fino."
        ]
      }
    ],
    pasos:[
      "Poner en el centro del plato un punto pequeño de crema yema.",
      "Poner la cantidad de tallarín de calamar encima del punto.",
      "Espolvorear polvo de tinta de calamar encima del tallarín.",
      "Salsear alrededor del tallarín."
    ],
    notas:"De 12 kg de calamar potera se obtienen 4,3 kg de calamar producido."
  },
  "concha fina": {
    descripcion: "Concha fina con gamba blanca curada en sal, sobre puré de zanahoria asada, zanahorias baby encurtidas y escabeche de zanahoria emulsionado con ajada.",
    alergenos: ["Pescado","Crustáceos","Moluscos","Lácteos"],
    subrecetas: [
      {
        nombre: "Cebo base encurtido",
        descripcion: "",
        ingredientes: [
          {i:"Vinagre de manzana",c:"300",u:"ml"},
          {i:"Azúcar",c:"100",u:"g"},
          {i:"Agua",c:"200",u:"ml"}
        ],
        pasos: [
          "Mezclar el vinagre de manzana junto con el azúcar y el agua.",
          "Dispensar unas gotas de ajada."
        ]
      },
      {
        nombre: "Cebo zanahorias baby encurtidas",
        descripcion: "",
        ingredientes: [
          {i:"Cebo base encurtido",c:"600",u:"g"},
          {i:"Mini zanahoria baby",c:"6",u:"bandejas"}
        ],
        pasos: [
          "Dejar macerar un mínimo de 48h en el encurtido. Retirar previamente el tallo y lijar para quitar la impureza exterior."
        ]
      },
      {
        nombre: "Cebo fumet",
        descripcion: "",
        ingredientes: [
          {i:"Ajo morado",c:"15",u:"g"},
          {i:"Cebolla",c:"180",u:"g"},
          {i:"Apio",c:"100",u:"g"},
          {i:"Verde de puerro",c:"150",u:"g"},
          {i:"Laurel",c:"2",u:"hojas"},
          {i:"Espinas de pescado",c:"1",u:"kg"},
          {i:"Agua",c:"1",u:"l"}
        ],
        pasos: [
          "Llevar las espinas a ebullición lo más rápido posible, tirar el agua y lavar las espinas 2 veces para quitar las impurezas que coagulan.",
          "Poner las espinas lavadas con la verdura en corte fino, añadir el agua y levantar a hervir suavemente 25 minutos. Dejar reposar 5 min.",
          "Colar sin apretar."
        ]
      },
      {
        nombre: "Escabeche de zanahorias",
        descripcion: "",
        ingredientes: [
          {i:"Cebo fumet",c:"350",u:"ml"},
          {i:"AOVE",c:"1,5",u:"l"},
          {i:"Ajo morado",c:"60",u:"g"},
          {i:"Laurel",c:"3",u:"g"},
          {i:"Cebolla",c:"300",u:"g"},
          {i:"Pimienta negra",c:"10",u:"g"},
          {i:"Vinagre de manzana",c:"180",u:"ml"},
          {i:"Vinagre de jerez",c:"170",u:"ml"},
          {i:"Zanahoria",c:"1",u:"kg"}
        ],
        pasos: [
          "Infusionar las pieles y tallos de zanahorias en el AOVE durante 30 minutos, junto con el laurel, cebolla, pimienta negra y ajo morado. Dejar reposar 30 minutos.",
          "Añadir todos los ácidos y cocer durante 8 minutos a fuego medio hasta conseguir el punto de acidez deseado.",
          "Colar con chino fino apretando.",
          "Mezclar la emulsión resultante con las zanahorias crudas peladas. Envasar al 100% en bolsas de vacío grandes con la zanahoria en plano.",
          "Cocinar en el horno a vapor a 85 °C durante 40 minutos.",
          "Abrir la bolsa, cortar la zanahoria en mirepoix y triturar con el líquido de la bolsa durante 1 minuto a velocidad 10. Colar."
        ]
      },
      {
        nombre: "Cebo ajado",
        descripcion: "",
        ingredientes: [
          {i:"AOVE",c:"1",u:"l"},
          {i:"Cebolla blanca",c:"600",u:"g"},
          {i:"Ajo",c:"160",u:"g"},
          {i:"Pimentón dulce",c:"30",u:"g"},
          {i:"Pimentón picante",c:"10",u:"g"},
          {i:"Vinagre de jerez",c:"100",u:"ml"}
        ],
        pasos: [
          "Introducir el pimentón con el aceite a 80 °C.",
          "Remover con una cuchara durante 30 segundos hasta que se cocine el pimentón.",
          "Añadir el vinagre de jerez y cocinar la mezcla durante 3 minutos.",
          "Colar por chino fino apretando la verdura correctamente.",
          "Decantar y quedarse con la parte grasa."
        ]
      },
      {
        nombre: "Cebo puré de zanahoria",
        descripcion: "",
        ingredientes: [
          {i:"Zanahoria",c:"3",u:"kg"},
          {i:"Mantequilla de oveja",c:"140",u:"g"}
        ],
        pasos: [
          "Marcar en brasa las zanahorias.",
          "Envolver en papel de aluminio y terminar de asar en el horno a 160 °C.",
          "Pasar por Thermomix sin que quede perfectamente triturado.",
          "Poner a punto de sal."
        ]
      }
    ],
    pasos: [
      "Poner en la base del plato 10 g de puré de zanahoria.",
      "Colocar encima del puré 1,5 unidades de zanahorias baby encurtidas.",
      "Montar los labios y el coral de la concha fina.",
      "Terminar con la gamba blanca, previamente curada en sal durante 3 min, en la forma en la que aparece en la foto.",
      "Añadir el escabeche de zanahoria emulsionado justo antes de emplatar y terminar con unas gotas de ajada cortadas con el escabeche justo antes de sacar el plato."
    ],
    notas: ""
  },
  "navaja de buceo": {
    descripcion: "Navaja de buceo abierta al vapor sobre geleé de caldo de navaja, con gazpachuelo de codium, escarcha de codium con nitrógeno y aceite de perejil y cebollino.",
    alergenos: ["Moluscos","Huevos","Frutos secos"],
    subrecetas: [
      {
        nombre: "Navaja de buceo fresca",
        descripcion: "",
        ingredientes: [
          {i:"Navaja de buceo",c:"50",u:"g"}
        ],
        pasos: [
          "Abrir la navaja al vapor, manteniendo el interior crudo."
        ]
      },
      {
        nombre: "Cebo base caldo navaja",
        descripcion: "",
        ingredientes: [
          {i:"Navaja Delta Ebro",c:"8",u:"kg"}
        ],
        pasos: [
          "Abrir en un sauté con aceite de ajo y a fuego medio las navajas, reservando todo el líquido de la propia navaja.",
          "Quitar la concha a todas las navajas, dejando el cuerpo limpio en una olla.",
          "Pasar el agua obtenida de la propia navaja por una malla fina para quitar toda la tierra.",
          "Por cada 3 kg de navaja añadir 4,6 l de agua junto con el propio caldo que va soltando la navaja."
        ]
      },
      {
        nombre: "Cebo geleé caldo navaja",
        descripcion: "",
        ingredientes: [
          {i:"Cebo base caldo navaja",c:"500",u:"ml"},
          {i:"Salsa kimchi Popo Umami",c:"35",u:"ml"},
          {i:"Limas (zumo)",c:"10",u:"ml"},
          {i:"Agar agar",c:"1",u:"g"},
          {i:"Instantgel",c:"26",u:"g"},
          {i:"Laurel",c:"1",u:"hoja"}
        ],
        pasos: [
          "Poner a infusionar el caldo de navaja junto con la hoja de laurel.",
          "Fuera del fuego añadir el instantgel y el agar agar, poner en ebullición durante 1 minuto.",
          "Turbinar.",
          "Añadir las limas junto al kimchi y rectificar de sal si es necesario."
        ]
      },
      {
        nombre: "Cebo gazpachuelo codium",
        descripcion: "",
        ingredientes: [
          {i:"Huevos",c:"166",u:"g"},
          {i:"AOVE",c:"250",u:"ml"},
          {i:"Aceite de girasol",c:"250",u:"ml"},
          {i:"Limas (zumo)",c:"60",u:"ml"},
          {i:"Cebo base caldo navaja",c:"230",u:"ml"},
          {i:"Sal",c:"1",u:"g"},
          {i:"Ají amarillo",c:"2",u:"g"}
        ],
        pasos: [
          "Añadir el huevo junto con la lima, el ají y la sal.",
          "Añadir el aceite de girasol junto con el caldo de navaja y emulsionar."
        ]
      },
      {
        nombre: "Cebo codium escarcha (nitrógeno)",
        descripcion: "",
        ingredientes: [
          {i:"Alga codium",c:"1",u:"kg"},
          {i:"Nitrógeno líquido",c:"3,5",u:"l"},
          {i:"Gelatina en hoja",c:"16",u:"g"}
        ],
        pasos: [
          "Calentar el licuado de codium.",
          "Introducir las gelatinas previamente hidratadas.",
          "Introducir la mezcla en sifón con 2 cargas.",
          "Llenar ¾ partes del recipiente con nitrógeno.",
          "Dispensar en forma de churro hasta terminar el sifón.",
          "Añadir más nitrógeno si fuera necesario."
        ]
      },
      {
        nombre: "Aceite de cebollino y perejil",
        descripcion: "",
        ingredientes: [
          {i:"Cebollino",c:"200",u:"g"},
          {i:"Perejil",c:"200",u:"g"},
          {i:"Aceite de girasol",c:"1",u:"l"}
        ],
        pasos: [
          "Meter todos los elementos en frío en la Thermomix, turbinar a velocidad 10 durante 1 min.",
          "Dejar reposar 5 min la verdura en el aceite para que suelte la clorofila.",
          "Colar por malla fina o tamiz.",
          "Decantar y quedarse con la parte líquida."
        ]
      },
      {
        nombre: "Cebo licuado de codium",
        descripcion: "",
        ingredientes: [],
        pasos: [
          "Thermomix durante 1 minuto a velocidad 1.",
          "Colar por chino fino."
        ]
      }
    ],
    pasos: [
      "Poner la geleé en la mitad del plato de forma aplanada.",
      "Con la navaja abierta al vapor y troceada sin la tripa, colocarla encima de la geleé.",
      "Añadir unos trocitos de almendra encima de la navaja.",
      "Poner el gazpachuelo recién emulsionado en la otra parte del plato, rellenando la base.",
      "Terminar con unas gotas de aceite de perejil y cebollino en la parte del gazpachuelo y cortar la salsa con el aceite."
    ],
    notas: ""
  },
  "tomate embotado": {
    descripcion: "Tomate cuerno de los Andes curado, ahumado con sarmiento y presentado napado con lácteo de cabra, brotes y quinoa frita.",
    alergenos: ["Lácteos"],
    subrecetas: [
      {
        nombre: "Embotado y secado del tomate",
        descripcion: "",
        ingredientes: [
          {i:"Tomate cuerno de los Andes",c:"2",u:"kg"},
          {i:"Sal",c:"100",u:"g"},
          {i:"Azúcar",c:"600",u:"g"}
        ],
        pasos: [
          "Escaldar 25 segundos, pelar y retirar el pedúnculo.",
          "Realizar en un recipiente la mezcla de azúcar y sal.",
          "Extender los tomates sobre un recipiente y poner capas de la mezcla anterior sobre cada uno de los pisos de tomate que se vayan formando.",
          "Dejar que realicen el proceso de curación durante 25 min.",
          "Extender en bandeja con agujeros y meter en la brasa prácticamente sin fuego (rescoldos) con 200 g de sarmiento durante toda una noche.",
          "En caso de no secar lo suficiente, dar 20 minutos a 80 °C en el horno.",
          "Trocear y dar forma de tomate pera, con bolas de 60 g.",
          "Volver a meter en el horno a 80 °C para que vuelva a formar la costra."
        ]
      },
      {
        nombre: "Lácteo de cabra",
        descripcion: "",
        ingredientes: [
          {i:"Nata Calaveruela",c:"720",u:"g"},
          {i:"Queso Payoyo",c:"100",u:"g"},
          {i:"Queso crema",c:"100",u:"g"},
          {i:"Gelatina en hoja",c:"3",u:"hojas"},
          {i:"Goma xantana",c:"3,5",u:"g"}
        ],
        pasos: [
          "Añadir todos los ingredientes menos la xantana y la gelatina y turbinar en Thermomix.",
          "Calentar a 60 °C y añadir la xantana y la gelatina hasta conseguir una textura que pueda napar el tomate. Añadir un poco de la corteza del Payoyo para intensificar el sabor.",
          "Reservar en frío y poner a punto de sal."
        ]
      },
      {
        nombre: "Quinoa frita",
        descripcion: "",
        ingredientes: [
          {i:"Quinoa",c:"",u:""}
        ],
        pasos: [
          "Cocer la quinoa, extender en una bandeja de papel sulfurizado hasta que se seque y romper para que los granos estén dispersos.",
          "Freír a 185 °C para que suflé, extender en papel absorbente y añadir sal."
        ]
      },
      {
        nombre: "Selección de brotes",
        descripcion: "",
        ingredientes: [
          {i:"Brotes de lentejuela",c:"",u:""},
          {i:"Brotes de mostaza verde",c:"",u:""},
          {i:"Brotes de albahaca limón",c:"",u:""},
          {i:"Remolacha sangre de toro",c:"",u:""},
          {i:"Mizuna púrpura",c:"",u:""},
          {i:"Rabanito morado",c:"",u:""},
          {i:"Apio montaña",c:"",u:""},
          {i:"Oxalis",c:"",u:""},
          {i:"Acedera roja",c:"",u:""}
        ],
        pasos: []
      }
    ],
    pasos: [
      "Napar con crema láctea en un plaque y pasarlo al lato.",
      "Espolvorear la quinoa frita con pozos de matcha sin dejar rastros por el plato.",
      "Colocar los brotes ordenadamente por toda la superficie napada.",
      "Poner 1 g de quinoa por plato y terminar con 3 g de aceite macha."
    ],
    notas: ""
  },
  "esturión ahumado": {
    descripcion: "Mosaico de esturión ahumado al sarmiento sobre brandada de esturión, coronado con caviar Oscietra y flores de aliso blanco.",
    alergenos: ["Pescado","Lácteos","Apio","Dióxido de azufre"],
    ingredientes: [
      {i:"Caviar Oscietra",c:"3",u:"g/ración"},
      {i:"Flores de aliso blanco",c:"5",u:"uds/ración"}
    ],
    subrecetas: [
      {
        nombre: "Cebo esturión ahumado",
        descripcion: "Rendimiento: de 10 kg de esturión fresco se obtienen 2 kg de esturión limpio.",
        ingredientes: [
          {i:"Esturión fresco",c:"10",u:"kg"},
          {i:"Sarmiento",c:"",u:""}
        ],
        pasos: [
          "Deslomar el esturión.",
          "Retirar la piel al esturión (guardar para realizar posteriormente el subpase).",
          "Cuadrar los lomos con el tamaño adecuado para ahumarlos; guardar los recortes frescos para otras elaboraciones.",
          "Desangrar los lomos de esturión con una solución de agua marina y hielo.",
          "Escurridos los lomos, enterrarlos en sal durante 12 minutos.",
          "Lavar los lomos.",
          "Secar.",
          "Precalentar el horno a 60-65 °C en convección con ventilador al mínimo.",
          "Con los lomos acomodados en rejillas dentro del horno, ahumar con sarmiento durante 40 minutos.",
          "Comprobar la cocción y el ahumado hasta que sea necesario.",
          "Con el esturión frío, filetearlo en tipo sashimi.",
          "Disponer en papel sulfurizado 4 a 5 filetes superponiéndolos uno encima de otro para crear un mosaico.",
          "Cortar con un cortapastas, el mismo que se usará para el círculo de brandada."
        ]
      },
      {
        nombre: "Cebo base brandada de esturión",
        descripcion: "",
        ingredientes: [
          {i:"Esturión fresco (recortes)",c:"3,5",u:"kg"},
          {i:"Aceite de girasol",c:"1,8",u:"l"},
          {i:"Ajo",c:"260",u:"g"},
          {i:"Apio",c:"330",u:"g"},
          {i:"Cebolla tierna",c:"550",u:"g"},
          {i:"Vino fino",c:"250",u:"g"},
          {i:"Vino blanco",c:"180",u:"g"},
          {i:"Nata de oveja",c:"3,13",u:"l"}
        ],
        pasos: [
          "Confitar el esturión en el aceite de girasol a 80 °C durante 20-30 minutos.",
          "Hacer un sofrito en blanco con el ajo, el apio y la cebolla tierna.",
          "Añadir el vino fino y el vino blanco y reducir el sofrito.",
          "Con los vinos reducidos, añadir el esturión confitado y la nata.",
          "Cuando hierva, cocinar durante 10 minutos a fuego flojo.",
          "Triturar.",
          "Colar por chino fino."
        ]
      },
      {
        nombre: "Cebo brandada de esturión",
        descripcion: "",
        ingredientes: [
          {i:"Cebo esturión ahumado (recortes)",c:"125",u:"g"},
          {i:"Pasta de ajo",c:"40",u:"g"},
          {i:"Base brandada de esturión",c:"500",u:"g"},
          {i:"Patata asada",c:"400",u:"g"},
          {i:"Aceite de ajo",c:"40",u:"g"},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Asar la patata en el horno a unos 180 °C durante 30 minutos (según el tamaño de las patatas).",
          "Añadir los ingredientes en la Thermomix a 80 °C durante 2 minutos a velocidad 3-4.",
          "Subir a velocidad 10 hasta que la mezcla quede lisa y brillante.",
          "Estirar en una placa, poner film a piel y enfriar para su posterior uso."
        ]
      },
      {
        nombre: "Cebo base beurre blanc",
        descripcion: "",
        ingredientes: [
          {i:"Mantequilla de oveja",c:"160",u:"g"},
          {i:"Ajo",c:"20",u:"g"},
          {i:"Chalota",c:"280",u:"g"},
          {i:"Cabeza de rape",c:"1",u:"kg"},
          {i:"Nata de oveja",c:"720",u:"ml"},
          {i:"Cava Privat",c:"750",u:"ml"}
        ],
        pasos: [
          "Hacer un sofrito en blanco.",
          "Añadir las cabezas de rape troceadas y el cava.",
          "Dejar reducir el cava a la mitad.",
          "Añadir la nata de oveja e infusionar durante 10 minutos.",
          "Retirar las cabezas.",
          "Triturar con toda la verdura.",
          "Colar."
        ]
      }
    ],
    pasos: [
      "Colocar con la ayuda de un cortapastas 14 gramos de brandada de esturión.",
      "Disponer los lomos de esturión con la ayuda de una espatulina sobre la brandada.",
      "Disponer bolas de caviar en forma de pentágono (3 g de caviar en total).",
      "Colocar 5 flores de aliso blanco entre el caviar."
    ],
    notas: ""
  },
  "cuajada de tendones": {
    descripcion: "Cuajada cremosa de tendones de vaca con aire de setas, madroño, setas braseadas y estrella de trufa.",
    alergenos: ["Huevos","Lácteos","Dióxido de azufre"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Infusión de setas",
        descripcion: "",
        ingredientes: [
          {i:"Polvo de boletus",c:"40",u:"g"},
          {i:"Agua de botella",c:"1,5",u:"l"}
        ],
        pasos: [
          "Juntar ambos ingredientes, llevar a ebullición y tapar con film.",
          "Reposar 20 minutos, colar por paño y reservar el líquido."
        ]
      },
      {
        nombre: "Aire de setas",
        descripcion: "",
        ingredientes: [
          {i:"Infusión de setas",c:"400",u:"g"},
          {i:"Vino fino hervido",c:"20",u:"g"},
          {i:"Mantequilla noisette",c:"120",u:"g"},
          {i:"Sucro emul",c:"5",u:"g"},
          {i:"Vinagre de manzana",c:"5",u:"g"},
          {i:"Sal",c:"",u:""},
          {i:"Pimienta",c:"",u:""}
        ],
        pasos: [
          "Juntar todos los ingredientes en un cazo y emulsionar con túrmix.",
          "Reservar en frío."
        ]
      },
      {
        nombre: "Tendón procesado",
        descripcion: "",
        ingredientes: [
          {i:"Tendón de vaca",c:"150",u:"g"}
        ],
        pasos: []
      },
      {
        nombre: "Base de tendones",
        descripcion: "",
        ingredientes: [
          {i:"Tendón procesado",c:"200",u:"g"},
          {i:"Agua",c:"200",u:"g"},
          {i:"Infusión de setas",c:"200",u:"g"},
          {i:"Garum de setas",c:"80",u:"g"},
          {i:"Mantequilla noisette",c:"60",u:"g"},
          {i:"Demiglace de gallina",c:"120",u:"g"},
          {i:"Pimienta negra recién molida",c:"",u:""},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Introducir todos los ingredientes en la Thermomix y programar velocidad 4 a 70 °C durante 10 minutos.",
          "Transcurrido el tiempo, pasar rápidamente por cedazo a un bol.",
          "Si se quiere reservar, envasar en bolsas de 440 g y guardar en nevera."
        ]
      },
      {
        nombre: "Cuajada de tendones",
        descripcion: "Trabajar rápido y algo por encima de temperatura ambiente: el colágeno hace que cuaje antes de tiempo.",
        ingredientes: [
          {i:"Base de tendones",c:"440",u:"g"},
          {i:"Huevos",c:"4",u:"uds"},
          {i:"Yemas",c:"2",u:"uds"},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Disponer todos los ingredientes en una jarra e integrarlos con la túrmix mixeando de arriba abajo durante un minuto.",
          "Pasar la mezcla a un recipiente cuadrado y retirar el exceso de aire en la máquina de vacío.",
          "Si la mezcla cuajara antes de tiempo, ponerla al baño maría sin dejar de remover solo hasta que se disuelva de nuevo.",
          "Con la mezcla sin aire, disponer 40 gramos en la vajilla correspondiente.",
          "Filmar los platos individualmente.",
          "Con el horno precalentado a 90 °C al vapor, cocinar los platos 30 minutos.",
          "Al finalizar, retirar rápidamente el film y dejar enfriar y secar 10 minutos.",
          "Volver a filmar por completo la vajilla y reservar en nevera.",
          "A la hora del servicio, programar el horno a 60 °C en continuo hasta el pase."
        ]
      },
      {
        nombre: "Madroño",
        descripcion: "",
        ingredientes: [
          {i:"Madroño",c:"1",u:"bote"},
          {i:"Demi de gallina",c:"60",u:"g"}
        ],
        pasos: [
          "Abrir los madroños y partirlos por la mitad sin el cuesco.",
          "Calentarlos muy suavemente en la demi para colocarlos sobre la espuma."
        ]
      },
      {
        nombre: "Estrella de trufa",
        descripcion: "",
        ingredientes: [
          {i:"Trufa",c:"1",u:"ud"}
        ],
        pasos: [
          "Congelar la trufa entera.",
          "Laminarla en la laminadora de trufa y cortar las láminas con un cortapastas con forma de estrella."
        ]
      },
      {
        nombre: "Piñas de pino encurtidas",
        descripcion: "",
        ingredientes: [
          {i:"Piñas de pino tiernas",c:"",u:"C/S"},
          {i:"Sake",c:"150",u:"g"},
          {i:"Vinagre",c:"200",u:"g"},
          {i:"Azúcar",c:"200",u:"g"},
          {i:"Agua",c:"50",u:"g"},
          {i:"Sal",c:"5",u:"g"}
        ],
        pasos: [
          "Preparar el líquido de cocción mezclando el sake, el vinagre, el azúcar, el agua y la sal.",
          "Cocinar las piñas en el líquido en la Ocoo durante 30 horas.",
          "Envasar las piñas junto con su líquido de cocción."
        ]
      },
      {
        nombre: "Shitake mini",
        descripcion: "",
        ingredientes: [
          {i:"Shitake",c:"1",u:"ud"},
          {i:"Aceite",c:"",u:""},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Pintar con aceite y marcar en la parrilla."
        ]
      },
      {
        nombre: "Shimeji a la brasa",
        descripcion: "",
        ingredientes: [
          {i:"Shimeji",c:"5",u:"uds"},
          {i:"Aceite",c:"",u:""},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Agregar un poco de aceite a los shimejis y brasear en parrilla hasta que tomen un tono dorado."
        ]
      },
      {
        nombre: "Seta de temporada braseada",
        descripcion: "",
        ingredientes: [
          {i:"Seta de temporada",c:"1",u:"ud"},
          {i:"Aceite",c:"",u:""},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Pintar la seta con aceite y colocarla en la parrilla hasta que esté tostada y acorde a lo que se busca."
        ]
      },
      {
        nombre: "Colmenilla",
        descripcion: "",
        ingredientes: [
          {i:"Colmenilla",c:"1",u:"ud"}
        ],
        pasos: [
          "Cortar la colmenilla en rodaja, de forma que quede como un anillo.",
          "Brasearla dejándola lo más completa posible; cuidado, se puede romper."
        ]
      }
    ],
    pasos: [
      "Servir la cuajada templada (horno a 60 °C) en su vajilla.",
      "Cubrir con el aire de setas.",
      "Colocar los madroños calientes sobre la espuma.",
      "Repartir las setas braseadas: shitake mini, shimejis, seta de temporada y el anillo de colmenilla.",
      "Terminar con la estrella de trufa."
    ],
    notas: "El PDF original no detalla el montaje final (orden orientativo según las menciones del documento)."
  },
  "cuajada de leche de cabra": {
    descripcion: "Cuajada de leche de cabra con helado de calostro, fresas en koji y amazake de manzana oxidada.",
    alergenos: ["Lácteos"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Helado de calostro",
        descripcion: "",
        ingredientes: [
          {i:"Calostro",c:"1800",u:"g"},
          {i:"Nata",c:"240",u:"g"},
          {i:"Galatina (dulce a base de leche, triturado en polvo)",c:"200",u:"g"},
          {i:"Leche condensada",c:"340",u:"g"},
          {i:"Procrema",c:"144",u:"g"},
          {i:"Maltodextrina",c:"122",u:"g"}
        ],
        pasos: [
          "Pesar cada uno de los ingredientes por separado.",
          "Mezclar los sólidos y los líquidos, todo en el vaso de la Thermomix.",
          "Mezclar llevando a 70 °C durante 5 minutos.",
          "Filtrar y dejar madurar durante 24 horas.",
          "Llenar bolsas de vacío de 600 ml.",
          "Congelar en el abatidor hasta -40 °C."
        ]
      },
      {
        nombre: "Fresas en koji",
        descripcion: "",
        ingredientes: [
          {i:"Fresa blanca",c:"0,5-1",u:"kg"},
          {i:"Mantequilla de koji",c:"",u:"C/S"}
        ],
        pasos: [
          "Colocar las fresas sin el rabo en la deshidratadora a 45 °C durante aproximadamente 24 horas.",
          "Cada 4 horas, untarlas con mantequilla de koji por todos los lados, dejando que se deshidraten y absorban la mantequilla.",
          "Al obtener la textura deseada, reservar una parte para los petit fours y picar y congelar el resto."
        ]
      },
      {
        nombre: "Amazake de manzana oxidada",
        descripcion: "",
        ingredientes: [
          {i:"Manzana Granny Smith",c:"5",u:"kg"},
          {i:"Koji",c:"100",u:"g por cada 500 g de líquido"}
        ],
        pasos: [
          "Procesar la manzana en la máquina de zumos para obtener un extracto puro.",
          "Colocar todo el líquido sin filtrar en la Ocoo en modo honey glace; al terminar, enfriar.",
          "Con el líquido frío, agregar el koji y dejar fermentar 2 días en el cuarto a 55 °C.",
          "Pasteurizar a 70 °C en bolsa al vacío para detener el proceso enzimático.",
          "Filtrar y reservar."
        ]
      },
      {
        nombre: "Espuma de amazake",
        descripcion: "",
        ingredientes: [
          {i:"Amazake",c:"300",u:"g"},
          {i:"Leche",c:"150",u:"g"},
          {i:"Proespuma",c:"35",u:"g"}
        ],
        pasos: [
          "Triturar el amazake con la proespuma y la leche.",
          "Pasar por un colador fino para que no quede ningún sólido.",
          "Cargar en el sifón con dos cargas y dejar reposar aproximadamente 12 horas."
        ]
      },
      {
        nombre: "Reducción de koji",
        descripcion: "",
        ingredientes: [
          {i:"Agua",c:"3",u:"l"},
          {i:"Koji oryzae",c:"1",u:"kg"},
          {i:"Azúcar",c:"500",u:"g"}
        ],
        pasos: [
          "Colocar todos los ingredientes en una bolsa al vacío.",
          "Dejar en el armario a 55 °C durante 2 días.",
          "Pasteurizar a 70 °C durante 15 minutos.",
          "Filtrar y pasar a una cazuela para reducir el líquido.",
          "Al llegar a 10 brix está listo; reservar en frío."
        ]
      }
    ],
    pasos: [],
    notas: "El montaje final no viene en el documento."
  },
  "sopas frias de leche": {
    descripcion: "Rulo de mochi relleno de queso marrón con praliné de avellana y crema de mochi.",
    alergenos: ["Lácteos","Frutos de cáscara"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Masa mochi",
        descripcion: "",
        ingredientes: [
          {i:"Harina de arroz",c:"35",u:"g"},
          {i:"Leche de vaca",c:"100",u:"g"},
          {i:"Glucosa en polvo",c:"5",u:"g"}
        ],
        pasos: [
          "Mezclar los sólidos y agregarlos a la leche.",
          "Cocinar en el microondas unos 9 minutos, removiendo cada 30 segundos, hasta que la masa esté homogénea y cocida.",
          "Disponer la masa estirada en un plaqué con film, enfriar y dejar reposar 12 horas antes de usar."
        ]
      },
      {
        nombre: "Crema de mochi",
        descripcion: "",
        ingredientes: [
          {i:"Vili (fermento láctico de la casa)",c:"60",u:"g"},
          {i:"Helado de calostro",c:"100",u:"g"},
          {i:"Azúcar",c:"10",u:"g"},
          {i:"Gelatina",c:"15",u:"g"}
        ],
        pasos: [
          "Mezclar y batir todos los ingredientes excepto el azúcar y la gelatina hasta obtener la consistencia deseada.",
          "Agregar el azúcar y la gelatina y terminar de mezclar.",
          "Disponer en mangas para el servicio."
        ]
      },
      {
        nombre: "Queso marrón",
        descripcion: "",
        ingredientes: [
          {i:"Queso crema",c:"500",u:"g"},
          {i:"Queso manchego",c:"200",u:"g"}
        ],
        pasos: [
          "Fundir ambos quesos en un cazo hasta que se homogenicen.",
          "Colocar la mezcla entre paños en la Ocoo, 12 horas en el programa honey glace."
        ]
      },
      {
        nombre: "Tofe (para el queso marrón)",
        descripcion: "",
        ingredientes: [
          {i:"Azúcar",c:"300",u:"g"},
          {i:"Agua",c:"50",u:"g"},
          {i:"Leche",c:"100",u:"g"},
          {i:"Mantequilla",c:"100",u:"g"},
          {i:"Nata 35-38% M.G.",c:"50",u:"g"},
          {i:"Gelatina",c:"2",u:"g"},
          {i:"Sal",c:"2",u:"g"}
        ],
        pasos: [
          "Hacer un caramelo claro con el azúcar y los 50 g de agua.",
          "Agregar la nata, la leche y al final la mantequilla, mezclando todo con la túrmix.",
          "Finalizar incorporando la gelatina y la sal.",
          "Mezclar la pasta de queso marrón con el tofe, triturar, pasar por cedazo y guardar en bolsas al vacío de 600 g."
        ]
      },
      {
        nombre: "Praliné de avellana",
        descripcion: "",
        ingredientes: [
          {i:"Avellanas",c:"500",u:"g"},
          {i:"Azúcar",c:"70% del peso",u:""}
        ],
        pasos: [
          "Hacer un caramelo claro con el azúcar y dejar enfriar.",
          "Tostar las avellanas en la salamandra por separado hasta el color y aroma deseados.",
          "Mezclar ambos en la conchadora y triturar hasta formar la pasta de praliné."
        ]
      }
    ],
    pasos: [
      "Disponer la pasta de queso marrón en mangas.",
      "Estirar la masa mochi a 2 mm de grosor sobre papel sulfurizado, en forma cuadrada.",
      "Mangar el queso marrón de forma tubular dentro de la masa mochi y girar hasta formar un rulo (tipo sushi). Cortar y congelar; repetir hasta acabar la masa.",
      "Cortar los tubos en piezas de 5-6 cm y montar el praliné en la parte superior.",
      "Con manga pastelera, dibujar una S con la crema de mochi de principio a fin.",
      "Montar en el plato blanco o su vajilla correspondiente y pasar al pase."
    ],
    notas: ""
  },
  "tostones de trigo y cereales": {
    descripcion: "Tuiles de cereales en cinco sabores con piñones garrapiñados, praliné de calabaza y pâte de fruit de limón.",
    alergenos: ["Gluten","Huevos","Lácteos","Frutos de cáscara"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Tuiles",
        descripcion: "",
        ingredientes: [
          {i:"Mantequilla pomada",c:"50",u:"g"},
          {i:"Azúcar glas",c:"50",u:"g"},
          {i:"Claras",c:"50",u:"g"},
          {i:"Harina todo uso",c:"50",u:"g"}
        ],
        pasos: [
          "Partir de la mantequilla pomada y agregar el azúcar, las claras y la harina.",
          "Mezclar todo hasta obtener una pasta y pasarla por cedazo.",
          "Estirar en silpat sobre gastros usando los moldes para formar las tejas.",
          "Dar a cada tuile un sabor distinto: almendra rallada, pipas de calabaza, palomitas y levadura tostada; dejar una sin topping para espolvorearla con polvo de galatina.",
          "Hornear a 145-150 °C unos 7 minutos, revisando la cocción y ampliando de 2 en 2 minutos hasta obtener el color necesario."
        ]
      },
      {
        nombre: "Piñones garrapiñados",
        descripcion: "",
        ingredientes: [
          {i:"Piñones",c:"",u:"C/S"},
          {i:"Azúcar",c:"150",u:"g"},
          {i:"Agua",c:"50",u:"g"}
        ],
        pasos: [
          "Hacer un almíbar a 120 °C.",
          "Agregar los piñones y remover; cuando empiece a cristalizar, retirar del fuego.",
          "Dejar que el azúcar cristalice completamente.",
          "Volver a la inducción a potencia 1800 hasta que el azúcar se derrita de nuevo y caramelice.",
          "Retirar al alcanzar el color deseado, estirar en silpat o gastro, enfriar y reservar."
        ]
      },
      {
        nombre: "Praliné de calabaza",
        descripcion: "",
        ingredientes: [
          {i:"Pipas de calabaza",c:"",u:"C/S"},
          {i:"Azúcar",c:"60% del peso de las pipas",u:""},
          {i:"Aceite de oliva virgen extra",c:"20",u:"g"},
          {i:"Sal",c:"2",u:"g"}
        ],
        pasos: [
          "Tostar las pipas de calabaza a 180 °C durante 6-7 minutos.",
          "Triturarlas en la Thermomix.",
          "Hacer un caramelo claro con el azúcar (60% del peso de las pipas).",
          "Mezclar en la conchadora hasta obtener una pasta homogénea.",
          "Terminar agregando el aceite de oliva y la sal."
        ]
      },
      {
        nombre: "Pâte de fruit de limón",
        descripcion: "",
        ingredientes: [
          {i:"Sirope de limón",c:"150",u:"g"},
          {i:"Agua",c:"100",u:"g"},
          {i:"Glucosa",c:"15",u:"g"},
          {i:"Agar-agar",c:"1",u:"g"},
          {i:"Pectina",c:"2",u:"% del peso"}
        ],
        pasos: [
          "Mezclar el sirope con todos los ingredientes y llevar a hervor unos 4 minutos.",
          "Verter la mezcla en un recipiente estéril o tupper y dejar enfriar 12 horas.",
          "Si falta consistencia, deshidratar un poco.",
          "Enfriar, cortar en brunoise y reservar."
        ]
      },
      {
        nombre: "Sirope de limón",
        descripcion: "",
        ingredientes: [
          {i:"Limones",c:"1",u:"kg"},
          {i:"Azúcar",c:"100",u:"g"}
        ],
        pasos: [
          "Pelar los limones con el pelador y retirar con una puntilla el exceso de parte blanca (amarga).",
          "Blanquear las pieles partiendo de agua helada hasta hervir; tirar el agua y repetir el proceso desde agua fría unas 12 veces.",
          "Mezclar las pieles con el zumo del mismo kilo de limones y el azúcar.",
          "Hervir la mezcla hasta que las pieles estén cristalinas.",
          "Enfriar, envasar al vacío y guardar."
        ]
      },
      {
        nombre: "Cremoso de manzanilla (bavaresa de camomila)",
        descripcion: "",
        ingredientes: [
          {i:"Nata",c:"200",u:"g"},
          {i:"Leche",c:"200",u:"g"},
          {i:"Gelatina",c:"8",u:"g"},
          {i:"Yema",c:"70",u:"g"},
          {i:"Azúcar",c:"110",u:"g"},
          {i:"Nata 35% M.G.",c:"440",u:"g"},
          {i:"Camomila (manzanilla)",c:"",u:"C/S"}
        ],
        pasos: [
          "Poner a hidratar la gelatina en agua y hielo.",
          "Blanquear el azúcar junto con la yema.",
          "Llevar a hervor la nata y la leche, agregar la camomila, filmar y dejar infusionar 15 minutos fuera del fuego. Triturar y colar por cedazo.",
          "Hacer una crema inglesa y añadir la gelatina al final de la cocción.",
          "Dejar enfriar la crema inglesa a 23 °C (puede hacerse con un baño maría inverso sin parar de remover).",
          "Semimontar la nata 35% con picos suaves e integrar la crema inglesa en la nata. Es muy importante que la nata esté muy fría y la crema inglesa bien templada.",
          "Extender sobre los tapetes y congelar.",
          "Cortar con cortapastas y reservar en congelación."
        ]
      }
    ],
    pasos: [],
    notas: "El montaje final no viene en el documento."
  },
  "truchas al sarmiento": {
    descripcion: "Tres trozos pequeños de trucha marcada en la brasa al más puro estilo de The Fish Butchery, con pil pil de espirulina y pil pil tradicional.",
    alergenos: ["Pescado","Huevos","Soja","Lácteos"],
    ingredientes: [
      {i:"Trucha arcoíris",c:"1",u:"filete"},
      {i:"Hojas de capuccina",c:"1",u:"und"}
    ],
    subrecetas: [
      {
        nombre: "Caldo de pieles de bacalao",
        descripcion: "Para 8 l. El desalado y lavado es muy importante: las pieles deben perder por completo el olor a pescado salado.",
        ingredientes: [
          {i:"Agua (primera cocción)",c:"22,5",u:"l"},
          {i:"Pieles de bacalao saladas",c:"15",u:"kg"},
          {i:"Agua (segunda cocción)",c:"11,25",u:"l"}
        ],
        pasos: [
          "Mise en place: descongelar las pieles de bacalao la víspera.",
          "Desalar en un baño de agua, con mucha más agua que pieles; cambiar el agua tantas veces como sea necesario para eliminar toda la sal.",
          "Lavar las pieles bajo un chorro de agua hasta eliminar el olor a pescado.",
          "Primera cocción (1,5 l de agua por cada kg de piel): colocar las pieles en la basculante y cubrir con el agua.",
          "Colocar rejillas de acero inoxidable sobre las pieles para sumergirlas por completo.",
          "Llevar a ebullición y mantener un hervor muy suave durante 5 horas.",
          "Cuando el caldo esté reducido a 25 brix, apagar la basculante y retirar las pieles con espumadera con mucho cuidado. Reservar las pieles.",
          "Colar el caldo y volver a colar con un microcolador de 50 micras. Envasar en porciones de 1 l.",
          "Segunda cocción (0,75 l de agua por cada kg de bacalao): volver a colocar las pieles recuperadas en la basculante y cubrir con los 11,25 l de agua.",
          "Colocar de nuevo las rejillas para sumergir las pieles.",
          "Llevar a ebullición y mantener un hervor muy suave hasta llegar a 25 brix.",
          "Apagar la basculante y retirar las pieles con espumadera con cuidado.",
          "Colar con microcolador de 50 micras y juntar los caldos de las dos cocciones. Envasar en porciones de 1 l."
        ]
      },
      {
        nombre: "Kimizu de carne",
        descripcion: "",
        ingredientes: [
          {i:"Yema de huevo",c:"150",u:"g"},
          {i:"Vinagre de arroz",c:"10",u:"ml"},
          {i:"Caldo de carne en polvo Knorr",c:"50",u:"g"},
          {i:"Salsa de soja",c:"40",u:"g"},
          {i:"Maicena",c:"30",u:"g"},
          {i:"Azúcar",c:"50",u:"g"},
          {i:"Sal",c:"10",u:"g"},
          {i:"Agua",c:"500",u:"g"}
        ],
        pasos: [
          "Pesar todos los ingredientes y colocarlos en la Thermomix.",
          "Cocinar a 85 °C durante 10 minutos a velocidad 6.",
          "Retirar la preparación y pasarla a un recipiente.",
          "Cubrir con film a contacto para evitar que forme costra.",
          "Dejar enfriar y conservar en refrigeración hasta su uso."
        ]
      },
      {
        nombre: "Agua de Lourdes",
        descripcion: "",
        ingredientes: [
          {i:"Ajo quemado",c:"1",u:"diente"},
          {i:"Caseína",c:"15",u:"g"},
          {i:"Aceite de girasol",c:"80",u:"g"},
          {i:"Vino fino",c:"30",u:"g"},
          {i:"Caldo de bacalao",c:"50",u:"g"}
        ],
        pasos: [
          "Introducir todos los ingredientes en un vaso.",
          "Triturar con la túrmix hasta obtener una mezcla homogénea.",
          "Reservar hasta el momento de su uso."
        ]
      },
      {
        nombre: "Pil pil de espirulina",
        descripcion: "",
        ingredientes: [
          {i:"Kimizu de carne",c:"",u:""},
          {i:"Agua de Lourdes",c:"",u:""},
          {i:"Espirulina",c:"15",u:"g"}
        ],
        pasos: [
          "Mezclar el kimizu de carne con el agua de Lourdes y calentar hasta 60 °C.",
          "Añadir la espirulina al final para conservar mejor su color y propiedades.",
          "Triturar con la túrmix hasta obtener una emulsión homogénea.",
          "Pasar por un colador fino.",
          "Reservar en un recipiente con film a contacto hasta el servicio."
        ]
      },
      {
        nombre: "Aceite infusionado de setas",
        descripcion: "500 g en total. Cantidades por ingrediente pendientes de definir.",
        ingredientes: [
          {i:"Setas shiitake",c:"",u:""},
          {i:"Pimienta",c:"",u:""},
          {i:"Hondashi",c:"",u:""},
          {i:"Alga kombu",c:"",u:""},
          {i:"Aceite de girasol",c:"",u:""}
        ],
        pasos: [
          "Introducir todos los ingredientes en una cacerola con el aceite de girasol.",
          "Infusionar a 80 °C durante 15 minutos.",
          "Las setas deben adquirir un ligero color dorado sin llegar a quemarse.",
          "Colar el aceite y reservar."
        ]
      },
      {
        nombre: "Pil pil tradicional",
        descripcion: "",
        ingredientes: [
          {i:"Caldo de bacalao",c:"",u:""},
          {i:"Aceite infusionado de setas",c:"",u:""}
        ],
        pasos: [
          "Colocar el caldo de bacalao en una cacerola.",
          "Incorporar el aceite infusionado poco a poco, emulsionando continuamente con la túrmix.",
          "Continuar añadiendo aceite hasta obtener la textura deseada.",
          "Reservar con film a contacto hasta el servicio."
        ]
      }
    ],
    pasos: [
      "Cortar cuadrados de 5 x 5 con la piel incluida.",
      "Marcar en la parrilla por el lado de la piel con una cacerola con hielo encima, para generar presión y un maillard muy marcado: por el lado de la carne queda cruda pero atemperada.",
      "Cortar en tiras gruesas la capuccina y reservar 3 trozos.",
      "Para el montaje, disponer un trozo de trucha de lado para que se vean la piel y la carne, colocar por el lado de la carne la hoja de capuccina, y montar 3 unidades por plato."
    ],
    notas: "Pendiente del PDF: las cantidades por ingrediente del aceite infusionado de setas (shiitake, pimienta, hondashi, kombu, girasol)."
  },
  "cangrejos en tomate": {
    descripcion: "Cangrejo desmigado sobre pasta de cangrejo y tostones de pan, terminado con suquet.",
    alergenos: ["Crustáceos","Gluten"],
    ingredientes: [
      {i:"Cangrejo desmigado",c:"7",u:"g/pax"},
      {i:"Pasta de cangrejo",c:"",u:""},
      {i:"Tostones de pan",c:"4",u:"uds"},
      {i:"Suquet",c:"",u:""},
      {i:"Flores",c:"",u:""}
    ],
    subrecetas: [
      {
        nombre: "Carne de cangrejo",
        descripcion: "",
        ingredientes: [
          {i:"Cangrejo",c:"1",u:"kg"}
        ],
        pasos: [
          "Desmigar y limpiar muy meticulosamente el cangrejo.",
          "Porcionar en raciones de 7 gramos por pax para el momento del servicio.",
          "Antes del sale, mantener al vapor a 60 °C dentro del horno."
        ]
      },
      {
        nombre: "Caldo de marisco (para el suquet)",
        descripcion: "",
        ingredientes: [
          {i:"Cangrejo azul",c:"10",u:"kg"},
          {i:"Cebolla",c:"3",u:"kg"},
          {i:"Ajo",c:"1",u:"kg"},
          {i:"Puerro",c:"3",u:"kg"},
          {i:"Zanahoria",c:"2",u:"kg"},
          {i:"Tomate frito",c:"2",u:"kg"},
          {i:"Vino blanco",c:"2",u:"l"},
          {i:"Pimentón dulce",c:"15",u:"g"},
          {i:"Pimentón picante",c:"6",u:"g"},
          {i:"Agua",c:"25",u:"l"}
        ],
        pasos: [
          "Pochar todas las verduras por separado.",
          "En la misma olla donde se elaborará el caldo, marcar el cangrejo a fuego fuerte con abundante aceite hasta que esté bien dorado (en varias tandas si es necesario).",
          "Añadir al cangrejo las verduras previamente cocinadas y, seguidamente, el pimentón; remover para que no se queme.",
          "Inmediatamente, añadir el vino blanco y reducir a la mitad.",
          "Añadir el tomate frito y dejar cocinar.",
          "Añadir el agua y hervir lentamente durante 2 horas.",
          "Reservar en frío durante 12 horas.",
          "Desgrasar el caldo reservando la grasa, colar entre paños y reservar en nevera."
        ]
      },
      {
        nombre: "Suquet (por 1 litro de caldo)",
        descripcion: "",
        ingredientes: [
          {i:"Caldo de bacalao",c:"400",u:"g"},
          {i:"Bouquet garni (1 clavo, hinojo y melisa)",c:"1",u:"und"},
          {i:"Mantequilla tostada",c:"15",u:"g"},
          {i:"Vinagre",c:"10",u:"g"},
          {i:"Amontillado",c:"40",u:"g"},
          {i:"Caldo de marisco",c:"",u:""},
          {i:"Grasa del caldo de marisco",c:"",u:""},
          {i:"Texturizantes",c:"",u:""}
        ],
        pasos: [
          "Reducir a la mitad el caldo de bacalao y mezclar con el caldo de marisco.",
          "Infusionar con el bouquet garni.",
          "Poner a punto de mantequilla tostada, vinagre y amontillado.",
          "Agregar los texturizantes y la grasa del caldo de marisco, y turbinar.",
          "Reservar para el servicio."
        ]
      },
      {
        nombre: "Pasta de cangrejo",
        descripcion: "",
        ingredientes: [
          {i:"Ajos",c:"2",u:"uds"},
          {i:"Cebollas",c:"8",u:"uds"},
          {i:"Tomates",c:"8",u:"uds"},
          {i:"Hojas de laurel",c:"2",u:"uds"},
          {i:"Caldo de bacalao",c:"150",u:"g"},
          {i:"Suquet",c:"250",u:"g"},
          {i:"Palo cortado",c:"200",u:"ml"}
        ],
        pasos: [
          "Cortar la cebolla y el ajo en mirepoix.",
          "Escaldar el tomate, retirar la piel y cortar en mirepoix.",
          "En una olla con aceite de oliva, pochar la cebolla junto con el ajo y las hojas de laurel hasta obtener un color dorado.",
          "Agregar el palo cortado y el tomate, y pochar hasta que se deshaga.",
          "Añadir el caldo de bacalao y el suquet, y dejar cocinar hasta que se evapore el 100% y se obtenga una pasta densa y jugosa.",
          "Triturar en Thermomix a máxima potencia.",
          "Reservar en bolsas de 150 g etiquetadas, abatir y mantener en congelador."
        ]
      }
    ],
    pasos: [
      "Colocar en la base una carcasa de cangrejo (peso pendiente de definir).",
      "Con la ayuda de un cortapastas pequeño, colocar la pasta de cangrejo.",
      "Colocar 4 tostones de pan y encima el cangrejo desmigado.",
      "Colocar las flores a elegir por la mañana.",
      "Terminar con el suquet (cantidades pendientes de definir)."
    ],
    notas: "Pendiente del PDF: peso de la carcasa base y cantidades de suquet al emplatar."
  },
  "fritos de cangrejo": {
    descripcion: "Croqueta de cangrejo y merluza pinchada en una pinza de cangrejo, sobre chili crab y napada con la misma salsa.",
    alergenos: ["Crustáceos","Pescado","Gluten","Soja","Moluscos"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Chili crab",
        descripcion: "Base ajustada a 1 kg de carabinero.",
        ingredientes: [
          {i:"Carabinero",c:"1",u:"kg"},
          {i:"Miso de ají",c:"82",u:"g"},
          {i:"Pasta Tom Yum",c:"60",u:"g"},
          {i:"Ketchup",c:"86",u:"g"},
          {i:"Pasta gochujang",c:"86",u:"g"},
          {i:"Salsa de tomate",c:"375",u:"g"},
          {i:"Cilantro",c:"50",u:"g"},
          {i:"Azúcar de caña",c:"28",u:"g"},
          {i:"Sake",c:"170",u:"ml"},
          {i:"Salsa de soja",c:"20",u:"g"},
          {i:"Agua",c:"190",u:"ml"},
          {i:"Líquido base (ajuste textura)",c:"125",u:"ml"},
          {i:"Xantana",c:"0,4",u:"g"},
          {i:"Glucosa",c:"1,25",u:"g"}
        ],
        pasos: [
          "Pesados los ingredientes, poner el aceite en la olla y precalentarlo a fuego fuerte.",
          "Añadir los carabineros (o el marisco a utilizar) en tres tandas para que se marquen de manera homogénea, sacando cada tanda antes de marcar la siguiente.",
          "Con todo el marisco marcado, añadir el sake y llevar a hervir para evaporar el alcohol.",
          "Añadir los demás ingredientes de la base y dejar reposar media hora a unos 90 °C.",
          "Triturar en la Thermomix o food processor grande y pasar por cedazo, de modo que no queden grumos ni cáscaras del marisco.",
          "Añadir los ingredientes del ajuste de textura (líquido base, xantana y glucosa) y emulsionar con túrmix.",
          "Guardar en bolsas de vacío de 200 g y congelar."
        ]
      },
      {
        nombre: "Croqueta de pescado",
        descripcion: "",
        ingredientes: [
          {i:"Cangrejo",c:"100",u:"g"},
          {i:"Merluza",c:"100",u:"g"},
          {i:"Perejil",c:"",u:""},
          {i:"Hondashi",c:"",u:""},
          {i:"Polvo nori",c:"",u:""},
          {i:"Caseína",c:"",u:""}
        ],
        pasos: [
          "Descongelar la misma cantidad de merluza que de cangrejo y quitar la piel a la merluza.",
          "Pasar la merluza a la Thermomix junto con la carne de cangrejo y triturar.",
          "Picar el perejil y añadir con el polvo nori, el hondashi y la caseína; triturar todo junto.",
          "Bolear la mezcla en bolas de 20 gramos y congelar; guardar en tuppers.",
          "Cocer las bolas al horno con sonda hasta unos 50 °C en el interior (temperatura a cargo de Tommy).",
          "Una vez hechas, pasar al abatidor, congelar y guardar."
        ]
      }
    ],
    pasos: [
      "Añadir una cucharada de chili crab en la base del plato.",
      "Pinchar la croqueta en una pinza de cangrejo y colocarla sobre la salsa.",
      "Napar la croqueta con más chili crab.",
      "Terminar con oxalis y capuchinas por encima (confirmar si se añade alguna flor extra)."
    ],
    notas: "Transcripción de audio del PDF: la temperatura exacta de cocción de la croqueta la define Tommy (~50 °C al interior) y queda por confirmar alguna flor extra en el montaje."
  },
  "blanco de almendras tiernas": {
    descripcion: "Emulsión de almendra tierna con dashi y tamari, servida en vaso tapado con palos de bambú y boquilla del mismo bambú.",
    alergenos: ["Huevos","Pescado","Soja","Frutos de cáscara"],
    ingredientes: [
      {i:"Tamari dashi",c:"20",u:"g"},
      {i:"Yema",c:"1",u:"und"},
      {i:"Huevo",c:"1",u:"und"},
      {i:"Lima (su jugo)",c:"1",u:"und"},
      {i:"Aceite de girasol",c:"200",u:"g"},
      {i:"Dashi",c:"100",u:"g"}
    ],
    subrecetas: [],
    pasos: [
      "Colocar todos los ingredientes en la Thermomix menos el tamari dashi y el aceite.",
      "Triturar a velocidad 7 e ir agregando el aceite poco a poco.",
      "Al obtener una emulsión estable, agregar el tamari dashi.",
      "Reservar en frío.",
      "Para el montaje, colocar la mezcla en el vaso, tapar con los palos de bambú y colocar una boquilla del mismo bambú."
    ],
    notas: "El PDF no especifica los gramos de mezcla por vaso."
  },
  "alita de pollo rellena": {
    descripcion: "Alita de pollo deshuesada y rellena de farsa de pollo, hígado y trufa, cocinada a baja temperatura y marcada, con pepitoria.",
    alergenos: ["Gluten","Huevos","Lácteos","Frutos de cáscara","Dióxido de azufre"],
    ingredientes: [
      {i:"Alita de pollo",c:"25",u:"und"},
      {i:"Shoyu de huevo",c:"",u:""}
    ],
    subrecetas: [
      {
        nombre: "Farsa",
        descripcion: "",
        ingredientes: [
          {i:"Carne de pollo",c:"600",u:"g"},
          {i:"Papada de cerdo",c:"120",u:"g"},
          {i:"Pan brioche (hidratado en leche y bien escurrido)",c:"110",u:"g"},
          {i:"Chalota",c:"80",u:"g"},
          {i:"Colmenilla picada (hidratada y muy seca)",c:"40",u:"g"},
          {i:"Trufa picada (recortes)",c:"40",u:"g"},
          {i:"Palo cortado",c:"20",u:"g"},
          {i:"Sal",c:"",u:"pizca"},
          {i:"Pimienta negra molida",c:"2",u:"g"},
          {i:"Hígado de pollo",c:"400",u:"g"}
        ],
        pasos: [
          "Picar la carne de pollo junto con la papada en la picadora.",
          "Hidratar el pan brioche en leche sin que quede muy líquido (debe quedar espeso para que la mezcla sea densa).",
          "Pochar la chalota en manteca.",
          "Picar el resto de ingredientes, ir añadiéndolos y mezclar todo junto a mano."
        ]
      },
      {
        nombre: "Montaje de la alita",
        descripcion: "",
        ingredientes: [],
        pasos: [
          "Limpiar la alita y deshuesarla; rellenar con la farsa.",
          "Cerrar con film y anudar; envasar en bolsa de vacío al 100%.",
          "Cocinar 1 h 30 a 68 °C en la roner. Reservar en frío.",
          "En el doble anterior, marcar la alita con aceite y sal por todos los lados hasta dorar de forma homogénea.",
          "Al sale, cortar el extremo y pincelar toda la alita con shoyu de huevo."
        ]
      },
      {
        nombre: "Pepitoria",
        descripcion: "",
        ingredientes: [
          {i:"Demi de gallina",c:"500",u:"g"},
          {i:"Cebolla pochada (700 g cebolla cruda)",c:"480",u:"g"},
          {i:"Diente de ajo pochado",c:"4",u:"g"},
          {i:"Almendra tostada",c:"240",u:"g"},
          {i:"Yema cocida a baja temperatura",c:"8",u:"und"},
          {i:"Vino fino",c:"160",u:"g"},
          {i:"Azafrán",c:"1",u:"hebra"},
          {i:"Nata reducida",c:"320",u:"g"},
          {i:"Pimienta",c:"",u:""},
          {i:"Sal",c:"",u:""}
        ],
        pasos: [
          "Pochar en una cazuela la cebolla junto con el ajo.",
          "Agregar la nata y dejar reducir.",
          "Añadir el vino fino y la almendra tostada, y cocinar durante 5 minutos.",
          "Retirar del fuego y pasar a un recipiente; añadir la yema, el azafrán y la demi.",
          "Triturar con túrmix hasta que la salsa quede lo más lisa posible."
        ]
      },
      {
        nombre: "Demi de gallina (caldo de gallina)",
        descripcion: "La grasa de la gallina aporta mucho sabor al caldo: se introduce en la olla al elaborarlo.",
        ingredientes: [
          {i:"Gallina",c:"15",u:"kg"},
          {i:"Cebolla",c:"12",u:"kg"},
          {i:"Ajo pelado",c:"1",u:"kg"},
          {i:"Garbanzo seco",c:"2",u:"kg"},
          {i:"Agua",c:"30",u:"l"},
          {i:"Clara de huevo (para clarificar)",c:"1 por litro",u:""}
        ],
        pasos: [
          "Remojar los garbanzos una noche.",
          "Trocear la gallina separando pechugas, muslos con piernas, alas y carcasas; disponer en papel sulfurizado.",
          "Asar en el horno a 220 °C hasta que la gallina esté muy dorada (aprox. 60 min).",
          "Pelar los ajos, disponer en Thermomix cubiertos de agua y triturar en intervalos de 2 segundos hasta 3 veces; colar el agua y secar el ajo.",
          "Confitar el ajo en olla con suficiente aceite de oliva hasta un dorado uniforme; separar el ajo del aceite (usar solo el ajo y guardar el aceite).",
          "Cortar la cebolla en juliana fina y caramelizar de forma uniforme.",
          "Introducir la cebolla y los ajos en la olla; añadir la gallina tostada y los garbanzos.",
          "Añadir 30 l de agua y cocinar a hervor leve durante 4 horas.",
          "Colar presionando bien, disponer en gastro honda con film y enfriar en nevera una noche.",
          "Retirar la grasa por completo.",
          "Por cada litro obtenido, montar en la KitchenAid 1 clara de huevo (nada de yema) hasta un merengue sólido.",
          "Añadir el merengue al caldo en frío y llevar a casi hervor hasta que clarifique.",
          "Colar con un filtro de tela sobre gastro de agujeros y, debajo, una gastro honda.",
          "Reducir en olla alta hasta obtener 20 brix.",
          "Enfriar, envasar en bolsas de 200 g y abatir."
        ]
      }
    ],
    pasos: [],
    notas: ""
  },
  "gallina dorada en pebre": {
    descripcion: "Dados de pechuga de pollo marcados a la brasa con albóndiga de pularda y andrajos.",
    alergenos: ["Gluten","Huevos","Frutos de cáscara"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Pechugas en dados",
        descripcion: "4 dados por pax.",
        ingredientes: [
          {i:"Pechuga de pollo",c:"2",u:"kg"}
        ],
        pasos: [
          "Envasar la pechuga con un poco de aceite y cocinar 1 h 30 a 65 °C en la roner (si son muslos: 2 horas a 68 °C).",
          "Cortar en dados de 1 cm y reservar para el servicio.",
          "Al servicio, atemperar y marcar con un poco de aceite en la brasa."
        ]
      },
      {
        nombre: "Albóndiga",
        descripcion: "",
        ingredientes: [
          {i:"Pularda",c:"100",u:"g"},
          {i:"Piñones",c:"5",u:"g"},
          {i:"Perejil",c:"2",u:"g"},
          {i:"Caseína de aceite",c:"2",u:"g"},
          {i:"Chalota",c:"15",u:"g"},
          {i:"Papada",c:"30",u:"g"},
          {i:"Pan mojado (estrujar muy bien)",c:"57",u:"g"},
          {i:"Sal",c:"",u:"pizca"},
          {i:"Pimienta negra",c:"",u:"pizca"}
        ],
        pasos: [
          "Procesar todo en Thermomix o máquina trituradora.",
          "Pesar bolas de 7 gramos y reservar en nevera; deben estar muy frías para marcarlas.",
          "Minutos antes del servicio, marcar las bolas uniformemente en sartén con papel sulfurizado y aceite; reservar en plaqué con papel absorbente.",
          "En el sale, marcar las bolas por la brasa y rectificar de sal."
        ]
      },
      {
        nombre: "Andrajos",
        descripcion: "",
        ingredientes: [
          {i:"Harina",c:"500",u:"g"},
          {i:"Yema",c:"60",u:"g"},
          {i:"Huevos",c:"2",u:"und"},
          {i:"Sal",c:"",u:"pizca"}
        ],
        pasos: [
          "Mezclar todos los ingredientes en KitchenAid, añadiendo un chorro de agua si es necesario, hasta obtener una masa homogénea.",
          "Retirar del bol, filmar y guardar en nevera 1 hora.",
          "Estirar con máquina de pasta en el número 4, con muy poca harina.",
          "Cortar en trozos grandes que entren en una cazuela y cocinar en agua hirviendo 7 minutos con dos cucharaditas de colorante naranja; reservar en agua fría con hielo.",
          "Troquelar con los cortapastas de gota y flor la mayor cantidad posible.",
          "En un papel sulfurizado, armar una flor con 8 gotas y colocar la flor pequeña troquelada en el centro; reservar en nevera.",
          "Al servicio, congelar en abatidor para que en el sale sea sencillo colocar en el bowl y atemperar con la lámpara."
        ]
      },
      {
        nombre: "Tonkatsu de gallina · Caldo de espinazo",
        descripcion: "El tonkatsu se elabora juntando dos caldos. Este es el caldo de espinazo (con sus repas).",
        ingredientes: [
          {i:"Espinazo",c:"15",u:"kg"},
          {i:"Agua (primer caldo)",c:"15",u:"l"},
          {i:"Agua (repas 1)",c:"12",u:"l"},
          {i:"Agua (repas 2)",c:"10",u:"l"}
        ],
        pasos: [
          "Desangrar el espinazo en agua con hielo, en nevera, durante 12 horas.",
          "Colar el agua, sacar el espinazo y disponerlo en gastronorms sin superponer pero llenando la bandeja.",
          "Precalentar el horno a 200 °C sin humedad y con la ventilación al máximo.",
          "Introducir el espinazo durante 25 min; si fuese necesario, dejar más tiempo en intervalos de 5 minutos hasta obtener un bonito color dorado.",
          "Introducir los huesos en una olla grande (mín. 40 l) y añadir los 15 l de agua.",
          "Poner a fuego medio-fuerte y, una vez hierva, bajar hasta un hervor muy leve durante 4 horas.",
          "Desespumar el caldo cada cierto tiempo, sobre todo al principio.",
          "Transcurridas las 4 horas, colar por chino fino y reservar en nevera en gastronorm honda, etiquetado.",
          "Repas 1: disponer los huesos del primer caldo, añadir 12 l de agua y repetir el proceso (hervir, hervor suave 4 horas, colar y reservar).",
          "Repas 2: con los huesos en la olla, añadir 10 l de agua y cocer igual; colar y conservar.",
          "Una vez fríos el caldo y los repas, desgrasar.",
          "Calentarlos y pasarlos por la tela especial de colado, sin dejar que se enfríen para que cuele con facilidad.",
          "Juntar los tres caldos en la misma olla y llevar a ebullición con un hervor no muy agresivo para mantener los aromas.",
          "Reducir el caldo hasta 15 brix.",
          "Enfriar, envasar en bolsas de 200 g, abatir en bandejas planas y stockar en el congelador."
        ]
      }
    ],
    pasos: [],
    notas: "Pendiente del PDF: el segundo caldo del tonkatsu de gallina (se compartirá más adelante)."
  },
  "gachas de maiz y cerdo": {
    descripcion: "Crema de maíz con crujiente de maíz y cerdo.",
    alergenos: ["Gluten"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Crema de maíz",
        descripcion: "Pendiente: la receta no viene en el PDF.",
        ingredientes: [],
        pasos: []
      },
      {
        nombre: "Crujiente de maíz",
        descripcion: "",
        ingredientes: [
          {i:"Maíz deshidratado para palomitas",c:"200",u:"g"},
          {i:"Aceite de girasol",c:"20",u:"ml"},
          {i:"Panko",c:"200",u:"g"},
          {i:"Sal",c:"",u:"pizca"},
          {i:"Pimienta",c:"",u:"pizca"},
          {i:"Levadura tostada",c:"80",u:"g"},
          {i:"Aceite de koji",c:"100",u:"ml"}
        ],
        pasos: [
          "Hacer palomitas de maíz en una cacerola con aceite de girasol.",
          "Triturar las palomitas en Thermomix hasta obtener un polvo.",
          "Tostar el polvo en sartén junto al panko, el aceite de koji y la levadura tostada hasta obtener unas migas doradas uniformemente.",
          "Rectificar con sal y pimienta y reservar con un silica gel dentro."
        ]
      },
      {
        nombre: "Espuma de cebolla",
        descripcion: "Pendiente: receta por compartir.",
        ingredientes: [],
        pasos: []
      }
    ],
    pasos: [],
    notas: "Pendiente del PDF: recetas de la crema de maíz y de la espuma de cebolla (se compartirán más adelante)."
  },
  "caramelo de malvavisco": {
    descripcion: "SCOBY de kombucha de hibiscus con flores.",
    alergenos: [],
    ingredientes: [
      {i:"Té hibiscus",c:"65",u:"g"},
      {i:"Azúcar",c:"600",u:"g"},
      {i:"Agua",c:"5",u:"l"},
      {i:"Backslopping",c:"10",u:"%"}
    ],
    subrecetas: [],
    pasos: [
      "Preparar la infusión de hibiscus: llevar a hervor el té de hibiscus con el azúcar y 1/4 del agua total hasta que el azúcar se disuelva por completo.",
      "Traspasar a un bote de plástico de 10 litros filtrando el líquido.",
      "Añadir al líquido filtrado el resto del agua fría para atemperar la mezcla.",
      "Trabajar por tandas: por cada 2 litros de infusión, triturar junto con scoby activo de kombucha y 200 ml de kombucha antigua; filtrar con trapo fino y reservar.",
      "Repetir el proceso con toda la infusión, recordando agregar scoby y kombucha vieja en cada tanda.",
      "Distribuir todo el líquido en gastronorms y tapar con un trapo blanco sujeto con gomas elásticas.",
      "Fermentar en el armario a 27 °C durante 2-3 días.",
      "Cuando el scoby esté desarrollado, disponerlo todo en la Ocoo junto con el líquido de la kombucha generada y 200 g de azúcar; cocinar a 70 °C durante 5 horas.",
      "Reservar en frío junto al líquido durante 24 horas en nevera.",
      "Para el plato: cortar el scoby cocido en cuadrados de 7 × 7 cm y guardarlos entre papel sulfurizado hasta el momento del pase."
    ],
    notas: ""
  },
  "lucio en conserva": {
    descripcion: "Lucio en brunoise curado en shio koji, con mantequilla de espárrago, vili, caviar de lucio y tuile de kombu, sobre espiral de hojas de bambú.",
    alergenos: ["Pescado","Gluten","Huevos","Lácteos"],
    ingredientes: [
      {i:"Lucio en brunoise (o pescado disponible)",c:"10",u:"g"},
      {i:"Mantequilla de espárragos",c:"3",u:"g"},
      {i:"Vili",c:"1",u:"g"},
      {i:"Caviar de lucio",c:"3",u:"g"},
      {i:"Tuile de kombu",c:"1",u:"und"}
    ],
    subrecetas: [
      {
        nombre: "Curado del lucio",
        descripcion: "",
        ingredientes: [
          {i:"Lucio (o pescado a elegir)",c:"",u:""},
          {i:"Shio koji",c:"",u:""}
        ],
        pasos: [
          "Dejar el pescado en shio koji durante 2 horas en nevera dentro de una bolsa de vacío.",
          "Cortar en brunoise (10 g por ración)."
        ]
      },
      {
        nombre: "Tuile de kombu",
        descripcion: "",
        ingredientes: [
          {i:"Harina",c:"50",u:"g"},
          {i:"Clara de huevo",c:"50",u:"g"},
          {i:"Mantequilla",c:"50",u:"g"},
          {i:"Dextrosa",c:"50",u:"g"},
          {i:"Polvo de kombu",c:"10",u:"g"},
          {i:"Sal Maldon",c:"",u:"pizca"}
        ],
        pasos: [
          "Para el polvo de kombu, tostar el kombu en horno a 150 °C durante 7-8 minutos y procesar hasta obtener un polvo fino.",
          "Poner la mantequilla en pomada y mezclar con el resto de ingredientes.",
          "Pasar por un cedazo para eliminar impurezas y reservar en bolsa de 200 g congelada.",
          "Preparar una gastro con silpat en la base; estirar usando silpat cortados en las orillas para obtener un grosor uniforme.",
          "Espolvorear el polvo de kombu por encima con un tamiz y añadir una pizca de sal Maldon.",
          "Hornear a 150 °C durante 7-8 minutos.",
          "Reservar en un tupper con silica gel; al servir, dejar en la deshidratadora para que recupere su dureza."
        ]
      }
    ],
    pasos: [
      "Disponer las hojas de bambú en forma de círculos hasta obtener una espiral en el plato.",
      "En el círculo central, colocar el lucio en brunoise.",
      "Añadir la mantequilla de espárrago, luego el vili y, al final, las huevas de lucio para tapar y dejar a ras el centro del plato.",
      "Para finalizar, colocar una lámina de tuile de kombu entre las hojas de bambú."
    ],
    notas: ""
  },
  "moje de primavera": {
    descripcion: "Dashi de tomate cristalino con huevas de trucha, servido en cucurucho de hoja de bambú.",
    alergenos: ["Pescado","Dióxido de azufre"],
    ingredientes: [],
    subrecetas: [
      {
        nombre: "Dashi",
        descripcion: "",
        ingredientes: [
          {i:"Katsuobushi",c:"40",u:"g"},
          {i:"Hondashi",c:"15",u:"g"},
          {i:"Agua",c:"2",u:"l"},
          {i:"Shiitake deshidratado",c:"12",u:"g"},
          {i:"Sake",c:"530",u:"g"}
        ],
        pasos: [
          "Infusionar en una cazuela el sake, el shiitake, el agua y el hondashi hasta que llegue a hervor.",
          "Dejar hervir durante 10 minutos.",
          "Apagar el calor y agregar el katsuobushi; filmar para que infusione bien.",
          "Reservar en bolsas de vacío de 200 gramos en nevera."
        ]
      },
      {
        nombre: "Agua de tomate",
        descripcion: "",
        ingredientes: [
          {i:"Tomate",c:"10",u:"kg"}
        ],
        pasos: [
          "Triturar los tomates en Thermomix y guardar en gastro para congelar.",
          "Hacer un crio: colocar el líquido congelado sobre trapos para filtrarlo poco a poco y que salga lo más cristalino posible.",
          "Una vez descongelado/filtrado, reservar en bolsas de 500 g en el congelador.",
          "Con los sólidos, consultar al encargado correspondiente."
        ]
      },
      {
        nombre: "Dashi de tomate",
        descripcion: "",
        ingredientes: [
          {i:"Dashi",c:"30",u:"g"},
          {i:"Agua de tomate",c:"50",u:"g"},
          {i:"Vino fino",c:"10",u:"g"},
          {i:"Xantana",c:"0,2% del peso",u:""},
          {i:"Sal",c:"",u:"pizca"}
        ],
        pasos: [
          "Triturar todo en túrmix durante 2 minutos.",
          "Cuando esté homogéneo, rectificar con una pizca de sal.",
          "Guardar en bolsas al vacío pequeñas de 150 gramos congeladas."
        ]
      }
    ],
    pasos: [
      "Disponer 10 g de dashi de tomate dentro del cucurucho de hoja de bambú.",
      "Colocar 3 g de huevas de trucha en la punta."
    ],
    notas: ""
  }
};
// Alias: el nombre completo con guión largo también resuelve a la misma receta
_PDF_RECIPES["esturión ahumado – caviar oscietra"] = _PDF_RECIPES["esturión ahumado"];
_PDF_RECIPES["esturión ahumado - caviar oscietra"] = _PDF_RECIPES["esturión ahumado"];
// La cuajada de tendones figura en el recetario como "Cuajada de Castañas con Aceite de Pino"
_PDF_RECIPES["cuajada de castañas con aceite de pino"] = _PDF_RECIPES["cuajada de tendones"];
_PDF_RECIPES["cuajada de castañas"] = _PDF_RECIPES["cuajada de tendones"];
// Variantes de nombre en el recetario (Llanura)
_PDF_RECIPES["cuajada leche de cabra"] = _PDF_RECIPES["cuajada de leche de cabra"];
_PDF_RECIPES["tostones de trigo y cereal"] = _PDF_RECIPES["tostones de trigo y cereales"];
// Variantes de nombre (Afluente)
_PDF_RECIPES["trucha al sarmiento"] = _PDF_RECIPES["truchas al sarmiento"];
_PDF_RECIPES["cangrejo en tomate"] = _PDF_RECIPES["cangrejos en tomate"];
_PDF_RECIPES["cangrejo frito con tomate"] = _PDF_RECIPES["cangrejos en tomate"];

// Aplicar datos PDF a una receta del recetario principal (D.recipes)
function applyPdfRecipeMain(id) {
  const recipe = D.recipes.find((r) => r.id === id);
  if (!recipe) return;
  const data = _PDF_RECIPES[_pdfKey(recipe.nombre)];
  if (!data) { toast("No hay datos PDF para esta receta", "err"); return; }
  const btn = document.getElementById("pdf-import-btn");
  if (btn) { btn.textContent = "Guardando…"; btn.disabled = true; }
  if (data.descripcion) recipe.descripcion = data.descripcion;
  recipe.ingredientes = data.ingredientes || recipe.ingredientes || [];
  recipe.subrecetas = data.subrecetas || [];
  recipe.pasos = data.pasos || [];
  recipe.alergenos = data.alergenos || [];
  if (data.notas) recipe.notas = data.notas;
  save("recipes");
  oRD(id);   // re-render de la ficha (el banner desaparece)
  rRec();    // refrescar la tarjeta del grid
}

function _pdfKey(nombre) {
  const full = (nombre || "").toLowerCase().trim();
  const part = full.split(" - ")[0];
  return _PDF_RECIPES[full] ? full : (part in _PDF_RECIPES ? part : full);
}

async function applyPdfRecipe(col, recipeNombre) {
  const key = _pdfKey(recipeNombre);
  const data = _PDF_RECIPES[key];
  if (!data) { toast("No hay datos PDF para esta receta","err"); return; }
  const btn = document.getElementById("pdf-import-btn");
  if (btn) { btn.textContent = "Guardando…"; btn.disabled = true; }
  try {
    if (storageMode === "firebase" && db) {
      const snap = await db.collection(`${col}_recetas`).get();
      let found = false;
      for (const doc of snap.docs) {
        const d = doc.data();
        if (d.nombre && d.nombre.toLowerCase().includes(key)) {
          await doc.ref.update(data);
          // Actualizar en memoria también
          const list = D[`${col}_recetas`] || [];
          const idx = list.findIndex(r => r.nombre && r.nombre.toLowerCase().includes(key));
          if (idx !== -1) Object.assign(list[idx], data);
          found = true;
          break;
        }
      }
      if (!found) { toast("Receta no encontrada en Firestore","err"); return; }
    } else {
      const list = D[`${col}_recetas`] || [];
      const idx = list.findIndex(r => r.nombre && r.nombre.toLowerCase().includes(key));
      if (idx !== -1) Object.assign(list[idx], data);
      persistLocal();
    }
    toast("✓ Datos del PDF aplicados");
    // Reabrir la ficha actualizada
    const recipe = (D[`${col}_recetas`] || []).find(r => r.nombre && r.nombre.toLowerCase().includes(key));
    if (recipe) {
      document.getElementById("restdet-body").innerHTML = buildRestFichaHTML(recipe);
    }
  } catch(e) {
    toast("Error: " + e.message, "err");
    if (btn) { btn.textContent = "Aplicar datos PDF"; btn.disabled = false; }
  }
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
  // Banner PDF si la receta tiene datos pendientes
  const nomKey = _pdfKey(recipe.nombre || "");
  const hasPdfData = !!_PDF_RECIPES[nomKey];
  const pdfData = _PDF_RECIPES[nomKey];
  const recipeSteps = (recipe.pasos||[]).length + (recipe.subrecetas||[]).reduce((n,s)=>n+(s.pasos||[]).length,0);
  const pdfSteps = pdfData ? (pdfData.pasos||[]).length + (pdfData.subrecetas||[]).reduce((n,s)=>n+(s.pasos||[]).length,0) : 0;
  const needsImport = hasPdfData && recipeSteps < pdfSteps;
  const pdfBanner = needsImport ? `
    <div id="pdf-import-banner" style="background:#fff8e1;border:1.5px solid #f9a825;border-radius:12px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="flex:1;font-size:13px;color:#5d4037"><strong>Datos del PDF disponibles</strong><br>Ingredientes con cantidades, subrecetas, pasos de elaboración y alérgenos.</span>
      <button id="pdf-import-btn" class="primary-btn" style="font-size:13px;padding:8px 18px" onclick="applyPdfRecipe('${restRecipeCol}','${escHtml(recipe.nombre)}')">Aplicar datos PDF</button>
    </div>` : "";
  return `
    ${pdfBanner}
    <div class="rs">
      <h4>Información general</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
        ${recipe.seccion ? `<div><strong>Sección:</strong> ${safeText(recipe.seccion)}</div>` : ""}
        ${recipe.temporada ? `<div><strong>Temporada:</strong> ${safeText(recipe.temporada)}</div>` : ""}
        ${recipe.raciones ? `<div class="rec-raciones"><strong>Raciones:</strong> ${safeText(recipe.raciones)}</div>` : ""}
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
    photoBtn.style.display = "";
    if (recipe.hasPhoto || recipe.foto) {
      photoBtn.textContent = "Ver plato";
      photoBtn.onclick = () => viewRestPhoto(id, col);
    } else {
      photoBtn.textContent = "＋ Foto";
      photoBtn.onclick = () => attachRestPhoto(id, col);
    }
  }
  document.getElementById("restdet").classList.add("open");
  updateOverlayState();
  rAdjuntos();
}

function closeRestRecipe() {
  document.getElementById("restdet").classList.remove("open");
  activeRestRecipeId = null;
  restRecipeEmpId = null;
  restRecipeCol = "";
  updateOverlayState();
}

// Comprimir imagen a JPEG data-URL (los docs de Firestore admiten máx. 1 MB)
function _compressImage(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}

function attachRestPhoto(id, col) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const colKey = `${col}_recetas`;
    const recipe = (D[colKey] || []).find((r) => r._i === id);
    if (!recipe) return;
    try {
      toast("Guardando foto…");
      const foto = await _compressImage(file);
      if (storageMode === "firebase" && db) {
        // Foto en la colección {col}_recetas_fotos (upsert por _i)
        const fsnap = await db.collection(`${col}_recetas_fotos`).where("_i", "==", id).limit(1).get();
        if (fsnap.empty) await db.collection(`${col}_recetas_fotos`).add({ _i: id, foto });
        else await fsnap.docs[0].ref.update({ foto });
        // Marcar hasPhoto solo en el doc de esa receta
        const rsnap = await db.collection(colKey).where("_i", "==", id).limit(1).get();
        if (!rsnap.empty) await rsnap.docs[0].ref.update({ hasPhoto: true });
      }
      recipe.foto = foto;
      recipe.hasPhoto = true;
      _setPhoto(col, id, foto);
      toast("✓ Foto guardada", "ok");
      const btn = document.getElementById("restdet-photo-btn");
      if (btn) { btn.textContent = "Ver plato"; btn.onclick = () => viewRestPhoto(id, col); }
    } catch (e) {
      console.error("attachRestPhoto:", e);
      toast("No se pudo guardar la foto: " + e.message, "error");
    }
  };
  input.click();
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
  _openPrintDoc(recipe, restRecipePrintMarkup);
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
      // Check for new versions: on tab focus and every 60s.
      // Without this, an installed PWA that stays open never sees updates.
      const checkUpdate = () => reg.update().catch(() => {});
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkUpdate();
      });
      setInterval(checkUpdate, 60000);
    }).catch((error) => console.warn("SW error:", error));
    // Nueva versión: programar recarga diferida (se aplica cuando no estás usando la app)
    const _defer = () => (window.__scheduleReload ? window.__scheduleReload() : window.location.reload());
    navigator.serviceWorker.addEventListener("controllerchange", _defer);
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") _defer();
    });
  }

  // Version poll independent of the SW: fetch index.html bypassing every
  // cache and compare the app.js version it references with the one running.
  // Catches clients pinned by stale HTTP-cache entries that the SW misses.
  const _myV = (() => {
    const s = document.querySelector('script[src*="app.js"]');
    const m = s && s.src.match(/[?&]v=(\d+)/);
    return m ? m[1] : null;
  })();
  if (_myV) {
    const checkVersion = () => {
      fetch("./index.html", { cache: "no-store" })
        .then((r) => (r.ok ? r.text() : ""))
        .then((html) => {
          const m = html.match(/app\.js\?v=(\d+)/);
          if (!m || m[1] === _myV) return;
          const guard = sessionStorage.getItem("oba_ver_reload");
          if (guard === m[1]) return; // already tried this version; avoid loops
          sessionStorage.setItem("oba_ver_reload", m[1]);
          // Recarga diferida: no interrumpe mientras usas la intranet
          if (window.__scheduleReload) window.__scheduleReload();
          else location.reload();
        })
        .catch(() => {});
    };
    setInterval(checkVersion, 60000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkVersion();
    });
    setTimeout(checkVersion, 5000);
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
  // Setup steps wrapped individually so a single failure never blocks initData()
  try {
    let _modalPtrMoved = false;
    const _modalEl = document.getElementById("modal");
    if (_modalEl) {
      _modalEl.addEventListener("pointerdown", () => { _modalPtrMoved = false; });
      _modalEl.addEventListener("pointermove", (e) => { if (e.buttons) _modalPtrMoved = true; });
      _modalEl.addEventListener("click", (event) => {
        if (event.target.id !== "modal" || _modalPtrMoved) return;
        _safeCloseModal();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (document.getElementById("modal")?.classList.contains("open")) { _safeCloseModal(); return; }
        closeTopOverlay();
      }
    });
    const installCardClose = document.getElementById("install-card-close");
    if (installCardClose) installCardClose.onclick = dismissInstallHint;
  } catch (e) { console.warn("setup error:", e); }

  try { setupMobileNavToggle(); } catch (e) { console.warn("setupMobileNavToggle:", e); }
  try { setupHamburgerMenu(); } catch (e) { console.warn("setupHamburgerMenu:", e); }
  try { setupPedFloatBar(); } catch (e) { console.warn("setupPedFloatBar:", e); }
  try { registerPWA(); } catch (e) { console.warn("registerPWA:", e); }
  try { initIA(); } catch (e) { console.warn("initIA:", e); }
  try { initFacturas(); } catch (e) { console.warn("initFacturas:", e); }

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

// ── Normalización de archivos antes de escanear ──────────
// Claude (el motor que lee las facturas) solo entiende imágenes JPEG/PNG/
// WEBP/GIF. Las fotos HEIC del iPhone y los PDF de proveedores tienen que
// convertirse a JPEG en el propio navegador ANTES de enviarlos: si se
// mandan tal cual, la lectura falla o sale incompleta según el archivo —
// justo el síntoma de "algunos sí, otros no".

let _pdfJsLibPromise = null;
function _loadPdfJsLib() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (_pdfJsLibPromise) return _pdfJsLibPromise;
  _pdfJsLibPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    s.onerror = () => { _pdfJsLibPromise = null; reject(new Error("No se pudo cargar el lector de PDF")); };
    document.head.appendChild(s);
  });
  return _pdfJsLibPromise;
}

function _isHeicFile(file) {
  const t = (file.type || "").toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

// Convierte HEIC a JPEG dibujándolo en un canvas. Solo funciona en
// navegadores que sepan decodificar HEIC de forma nativa (Safari/iOS);
// en Chrome/Firefox el <img> no cargará y se lanza un error claro.
function _heicFileToJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error(`"${file.name}" es una foto HEIC y este navegador no puede leerla. En el iPhone: Ajustes → Cámara → Formatos → elige "Más compatible", o abre la foto y compártela como JPG.`));
    }, 8000);
    img.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error(`No se pudo convertir "${file.name}".`)); return; }
        resolve(new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error(`"${file.name}" es una foto HEIC y este navegador no puede leerla. En el iPhone: Ajustes → Cámara → Formatos → elige "Más compatible", o abre la foto y compártela como JPG.`));
    };
    img.src = url;
  });
}

// Renderiza cada página del PDF a una imagen JPEG. Así el escáner de IA
// siempre recibe imágenes reales, sin depender de cómo el servidor trate
// el PDF original (con sus posibles cabeceras basura, tamaños o formatos
// no estándar añadidos por según qué proveedor).
async function _pdfFileToImageFiles(file) {
  const pdfjsLib = await _loadPdfJsLib();
  const cleanFile = await fctCleanPdf(file);
  const buf = await cleanFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const baseName = file.name.replace(/\.pdf$/i, "");
  const out = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2.2, 1900 / Math.max(viewport.width, viewport.height));
    const scaledViewport = page.getViewport({ scale: Math.max(scale, 1) });
    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: scaledViewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) continue;
    const suffix = pdf.numPages > 1 ? `-p${i}` : "";
    out.push(new File([blob], `${baseName}${suffix}.jpg`, { type: "image/jpeg" }));
  }
  if (!out.length) throw new Error(`No se pudo leer ninguna página de "${file.name}".`);
  return out;
}

// Punto único de entrada: cualquier archivo (imagen válida, HEIC o PDF)
// se convierte aquí en una o más imágenes JPEG/PNG listas para el escáner.
async function fctNormalizeFile(file) {
  if (file.type === "application/pdf") return _pdfFileToImageFiles(file);
  if (_isHeicFile(file)) return [await _heicFileToJpeg(file)];
  if (file.type.startsWith("image/")) return [file];
  throw new Error(`Formato no compatible: "${file.name}".`);
}

async function fctAddFiles(files) {
  const valid = files.filter(f => f.type.startsWith("image/") || f.type === "application/pdf" || _isHeicFile(f));
  if (!valid.length) { showToast("Formato no compatible. Usa JPG, PNG, HEIC o PDF.", "error"); return; }

  // Múltiples archivos distintos → modo lote (cada archivo = una factura)
  if (valid.length > 1 && fctQueueIdx === -1) {
    fctInitBatch(valid);
    return;
  }

  // Modo normal: añadir como páginas de la factura actual
  const status = document.getElementById("fct-scan-status");
  document.getElementById("fct-drop").style.display = "none";
  document.getElementById("fct-preview-area").style.display = "";
  document.getElementById("fct-result").style.display = "none";
  if (status) status.textContent = "Preparando archivo…";
  try {
    for (const file of valid) {
      const images = await fctNormalizeFile(file);
      for (const img of images) {
        fctFiles.push({ file: img, dataUrl: await fctToDataUrl(img) });
      }
    }
    fctExtracted = null;
    fctRenderThumbs();
    const n = fctFiles.length;
    if (status) status.textContent = n === 1 ? "1 página lista para escanear" : `${n} páginas listas para escanear`;
  } catch (err) {
    console.error("fctAddFiles:", err);
    showToast(err.message || "No se pudo preparar el archivo.", "error");
    if (status) status.textContent = fctFiles.length ? `${fctFiles.length} página(s) lista(s) para escanear` : "";
    if (!fctFiles.length) fctReset();
  }
}

function fctToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
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

async function fctLoadBatchItem(idx) {
  const item = fctQueue[idx];
  if (!item) return;
  fctFiles = [];
  fctExtracted = null;
  document.getElementById("fct-result").style.display = "none";
  const status = document.getElementById("fct-scan-status");
  if (status) status.textContent = `Preparando factura ${idx + 1} de ${fctQueue.length}…`;
  try {
    const images = await fctNormalizeFile(item.file);
    for (const img of images) {
      fctFiles.push({ file: img, dataUrl: await fctToDataUrl(img) });
    }
    fctRenderThumbs();
    fctRenderBatchBar();
    if (status) status.textContent = `Factura ${idx + 1} de ${fctQueue.length} — lista para escanear`;
    const btn = document.getElementById("fct-save-btn");
    if (btn) btn.innerHTML = idx < fctQueue.length - 1
      ? '<i class="ph-fill ph-floppy-disk"></i> Guardar y siguiente'
      : '<i class="ph-fill ph-floppy-disk"></i> Guardar factura';
  } catch (err) {
    console.error("fctLoadBatchItem:", err);
    item.status = "error";
    showToast(err.message || `No se pudo preparar "${item.name}".`, "error");
    fctRenderBatchBar();
    const next = idx + 1;
    if (next < fctQueue.length) fctLoadBatchItem(next);
    else { fctQueue = []; fctQueueIdx = -1; fctReset(); }
  }
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

  // ── Detección de duplicados ──
  if (data.numero_factura) {
    const dup = fctInvoices.find(f =>
      f.numero_factura === data.numero_factura &&
      (f.proveedor || "").toLowerCase() === (data.proveedor || "").toLowerCase()
    );
    if (dup) {
      const dupDate = dup.fecha || dup.guardadoEn?.slice(0, 10) || "fecha desconocida";
      const ok = confirm(`⚠️ Ya existe una factura con el número "${data.numero_factura}" de ${data.proveedor} (guardada el ${dupDate}).\n\n¿Guardar de todos modos?`);
      if (!ok) return;
    }
  }

  // Botón en estado de carga
  const btnOriginal = saveBtn?.innerHTML || "";
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<span class="fct-spinner"></span> Guardando…'; }

  // Comprimir / leer imágenes
  let compressed = [];
  if (fctFiles.length) {
    try {
      compressed = (await Promise.all(fctFiles.map(f => fctCompressImage(f.file)))).filter(Boolean);
    } catch(e) { console.warn("fctSave compress:", e); }
  }

  const FIRESTORE_IMG_LIMIT = 900_000;
  const saveableImgs = compressed.filter(b64 => b64.length <= FIRESTORE_IMG_LIMIT);
  const imgTooBig = compressed.length > 0 && saveableImgs.length === 0;

  if (saveableImgs.length) {
    data.imagenesBase64 = saveableImgs;
    if (saveableImgs.length === 1) data.imagenBase64 = saveableImgs[0];
  }

  // ── localStorage local (antes del await de Firestore para evitar duplicado por onSnapshot) ──
  const LOCAL_IMG_LIMIT = 400_000;
  const dataLocal = { ...data };
  const localImgTooBig = dataLocal.imagenesBase64?.some(b => b.length > LOCAL_IMG_LIMIT)
    || dataLocal.imagenBase64?.length > LOCAL_IMG_LIMIT;
  if (localImgTooBig) { delete dataLocal.imagenesBase64; delete dataLocal.imagenBase64; }

  // Solo unshift si no existe ya (onSnapshot puede haberlo añadido durante un await anterior)
  if (!fctInvoices.some(f => f.id === data.id)) {
    fctInvoices.unshift(dataLocal);
  }
  fctPersistLocal();
  fctBuildPriceIndex();
  fctRenderHistory();

  // ── Firestore: guardar en bloques independientes ──
  if (storageMode === "firebase" && db) {

    // 1. Documento principal
    try {
      const { imagenesBase64, imagenBase64, ...dataFirestore } = data;
      if (saveableImgs.length) dataFirestore.numPaginas = saveableImgs.length;
      await db.collection(FCT_COL).doc(data.id).set({ ...dataFirestore, _i: Date.now() });
      // onSnapshot fires here — el id ya está en fctInvoices, no se duplicará
    } catch(e) {
      console.warn("Firestore FCT_COL:", e);
      showToast("Error al guardar en la nube: " + e.message, "error");
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = btnOriginal; }
      return;
    }

    // 2. Imágenes
    if (saveableImgs.length) {
      try {
        const imgBatch = db.batch();
        saveableImgs.forEach((b64, i) => {
          imgBatch.set(db.collection(IMGS_COL).doc(`${data.id}_${i}`),
            { facturaId: data.id, pagina: i, base64: b64, _i: Date.now() });
        });
        await imgBatch.commit();
        data.numPaginas = saveableImgs.length;
      } catch(e) { console.warn("Firestore IMGS_COL:", e); }
    }

    // 3. Precios
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
          <div class="fct-inv-top">
            <span class="fct-inv-proveedor">${escHtml(f.proveedor || "Proveedor desconocido")}</span>
            <span class="fct-inv-chevron">›</span>
          </div>
          <div class="fct-inv-meta">
            <span class="fct-inv-fecha">${f.fecha || "—"}</span>
            ${f.numero_factura ? `<span class="fct-inv-num">· Fac. ${escHtml(f.numero_factura)}</span>` : ""}
            ${f.total_factura != null ? `<span class="fct-inv-total">${Number(f.total_factura).toFixed(2)} €</span>` : ""}
          </div>
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

// ══════════════════════════════════════════════════════
// HUERTA — Rueda del Año
// ══════════════════════════════════════════════════════

// ── Archivos adjuntos por receta ────────────────────────────────────────────
function _adjExt(nombre) {
  return (nombre.split(".").pop() || "").toUpperCase().slice(0, 5) || "FILE";
}

function _adjFmtBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b/1024).toFixed(0) + " KB";
  return (b/1048576).toFixed(1) + " MB";
}

function toggleAdjuntos() { /* panel siempre visible */ }

function rAdjuntos() {
  const counter = document.getElementById("adjuntos-counter");
  const list = document.getElementById("adjuntos-list");
  if (!list) return;
  const col = restRecipeCol;
  const recipes = D[`${col}_recetas`] || [];
  const recipe = recipes.find(r => r._i === activeRestRecipeId);
  const adjuntos = recipe?.adjuntos || [];

  if (counter) counter.textContent = adjuntos.length ? `(${adjuntos.length})` : "";

  if (!adjuntos.length) {
    list.innerHTML = `<div class="adjuntos-empty">Sin archivos adjuntos. Puedes añadir PDFs de fichas, escandallos o fotos del plato.</div>`;
    return;
  }
  list.innerHTML = adjuntos.map((a, i) => `
    <div class="adjunto-row">
      <span class="adjunto-badge">${_adjExt(a.nombre)}</span>
      <div class="adjunto-info">
        <div class="adjunto-name">${escHtml(a.nombre)}</div>
        <div class="adjunto-meta">${a.bytes ? _adjFmtBytes(a.bytes) + (a.fecha ? " · " + a.fecha : "") : (a.fecha || "")}</div>
      </div>
      <div class="adjunto-actions">
        <button class="adj-link" onclick="openAdjunto(${i})">Abrir</button>
        <button class="adj-link adj-del" onclick="deleteAdjunto(${i})">Eliminar</button>
      </div>
    </div>`).join("");
}

async function openAdjunto(idx) {
  const col = restRecipeCol;
  const recipes = D[`${col}_recetas`] || [];
  const recipe = recipes.find(r => r._i === activeRestRecipeId);
  const adj = recipe?.adjuntos?.[idx];
  if (!adj) return;

  if (adj.firestoreId && db) {
    try {
      const docSnap = await db.collection("recetas_adjuntos").doc(adj.firestoreId).get();
      if (docSnap.exists) {
        const data = docSnap.data().data;
        const res = await fetch(data);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
    } catch(e) {
      toast("Error abriendo archivo: " + e.message, "err");
      return;
    }
  }
  // Fallback: si hay url directa (datos en memoria)
  if (adj.url) window.open(adj.url, "_blank");
}

async function uploadAdjuntos(input) {
  const files = [...input.files];
  if (!files.length) return;
  const col = restRecipeCol;
  const recipes = D[`${col}_recetas`] || [];
  const recipe = recipes.find(r => r._i === activeRestRecipeId);
  if (!recipe) return;
  if (!recipe.adjuntos) recipe.adjuntos = [];

  const list = document.getElementById("adjuntos-list");
  for (const file of files) {
    const progId = "adj-prog-" + Date.now();
    const row = document.createElement("div");
    row.className = "adjunto-uploading";
    row.id = progId;
    row.textContent = `Subiendo ${file.name}…`;
    list.prepend(row);

    try {
      // Leer archivo como base64 data URL
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });

      const ext = file.name.split(".").pop().toLowerCase();
      const meta = {
        nombre: file.name,
        tipo: ext.toUpperCase(),
        bytes: file.size,
        fecha: today()
      };

      if (storageMode === "firebase" && db) {
        // Guardar el contenido binario en colección separada para no hinchar el doc de receta
        const adjDoc = await db.collection("recetas_adjuntos").add({
          col,
          recipeNombre: recipe.nombre || "",
          ...meta,
          data: dataUrl
        });
        meta.firestoreId = adjDoc.id;

        // Actualizar array adjuntos en el doc de receta
        recipe.adjuntos.push(meta);
        const snap = await db.collection(`${col}_recetas`).get();
        for (const doc of snap.docs) {
          if (doc.data().nombre === recipe.nombre) {
            await doc.ref.update({ adjuntos: recipe.adjuntos });
            break;
          }
        }
      } else {
        meta.url = dataUrl;
        recipe.adjuntos.push(meta);
        persistLocal();
      }

      document.getElementById(progId)?.remove();
      toast("✓ " + file.name + " añadido");
    } catch(e) {
      document.getElementById(progId)?.remove();
      toast("Error subiendo " + file.name + ": " + e.message, "err");
    }
  }
  input.value = "";
  rAdjuntos();
}

async function deleteAdjunto(idx) {
  if (!confirm("¿Eliminar este archivo adjunto?")) return;
  const col = restRecipeCol;
  const recipes = D[`${col}_recetas`] || [];
  const recipe = recipes.find(r => r._i === activeRestRecipeId);
  if (!recipe || !recipe.adjuntos) return;

  const adj = recipe.adjuntos[idx];

  // Borrar el documento de contenido en Firestore
  if (adj?.firestoreId && db) {
    try { await db.collection("recetas_adjuntos").doc(adj.firestoreId).delete(); } catch(e) { /* ignorar */ }
  }

  recipe.adjuntos.splice(idx, 1);

  if (storageMode === "firebase" && db) {
    const snap = await db.collection(`${col}_recetas`).get();
    for (const doc of snap.docs) {
      if (doc.data().nombre === recipe.nombre) {
        await doc.ref.update({ adjuntos: recipe.adjuntos });
        break;
      }
    }
  } else {
    persistLocal();
  }
  toast("✓ Archivo eliminado");
  rAdjuntos();
}

let huertaSelectedMonth = null;

// ── Partidas / Inventario ────────────────────────────
const PARTIDAS = ["Caldos", "Brasas", "Pastelería", "Fermentos", "Palomas"];
let partidaActiva = "Palomas";

function seedInventario() {
  if (!D.inventario) D.inventario = [];
  // Sólo sembramos si aún no hay nada de la partida Palomas (no pisar ediciones).
  const yaHay = D.inventario.some((it) => it.partida === "Palomas");
  if (yaHay) return;
  const P = (caja, producto, cantidad = "", tamano = "", nota = "") =>
    ({ id: nid++, partida: "Palomas", caja, producto, cantidad: String(cantidad), tamano, nota });
  const seed = [
    P("Caja 1", "Vinagre saúco", 13, "Pequeña"),
    P("Caja 1", "Vinagre pimiento", 2),
    P("Caja 1", "Vinagre amapola", 8),
    P("Caja 1", "Miso rosas", 13),

    P("Caja 2 (bolsas pequeñas)", "Garum pan", 27),
    P("Caja 2 (bolsas pequeñas)", "Garum seco", 15),
    P("Caja 2 (bolsas pequeñas)", "Garum manzana", 27),

    P("Caja 3 (bolsas pequeñas)", "Garum codorniz", 15),
    P("Caja 3 (bolsas pequeñas)", "Garum trucha", ""),

    P("Caja 4 (bolsas pequeñas)", "Garum camarón", 5),
    P("Caja 4 (bolsas pequeñas)", "Garum garbanzos", 18),
    P("Caja 4 (bolsas pequeñas)", "Garum grillo", 7),
    P("Caja 4 (bolsas pequeñas)", "Garum maíz", 9),
    P("Caja 4 (bolsas pequeñas)", "Garum vegetal", 10),
    P("Caja 4 (bolsas pequeñas)", "Shoyu avena", 4),
    P("Caja 4 (bolsas pequeñas)", "Garum calabaza", 6),

    P("Caja 5 (bolsas pequeñas)", "Miso locro", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso pato", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso callos", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso colioco", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso rúcula", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso grillo", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso maíz", ""),
    P("Caja 5 (bolsas pequeñas)", "Miso escaramujo", ""),

    P("Caja 5 (bolsas grandes)", "Masato", ""),
    P("Caja 5 (bolsas grandes)", "Bitter de limón", ""),
    P("Caja 5 (bolsas grandes)", "Tamari pan", 1, "Grande"),
    P("Caja 5 (bolsas grandes)", "Lías frutos rojos", 5),

    P("Caja 6 (bolsa pequeña)", "Shoyu calostro", 6),
    P("Caja 6 (bolsa pequeña)", "Tamari garbanzo", 2),
    P("Caja 6 (bolsa pequeña)", "Shoyu huevo", 4),
    P("Caja 6 (bolsa pequeña)", "Ganyang", 20),

    P("Caja 7", "Siracha", 28),
    P("Caja 7", "Miso verduras", 7),
    P("Caja 7", "Aceite higuera", 1),
    P("Caja 7", "Aceite xo", 2),
    P("Caja 7", "Garum anguila", 8),

    P("Caja 8", "Hojas de parra occo", 8, "Grande"),
    P("Caja 8", "Apio nabo encurtido", 8, "Mediana"),
  ];
  D.inventario.push(...seed);
  save("inventario");
}

// Congelador de OBA → partida Fermentos (Turno tarde, 10/7/26, resp. Luis)
function seedFermentos() {
  if (!D.inventario) D.inventario = [];
  const yaHay = D.inventario.some((it) => it.partida === "Fermentos");
  if (yaHay) return;
  const P = (caja, producto, cantidad = "", tamano = "", nota = "") =>
    ({ id: nid++, partida: "Fermentos", caja, producto, cantidad: String(cantidad), tamano, nota });
  const seed = [
    P("Caja 1", "Puré saúco", 13),
    P("Caja 1", "Frutos rojos lacto", 2),
    P("Caja 1", "Limón oxidado", 3),
    P("Caja 1", "Limón occo", 2),
    P("Caja 1", "Agua tomate", 2, "Grande"),

    P("Caja 2", "Barbacoa", 4),
    P("Caja 2", "Kimizu", 9),
    P("Caja 2", "Suero vici", 3),
    P("Caja 2", "Pastel maíz", 1),
    P("Caja 2", "Líquido de remolacha", 15),

    P("Caja 3", "Shio-koji", 6),
    P("Caja 3", "Puré tomate lacto", 2),
    P("Caja 3", "Champi occo", 3),
    P("Caja 3", "Champi lacto", 6),
    P("Caja 3", "Espárrago", 6),
    P("Caja 3", "Lacto (líquido)", ""),

    P("Caja 4", "Puré saúco", 18),

    P("Caja 5", "Oba cola", 2),
    P("Caja 5", "Trompetas", 1),
    P("Caja 5", "Agua pepino", 2),
    P("Caja 5", "Aceite miso", 1),
    P("Caja 5", "Crema koji", 1),
    P("Caja 5", "Puré saúco", 1),
    P("Caja 5", "Crema acedera", 3),
    P("Caja 5", "Limón oxidado", 4, "Grande"),

    P("Caja 6", "Agua tomate", 16),

    P("Caja 7", "Koji sojae", "", "", "x3 cajas"),

    P("Caja 8", "Suero vici", 4),
    P("Caja 8", "Leche almendra", 6),

    P("Caja 9", "Lacto mora", 11),

    P("Caja 10", "", ""),

    P("Caja 11", "Dashi", 1),
    P("Caja 11", "Amazake", 11),

    P("Caja 12", "Cake koji", 20),

    P("Caja 13 (Koji)", "Cake koji", 20),
    P("Caja 13 (Koji)", "Pan sakadane", 6),
    P("Caja 13 (Koji)", "Trucha", 2),
    P("Caja 13 (Koji)", "Nopal", 2),
    P("Caja 13 (Koji)", "Maíz", 1),
  ];
  D.inventario.push(...seed);
  save("inventario");
}

// Tamaños de bolsa disponibles para cada producto
const TAMANOS_BOLSA = ["Pequeña", "Mediana", "Grande"];

// Migración: añade el campo `tamano` a inventarios sembrados antes de esta
// versión, deduciéndolo de la nota antigua ("bolsa pequeña", etc).
function migrateInventario() {
  if (!D.inventario || !D.inventario.length) return;
  let changed = false;
  D.inventario.forEach((it) => {
    if (it.tamano === undefined) {
      const n = (it.nota || "").toLowerCase();
      if (/peque/.test(n)) it.tamano = "Pequeña";
      else if (/median/.test(n)) it.tamano = "Mediana";
      else if (/grande/.test(n)) it.tamano = "Grande";
      else it.tamano = "";
      // Si la nota era sólo la descripción del tamaño, la vaciamos
      if (it.tamano) {
        const resto = n.replace(/bolsas?/g, "").replace(/peque\w*|median\w*|grande\w*/g, "").trim();
        if (!resto) it.nota = "";
      }
      changed = true;
    }
  });
  if (changed) save("inventario");
}

function showPartidasPanel() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-partidas")?.classList.add("active");
  document.querySelector('.nav-btn[data-panel="partidas"]')?.classList.add("active");
  document.querySelector('.hnav-btn[data-panel="partidas"]')?.classList.add("active");
  scrollTop();
  closeHamburger();
  document.getElementById("ped-float-bar")?.classList.remove("visible");
  rPartidas();
}

function setPartida(name) {
  partidaActiva = name;
  rPartidas();
}

function rPartidas() {
  const body = document.getElementById("partidas-body");
  if (!body) return;
  const items = (D.inventario || []).filter(it => it.partida === partidaActiva);
  const total = items.length;

  // Orden de cajas por primera aparición
  const cajaOrder = [];
  const byCaja = {};
  items.forEach(it => {
    if (!byCaja[it.caja]) { byCaja[it.caja] = []; cajaOrder.push(it.caja); }
    byCaja[it.caja].push(it);
  });

  const tabs = PARTIDAS.map(p => {
    const n = (D.inventario || []).filter(it => it.partida === p).length;
    return `<button class="part-tab ${p === partidaActiva ? "active" : ""}" onclick="setPartida('${p.replace(/'/g, "\\'")}')">
      ${escHtml(p)}${n ? `<span class="part-tab-count">${n}</span>` : ""}
    </button>`;
  }).join("");

  const cajas = cajaOrder.map(caja => {
    const rows = byCaja[caja].map(it => {
      const opts = TAMANOS_BOLSA.map(t =>
        `<option value="${t}" ${it.tamano === t ? "selected" : ""}>${t}</option>`).join("");
      return `
      <div class="inv-row">
        <div class="inv-row-main">
          <input class="inv-input inv-input-prod" value="${safeText(it.producto)}"
                 onchange="invSetCampo(${it.id},'producto',this.value)" placeholder="Producto">
          <div class="inv-row-sub">
            <select class="inv-size" title="Tamaño de bolsa"
                    onchange="invSetCampo(${it.id},'tamano',this.value)">
              <option value="" ${!it.tamano ? "selected" : ""}>Tamaño…</option>
              ${opts}
            </select>
            <input class="inv-input inv-input-nota" value="${safeText(it.nota || "")}"
                   onchange="invSetCampo(${it.id},'nota',this.value)" placeholder="+ nota">
          </div>
        </div>
        <input class="inv-input inv-input-qty" value="${safeText(it.cantidad)}"
               onchange="invSetCampo(${it.id},'cantidad',this.value)" placeholder="—">
        <button class="inv-del-btn" title="Quitar producto" onclick="invDelProducto(${it.id})">✕</button>
      </div>`;
    }).join("");
    const cajaJs = caja.replace(/'/g, "\\'");
    return `
      <div class="inv-caja" data-caja="${safeText(caja)}" data-partida="${safeText(partidaActiva)}">
        <div class="inv-caja-head">
          <span class="inv-caja-ico">📦</span>
          <input class="inv-caja-name" value="${safeText(caja)}"
                 onchange="invRenameCaja('${cajaJs}',this.value)">
          <span class="inv-caja-count">${byCaja[caja].length}</span>
          <button class="inv-caja-qr" title="Imprimir QR de esta caja" onclick="imprimirQRCajas('${cajaJs}')">▦</button>
          <button class="inv-caja-del" title="Eliminar caja" onclick="invDelCaja('${cajaJs}')">🗑</button>
        </div>
        <div class="inv-rows">${rows}</div>
        <button class="inv-add-row" onclick="invAddProducto('${cajaJs}')">+ Añadir producto</button>
      </div>`;
  }).join("");

  body.innerHTML = `
    <div class="part-tabs">${tabs}</div>
    <div class="part-content">
      <div class="inv-toolbar">
        <div class="inv-toolbar-info">${total} producto${total !== 1 ? "s" : ""} en ${escHtml(partidaActiva)}</div>
        <div class="inv-toolbar-btns">
          ${cajaOrder.length ? `<button class="ghost-btn ghost-btn-sm" onclick="imprimirQRCajas()">▦ Imprimir QR</button>` : ""}
          <button class="primary-btn primary-btn-sm" onclick="invAddCaja()">+ Añadir caja</button>
        </div>
      </div>
      ${cajaOrder.length ? `<div class="inv-cajas-grid">${cajas}</div>` : `
        <div class="inv-empty">
          <div style="font-size:44px;margin-bottom:10px">📦</div>
          <div style="font-weight:600;margin-bottom:4px">Aún no hay inventario en ${escHtml(partidaActiva)}</div>
          <div style="font-size:13px;color:var(--muted)">Pulsa "+ Añadir caja" para empezar el inventario</div>
        </div>`}
    </div>`;
}

function invAddCaja() {
  const nombre = (prompt("Nombre de la caja (ej: Caja 9):") || "").trim();
  if (!nombre) return;
  if (!D.inventario) D.inventario = [];
  // Caja vacía: creamos un producto en blanco para que aparezca la caja
  D.inventario.push({ id: nid++, partida: partidaActiva, caja: nombre, producto: "", cantidad: "", nota: "" });
  save("inventario");
  rPartidas();
}

function invAddProducto(caja) {
  if (!D.inventario) D.inventario = [];
  D.inventario.push({ id: nid++, partida: partidaActiva, caja, producto: "", cantidad: "", nota: "" });
  save("inventario");
  rPartidas();
  // Enfocar el último input de producto de esa caja
  setTimeout(() => {
    const inputs = document.querySelectorAll(".inv-input-prod");
    const last = inputs[inputs.length - 1];
    if (last) last.focus();
  }, 40);
}

function invSetCampo(id, campo, val) {
  const it = (D.inventario || []).find(x => x.id === id);
  if (!it) return;
  it[campo] = val;
  save("inventario");
}

function invDelProducto(id) {
  const it = (D.inventario || []).find(x => x.id === id);
  if (!it) return;
  if (it.producto && !confirm(`¿Eliminar "${it.producto}"?`)) return;
  D.inventario = D.inventario.filter(x => x.id !== id);
  save("inventario");
  rPartidas();
}

function invDelCaja(caja) {
  if (!confirm(`¿Eliminar la caja "${caja}" y todos sus productos?`)) return;
  D.inventario = (D.inventario || []).filter(x => !(x.partida === partidaActiva && x.caja === caja));
  save("inventario");
  rPartidas();
}

function invRenameCaja(oldName, newName) {
  newName = (newName || "").trim();
  if (!newName || newName === oldName) { rPartidas(); return; }
  (D.inventario || []).forEach(x => {
    if (x.partida === partidaActiva && x.caja === oldName) x.caja = newName;
  });
  save("inventario");
  rPartidas();
}

// ── QR de cajas + enlace directo ────────────────────
// Dominio público de la intranet (el QR abre esta URL al escanearlo).
const QR_BASE = "https://intranet.obarestaurante.es/";

function _cajaURL(partida, caja) {
  return QR_BASE + "?partida=" + encodeURIComponent(partida) + "&caja=" + encodeURIComponent(caja);
}

// Genera la hoja imprimible de QR. Sin argumento: todas las cajas de la
// partida activa. Con `soloCaja`: solo el QR de esa caja.
function imprimirQRCajas(soloCaja) {
  if (typeof qrcode !== "function") { toast("Cargando QR, reintenta en un momento", "err"); return; }
  const partida = partidaActiva;
  const items = (D.inventario || []).filter(it => it.partida === partida);
  const cajas = [];
  items.forEach(it => { if (!cajas.includes(it.caja)) cajas.push(it.caja); });
  const lista = soloCaja ? cajas.filter(c => c === soloCaja) : cajas;
  if (!lista.length) { toast("No hay cajas en " + partida, "err"); return; }

  const win = window.open("");
  const cards = lista.map(caja => {
    const qr = qrcode(0, "M");
    qr.addData(_cajaURL(partida, caja));
    qr.make();
    const svg = qr.createSvgTag({ cellSize: 6, margin: 1, scalable: true });
    return `<div class="qc">
      <div class="qc-box">${svg}</div>
      <div class="qc-name">${escHtml(caja)}</div>
      <div class="qc-sub">${escHtml(partida)} · OBA</div>
    </div>`;
  }).join("");

  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
    <title>QR cajas — ${escHtml(partida)}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; color: #111; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
      .qc { border: 1.5px dashed #bbb; border-radius: 8px; padding: 8mm 6mm;
            text-align: center; break-inside: avoid; page-break-inside: avoid; }
      .qc-box { width: 55mm; height: 55mm; margin: 0 auto 5mm; }
      .qc-box svg { width: 100%; height: 100%; display: block; }
      .qc-name { font-size: 20pt; font-weight: 800; letter-spacing: .3px; }
      .qc-sub { font-size: 10pt; color: #777; margin-top: 2mm; text-transform: uppercase; letter-spacing: 1px; }
      @media screen { body { background: #f2f2f7; padding: 20px; } .grid { max-width: 800px; margin: 0 auto; } .qc { background: #fff; } }
    </style></head>
    <body><div class="grid">${cards}</div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };<\/script>
    </body></html>`);
  win.document.close();
}

// Enlace directo: abre Partidas → la partida y resalta la caja.
let _deepCaja = null;
try {
  const _qp = new URLSearchParams(location.search);
  if (_qp.get("caja")) {
    _deepCaja = { partida: _qp.get("partida") || "Palomas", caja: _qp.get("caja") };
  }
} catch (e) {}

function _applyDeepCaja() {
  if (!_deepCaja) return;
  const target = _deepCaja;
  _deepCaja = null;
  // Quitar los parámetros para que futuras recargas no vuelvan a saltar
  try { history.replaceState({}, "", location.pathname); } catch (e) {}
  if (!PARTIDAS.includes(target.partida)) return;
  _gotoCaja(target.partida, target.caja);
}

function _gotoCaja(partida, caja) {
  partidaActiva = partida;
  sp("partidas");
  _flashCaja(caja, 0);
}

function _flashCaja(caja, attempt) {
  const el = [...document.querySelectorAll("#partidas-body .inv-caja")]
    .find(x => x.dataset.caja === caja);
  if (!el) { if (attempt < 30) setTimeout(() => _flashCaja(caja, attempt + 1), 220); return; }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("inv-caja-flash");
  setTimeout(() => el.classList.remove("inv-caja-flash"), 2800);
}

function showHuertaPanel() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-huerta")?.classList.add("active");
  document.querySelector('.nav-btn[data-panel="huerta"]')?.classList.add("active");
  document.querySelector('.hnav-btn[data-panel="huerta"]')?.classList.add("active");
  scrollTop();
  closeHamburger();
  document.getElementById("ped-float-bar")?.classList.remove("visible");
  rHuerta();
}

function rHuerta() {
  const body = document.getElementById("huerta-body");
  if (!body) return;
  const plantas = (D.huerta_plantas || []).slice().sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  const filtered = huertaSelectedMonth
    ? plantas.filter(p => (p.meses || []).includes(huertaSelectedMonth))
    : plantas;
  const monthLabel = huertaSelectedMonth ? MESES[huertaSelectedMonth - 1] : "Todo el año";
  const cnt = filtered.length;

  body.innerHTML = `
    <div class="huerta-layout">
      <div class="huerta-wheel-wrap">${buildHuertaWheel(plantas, huertaSelectedMonth)}</div>
      <div class="huerta-filter-row">
        <div class="huerta-section-label">
          ${escHtml(monthLabel)}
          <span style="font-size:14px;font-weight:500;color:var(--muted);margin-left:8px">${cnt} planta${cnt !== 1 ? "s" : ""}</span>
        </div>
        ${huertaSelectedMonth ? `<button class="ghost-btn ghost-btn-sm" onclick="selectHuertaMonth(null)">Ver todas</button>` : ""}
      </div>
      <div class="huerta-plant-grid">
        ${filtered.length === 0 ? `
          <div class="huerta-empty">
            <div style="font-size:48px;margin-bottom:12px">🌱</div>
            <div style="font-weight:600;margin-bottom:4px">Sin plantas para ${escHtml(monthLabel.toLowerCase())}</div>
            <div style="font-size:13px;color:var(--muted)">Pulsa "+" para añadir tu primera planta de temporada</div>
          </div>` : filtered.map(p => huertaPlantCard(p)).join("")}
      </div>
    </div>`;
}

const _HUERTA_SEA = [
  "#B0C8E8","#BCCFEE", // Ene, Feb — invierno
  "#A8E6A3","#7ED68A", // Mar, Abr — primavera temprana
  "#4DC96D","#34C759", // May, Jun — primavera plena
  "#FFD60A","#FF9F0A", // Jul, Ago — verano
  "#FF6B35","#D4845A", // Sep, Oct — otoño
  "#A0887A","#8EB4D8", // Nov, Dic — otoño tardío / invierno
];

function buildHuertaWheel(plantas, selectedMonth) {
  const S = 300, cx = 150, cy = 150;
  const R = 118, r = 52, labelR = 133;
  const N = 12, TAU = 2 * Math.PI, gap = 0.018;

  const counts = Array(13).fill(0);
  plantas.forEach(p => (p.meses || []).forEach(m => { if (m >= 1 && m <= 12) counts[m]++; }));
  const maxC = Math.max(...counts.slice(1), 1);

  let svg = "";
  for (let i = 0; i < N; i++) {
    const month = i + 1;
    const a0 = -Math.PI / 2 + i * (TAU / N);
    const a1 = a0 + TAU / N;
    const am = (a0 + a1) / 2;
    const isSel = selectedMonth === month;
    const cnt = counts[month];

    let fill;
    if (isSel) {
      fill = _HUERTA_SEA[i];
    } else if (cnt === 0) {
      fill = "#E5E5EA";
    } else {
      const hex = _HUERTA_SEA[i];
      const r0 = 242, g0 = 242, b0 = 247;
      const r1 = parseInt(hex.slice(1,3),16), g1 = parseInt(hex.slice(3,5),16), b1 = parseInt(hex.slice(5,7),16);
      const t = 0.3 + (cnt / maxC) * 0.7;
      fill = `rgb(${Math.round(r0+(r1-r0)*t)},${Math.round(g0+(g1-g0)*t)},${Math.round(b0+(b1-b0)*t)})`;
    }

    const cos0 = Math.cos(a0+gap), sin0 = Math.sin(a0+gap);
    const cos1 = Math.cos(a1-gap), sin1 = Math.sin(a1-gap);
    const x1=cx+R*cos0, y1=cy+R*sin0, x2=cx+R*cos1, y2=cy+R*sin1;
    const x3=cx+r*cos1, y3=cy+r*sin1, x4=cx+r*cos0, y4=cy+r*sin0;
    const stroke = isSel ? "rgba(0,0,0,.22)" : "rgba(0,0,0,.07)";
    const sw = isSel ? 2.5 : 1;

    svg += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${r} ${r} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" onclick="selectHuertaMonth(${month})" style="cursor:pointer"/>`;

    const lx = cx + labelR * Math.cos(am), ly = cy + labelR * Math.sin(am);
    const shortM = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i];
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="8.5" font-weight="${isSel?700:500}" fill="${isSel?"#000":"#555"}" onclick="selectHuertaMonth(${month})" style="cursor:pointer">${shortM}</text>`;

    if (cnt > 0) {
      const mr = (R + r) / 2;
      const mx = cx + mr * Math.cos(am), my = cy + mr * Math.sin(am);
      svg += `<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" style="pointer-events:none">${cnt}</text>`;
    }
  }

  const centerLabel = selectedMonth ? MESES[selectedMonth - 1] : "Año";
  svg += `<circle cx="${cx}" cy="${cy}" r="${r-4}" fill="white" stroke="rgba(0,0,0,.07)" stroke-width="1"/>`;
  if (selectedMonth) {
    svg += `<text x="${cx}" y="${cy-9}" text-anchor="middle" dominant-baseline="middle" font-size="9.5" font-weight="600" fill="#8E8E93">${["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"][selectedMonth-1]}</text>`;
    svg += `<text x="${cx}" y="${cy+9}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="800" fill="#000">${counts[selectedMonth]}</text>`;
  } else {
    svg += `<text x="${cx}" y="${cy-7}" text-anchor="middle" dominant-baseline="middle" font-size="8.5" font-weight="500" fill="#8E8E93">PLANTAS</text>`;
    svg += `<text x="${cx}" y="${cy+8}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" fill="#000">${plantas.length}</text>`;
  }

  return `<svg viewBox="-8 -18 316 336" xmlns="http://www.w3.org/2000/svg" class="huerta-wheel-svg">${svg}</svg>`;
}

function selectHuertaMonth(month) {
  huertaSelectedMonth = huertaSelectedMonth === month ? null : month;
  rHuerta();
}

function huertaPlantCard(p) {
  const emoji = _huertaEmoji(p.tipo);
  return `<button class="huerta-plant-card" onclick="openHuertaPlant('${escHtml(p._id)}')">
    ${p.foto
      ? `<img src="${escHtml(p.foto)}" class="huerta-plant-img" alt="${escHtml(p.nombre)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="huerta-plant-img-placeholder" style="display:none">${emoji}</div>`
      : `<div class="huerta-plant-img-placeholder">${emoji}</div>`}
    <div class="huerta-plant-info">
      <div class="huerta-plant-name">${escHtml(p.nombre)}</div>
      ${p.nombreCientifico ? `<div class="huerta-plant-sci">${escHtml(p.nombreCientifico)}</div>` : ""}
      ${p.tipo ? `<span class="huerta-plant-tipo">${escHtml(p.tipo)}</span>` : ""}
    </div>
  </button>`;
}

function _huertaEmoji(tipo) {
  return { Hierba:"🌿", Flor:"🌸", Vegetal:"🥬", Hoja:"🍃", Fruto:"🍅", Tubérculo:"🥔", Hongo:"🍄", Árbol:"🌳", Arbusto:"🫐", Otra:"🌱" }[tipo] || "🌱";
}

// ── Plant detail overlay ─────────────────────────────
function openHuertaPlant(id) {
  const p = (D.huerta_plantas || []).find(x => x._id === id);
  if (!p) return;
  const emoji = _huertaEmoji(p.tipo);
  const mesesStrip = Array.from({length:12}, (_, i) => {
    const active = (p.meses || []).includes(i + 1);
    const s = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i];
    return `<div class="huerta-mes-dot${active?" active":""}">${s}</div>`;
  }).join("");

  let overlay = document.getElementById("huerta-detail-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "huerta-detail-overlay";
    overlay.className = "huerta-detail";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="huerta-detail-bg" onclick="closeHuertaDetail()"></div>
    <div class="huerta-detail-sheet">
      ${p.foto
        ? `<img src="${escHtml(p.foto)}" class="huerta-detail-img" alt="${escHtml(p.nombre)}" onerror="this.outerHTML='<div class=\\"huerta-detail-img-placeholder\\">${emoji}</div>'">`
        : `<div class="huerta-detail-img-placeholder">${emoji}</div>`}
      <div class="huerta-detail-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
          <div>
            <div class="huerta-detail-name">${escHtml(p.nombre)}</div>
            ${p.nombreCientifico ? `<div class="huerta-detail-sci">${escHtml(p.nombreCientifico)}</div>` : ""}
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;margin-top:4px">
            <button class="ghost-btn ghost-btn-sm" onclick="oHuertaM('${escHtml(id)}')">Editar</button>
            <button class="ghost-btn ghost-btn-sm" style="color:var(--red)" onclick="deleteHuertaPlanta('${escHtml(id)}')">Eliminar</button>
          </div>
        </div>
        ${p.tipo || p.procedencia ? `<div class="huerta-detail-row">${p.tipo?`<span class="huerta-detail-tag">${escHtml(p.tipo)}</span>`:""}${p.procedencia?`<span class="huerta-detail-tag" style="background:var(--bg);color:var(--muted)">${escHtml(p.procedencia)}</span>`:""}</div>` : ""}
        <div class="huerta-detail-section">
          <div class="huerta-detail-section-title">Temporada</div>
          <div class="huerta-meses-strip">${mesesStrip}</div>
        </div>
        ${p.descripcion ? `<div class="huerta-detail-section"><div class="huerta-detail-section-title">Descripción</div><div class="huerta-detail-text">${escHtml(p.descripcion)}</div></div>` : ""}
        ${p.usos ? `<div class="huerta-detail-section"><div class="huerta-detail-section-title">Usos en cocina</div><div class="huerta-detail-text">${escHtml(p.usos)}</div></div>` : ""}
        ${p.notas ? `<div class="huerta-detail-section"><div class="huerta-detail-section-title">Notas</div><div class="huerta-detail-text">${escHtml(p.notas)}</div></div>` : ""}
      </div>
    </div>`;

  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("open")));
}

function closeHuertaDetail() {
  document.getElementById("huerta-detail-overlay")?.classList.remove("open");
}

// ── Add / Edit modal ─────────────────────────────────
const _HUERTA_TIPOS = ["Hierba","Flor","Vegetal","Hoja","Fruto","Tubérculo","Hongo","Árbol","Arbusto","Otra"];

function oHuertaM(id) {
  closeHuertaDetail();
  const p = id ? (D.huerta_plantas || []).find(x => x._id === id) : null;

  const tipoOpts = _HUERTA_TIPOS.map(t => `<option value="${t}"${p?.tipo===t?" selected":""}>${t}</option>`).join("");
  const mesBtns = Array.from({length:12}, (_, i) => {
    const m = i + 1, active = (p?.meses||[]).includes(m);
    const s = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i];
    return `<button type="button" class="huerta-mes-toggle${active?" active":""}" data-month="${m}" onclick="this.classList.toggle('active')">${s}</button>`;
  }).join("");

  oModal(`
    <div class="modal-head">
      <div class="modal-title">${p ? "Editar planta" : "Nueva planta"}</div>
      <button class="primary-btn" style="font-size:13px;padding:7px 16px" onclick="saveHuertaPlanta()">Guardar</button>
    </div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
      <input type="hidden" id="hm-id" value="${escHtml(p?._id||"")}">
      <div>
        <label class="form-label">Nombre *</label>
        <input class="form-input" id="hm-nombre" placeholder="Ej. Albahaca" value="${escHtml(p?.nombre||"")}">
      </div>
      <div>
        <label class="form-label">Nombre científico</label>
        <input class="form-input" id="hm-sci" placeholder="Ej. Ocimum basilicum" value="${escHtml(p?.nombreCientifico||"")}">
      </div>
      <div>
        <label class="form-label">Tipo</label>
        <select class="form-input" id="hm-tipo"><option value="">Seleccionar…</option>${tipoOpts}</select>
      </div>
      <div>
        <label class="form-label">Meses de temporada</label>
        <div class="huerta-mes-toggle-row">${mesBtns}</div>
      </div>
      <div>
        <label class="form-label">Descripción</label>
        <textarea class="form-input" id="hm-desc" rows="3" placeholder="Características, origen…">${escHtml(p?.descripcion||"")}</textarea>
      </div>
      <div>
        <label class="form-label">Usos en cocina</label>
        <textarea class="form-input" id="hm-usos" rows="2" placeholder="Aplicaciones culinarias…">${escHtml(p?.usos||"")}</textarea>
      </div>
      <div>
        <label class="form-label">Procedencia</label>
        <input class="form-input" id="hm-proc" placeholder="Ej. Huerta propia" value="${escHtml(p?.procedencia||"")}">
      </div>
      <div>
        <label class="form-label">Foto</label>
        <div class="huerta-foto-picker">
          <div class="huerta-foto-preview" id="hm-foto-preview">
            ${p?.foto ? `<img src="${escHtml(p.foto)}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : `<span style="font-size:36px">📷</span>`}
          </div>
          <input type="hidden" id="hm-foto-url" value="${escHtml(p?.foto||"")}">
          <input type="file" id="hm-foto-file" accept="image/*" style="display:none" onchange="previewHuertaFoto(this)">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="ghost-btn ghost-btn-sm" onclick="document.getElementById('hm-foto-file').click()">
              📷 Elegir foto
            </button>
            ${p?.foto ? `<button type="button" class="ghost-btn ghost-btn-sm" style="color:var(--red)" id="hm-foto-clear" onclick="clearHuertaFoto()">Quitar foto</button>` : `<span id="hm-foto-clear" style="display:none"></span>`}
          </div>
        </div>
      </div>
      <div>
        <label class="form-label">Notas</label>
        <textarea class="form-input" id="hm-notas" rows="2" placeholder="Observaciones…">${escHtml(p?.notas||"")}</textarea>
      </div>
      <div class="mf">
        <button class="secondary-btn" onclick="cModal()">Cancelar</button>
        <button class="primary-btn" onclick="saveHuertaPlanta()">Guardar planta</button>
      </div>
    </div>`);
}

function previewHuertaFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById("hm-foto-preview");
  const clearBtn = document.getElementById("hm-foto-clear");
  const reader = new FileReader();
  reader.onload = e => {
    if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`;
    if (clearBtn) { clearBtn.style.display = ""; clearBtn.textContent = "Quitar foto"; }
    // Clear the existing URL since we have a new file
    const urlField = document.getElementById("hm-foto-url");
    if (urlField) urlField.value = "";
  };
  reader.readAsDataURL(file);
}

function clearHuertaFoto() {
  const preview = document.getElementById("hm-foto-preview");
  const fileInput = document.getElementById("hm-foto-file");
  const urlField = document.getElementById("hm-foto-url");
  const clearBtn = document.getElementById("hm-foto-clear");
  if (preview) preview.innerHTML = `<span style="font-size:36px">📷</span>`;
  if (fileInput) fileInput.value = "";
  if (urlField) urlField.value = "";
  if (clearBtn) clearBtn.style.display = "none";
}

async function saveHuertaPlanta() {
  const nombre = document.getElementById("hm-nombre")?.value.trim();
  if (!nombre) { toast("El nombre es obligatorio", "err"); return; }

  // Upload photo if a file was selected
  let fotoUrl = document.getElementById("hm-foto-url")?.value || "";
  const fileInput = document.getElementById("hm-foto-file");
  const file = fileInput?.files[0];
  if (file) {
    if (storageMode === "firebase" && typeof firebase !== "undefined" && firebase.storage) {
      try {
        toast("Subiendo foto…");
        const storageRef = firebase.storage().ref(`huerta_plantas/${Date.now()}_${file.name}`);
        const snap = await storageRef.put(file);
        fotoUrl = await snap.ref.getDownloadURL();
      } catch(e) {
        toast("Error subiendo foto: " + e.message, "err");
        return;
      }
    } else {
      // Local fallback: store as base64 (in-memory only, not persisted)
      fotoUrl = await new Promise(res => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsDataURL(file);
      });
    }
  }

  const meses = [...document.querySelectorAll(".huerta-mes-toggle.active")].map(b => parseInt(b.dataset.month));
  const data = {
    nombre,
    nombreCientifico: document.getElementById("hm-sci")?.value.trim() || "",
    tipo:             document.getElementById("hm-tipo")?.value || "",
    descripcion:      document.getElementById("hm-desc")?.value.trim() || "",
    usos:             document.getElementById("hm-usos")?.value.trim() || "",
    procedencia:      document.getElementById("hm-proc")?.value.trim() || "",
    foto:             fotoUrl,
    notas:            document.getElementById("hm-notas")?.value.trim() || "",
    meses,
    fecha:            new Date().toISOString(),
  };

  const existingId = document.getElementById("hm-id")?.value;

  if (storageMode === "firebase" && db) {
    try {
      if (existingId) {
        await db.collection("huerta_plantas").doc(existingId).update(data);
        const idx = (D.huerta_plantas || []).findIndex(x => x._id === existingId);
        if (idx !== -1) D.huerta_plantas[idx] = { ...D.huerta_plantas[idx], ...data };
      } else {
        const ref = await db.collection("huerta_plantas").add(data);
        // Store _id inside the document so loadFromFirebase can retrieve it
        await ref.update({ _id: ref.id });
        if (!D.huerta_plantas) D.huerta_plantas = [];
        D.huerta_plantas.push({ _id: ref.id, ...data });
      }
      cModal();
      toast("✓ " + (existingId ? "Planta actualizada" : "Planta añadida"));
      rHuerta();
    } catch(e) {
      toast("Error: " + e.message, "err");
    }
  } else {
    // Local mode: generate a simple _id
    if (!D.huerta_plantas) D.huerta_plantas = [];
    if (existingId) {
      const idx = D.huerta_plantas.findIndex(x => x._id === existingId);
      if (idx !== -1) D.huerta_plantas[idx] = { ...D.huerta_plantas[idx], ...data };
    } else {
      const newId = "local_" + Date.now();
      D.huerta_plantas.push({ _id: newId, ...data });
    }
    persistLocal();
    cModal();
    toast("✓ " + (existingId ? "Planta actualizada" : "Planta añadida"));
    rHuerta();
  }
}

async function deleteHuertaPlanta(id) {
  if (!confirm("¿Eliminar esta planta?")) return;
  closeHuertaDetail();
  if (storageMode === "firebase" && db) {
    try {
      await db.collection("huerta_plantas").doc(id).delete();
    } catch(e) { toast("Error: " + e.message, "err"); return; }
  }
  D.huerta_plantas = (D.huerta_plantas || []).filter(x => x._id !== id);
  if (storageMode !== "firebase") persistLocal();
  toast("✓ Planta eliminada");
  rHuerta();
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



// ── Migración calamar: actualiza Firestore directamente por nombre ───────────
(async function _fixCalamarFirestore() {
  // Esperar a Firebase (máx 20 s)
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (storageMode !== "firebase" || !db) continue;

    try {
      const snap = await db.collection("cebo_recetas").get();
      let targetDoc = null;
      for (const doc of snap.docs) {
        const d = doc.data();
        if (d.nombre && d.nombre.includes("Calamar de anzuelo")) {
          // Comprobar si ya está correcto
          const ok = d.pasos && d.pasos.length > 0 &&
            d.subrecetas && d.subrecetas[0] &&
            d.subrecetas[0].ingredientes?.[0]?.i === "Calamar potera";
          if (ok) return; // Ya está bien, no hacer nada
          targetDoc = doc;
          break;
        }
      }
      if (!targetDoc) continue; // no cargó aún

      await targetDoc.ref.update({
        descripcion: "Tallarín de calamar de potera sobre crema de yema, salsa rancio ibérico con caldo de jamón y polvo de tinta de calamar.",
        alergenos: ["Huevos","Moluscos","Lácteos"],
        ingredientes: [
          {i:"Bote esencia Joselito curado",c:"",u:""},
          {i:"Garum colatura de anchoa",c:"",u:""}
        ],
        subrecetas: [
          {
            nombre:"Cebo calamar producido",
            descripcion:"Rendimiento: de 12 kg de calamar potera se obtienen 4,3 kg de calamar producido.",
            ingredientes:[{i:"Calamar potera",c:"12",u:"kg"}],
            pasos:[
              "Trabajar siempre con baños maría invertidos con hielo para mantener el calamar lo más frío posible.",
              "Retirar las patas, cabeza, cococha, tripas y pluma.",
              "Cortar a la mitad para abrir su cuerpo.",
              "Quitar la punta de arriba y cortar la base.",
              "Retirar perfectamente las dos telillas (exterior e interior).",
              "Desangrar en agua con hielo y un punto de sal para limpiar el resto de tinta.",
              "Superponer los cuerpos uno encima de otro y congelar en el abatidor en forma de bloque.",
              "Cortar en la corta fiambres para obtener el tallarín del tamaño deseado."
            ]
          },
          {
            nombre:"Cebo crema yema premium",
            descripcion:"",
            ingredientes:[
              {i:"Yemas de huevo",c:"15",u:"uds"},
              {i:"Pimienta",c:"2",u:"g"},
              {i:"Sal",c:"2",u:"g"}
            ],
            pasos:[
              "Separar las yemas de las claras y colarlas para eliminar cualquier resto mucoso.",
              "Salpimentar las yemas e introducirlas en una bolsa de vacío.",
              "Sellar la bolsa lo más al filo posible para poder estirar el contenido.",
              "Cocinar en horno con 100% de humedad a 68 °C durante 10 minutos.",
              "Verificar textura: al inclinar la bolsa el contenido debe descender lentamente con consistencia densa. Si no, cocinar 5 minutos más.",
              "Transferir a mangas pasteleras y conservar refrigerado."
            ]
          },
          {
            nombre:"Cebo caldo de jamón",
            descripcion:"",
            ingredientes:[
              {i:"Huesos de jamón",c:"20",u:"kg"},
              {i:"Agua",c:"40",u:"l"},
              {i:"Cebolla",c:"3",u:"uds"},
              {i:"Garbanzos",c:"1",u:"kg"}
            ],
            pasos:[
              "Hidratar los garbanzos 12 horas antes.",
              "Cortar la cebolla en mirepoix y quemar las caras en planchón o a la brasa.",
              "Escaldar 3 veces el codillo del jamón.",
              "Cocer todo junto durante 2 horas y 20 min.",
              "Reposar otras 2 horas todo junto a fuego lento.",
              "Colar, desgrasar y reducir."
            ]
          },
          {
            nombre:"Cebo polvo de tinta de calamar",
            descripcion:"",
            ingredientes:[{i:"Polvo de tinta de calamar",c:"",u:""}],
            pasos:["Poner el polvo de tinta de calamar dentro de unas gasas."]
          },
          {
            nombre:"Cebo salsa rancio ibérico",
            descripcion:"",
            ingredientes:[
              {i:"Nata líquida 35%",c:"150",u:"g"},
              {i:"Cebo caldo de jamón",c:"500",u:"g"},
              {i:"Patata agria",c:"120",u:"g"},
              {i:"Goma xantana",c:"0,6",u:"g"}
            ],
            pasos:[
              "Cocer la patata en cachelos en el caldo de jamón.",
              "Triturar.",
              "Añadir la nata y colar por chino fino."
            ]
          }
        ],
        pasos:[
          "Poner en el centro del plato un punto pequeño de crema yema.",
          "Poner la cantidad de tallarín de calamar encima del punto.",
          "Espolvorear polvo de tinta de calamar encima del tallarín.",
          "Salsear alrededor del tallarín."
        ],
        notas:"De 12 kg de calamar potera se obtienen 4,3 kg de calamar producido."
      });

      toast("✓ Receta calamar de anzuelo actualizada");
      return;
    } catch(e) {
      console.warn("Fix calamar error:", e);
      return;
    }
  }
})();

// ── Pull to refresh ──────────────────────────────────────
(function ptrInit() {
  const indicator = document.getElementById("ptr-indicator");
  if (!indicator) return;

  let startY = 0;
  let pulling = false;
  let triggered = false;
  const THRESHOLD = 70;

  function isDrawerOpen() {
    return !!(
      document.querySelector("#restdet.open") ||
      document.querySelector("#rdet.open") ||
      document.querySelector("#modal.open") ||
      document.querySelector(".modal-overlay.active") ||
      document.querySelector(".huerta-detail-overlay.active")
    );
  }

  document.addEventListener("touchstart", function(e) {
    if (isDrawerOpen()) return;
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
      triggered = false;
    }
  }, { passive: true });

  document.addEventListener("touchmove", function(e) {
    if (!pulling || triggered) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { pulling = false; return; }
    // Block native overscroll so our indicator shows cleanly
    e.preventDefault();
    const progress = Math.min(dy / THRESHOLD, 1);
    const ty = Math.min(dy * 0.5, 54);
    indicator.style.transition = "none";
    indicator.style.transform = `translateY(${ty}px)`;
    indicator.style.opacity = String(Math.min(progress * 1.5, 1));
    indicator.querySelector(".ptr-icon").style.transform = `rotate(${progress * 270}deg)`;
  }, { passive: false });

  document.addEventListener("touchend", function(e) {
    if (!pulling) return;
    const dy = e.changedTouches[0].clientY - startY;
    pulling = false;
    indicator.style.transition = "transform .22s ease, opacity .22s";

    if (dy >= THRESHOLD) {
      triggered = true;
      indicator.style.transform = "translateY(54px)";
      indicator.style.opacity = "1";
      indicator.classList.add("ptr-spinning");
      setTimeout(() => location.reload(), 400);
    } else {
      indicator.style.transform = "translateY(-56px)";
      indicator.style.opacity = "0";
      indicator.querySelector(".ptr-icon").style.transform = "";
    }
  }, { passive: true });
})();

// ══════════════════════════════════════════════════════
// REPORTES MENSUALES
// ══════════════════════════════════════════════════════

let _reportesList = [];
let _reportesUnsub = null;
let _repView = "dashboard"; // "dashboard" | "form" | "detail"
let _repActiveId = null;
let _repState = {};

const RESTAURANTES = ["OBA", "ME x Cañitas Maite Malaga", "Cebo", "EÑE", "Can Domo"];

let _repAdjFiles = []; // File objects pendientes de subir con el reporte

function _repInit() {
  _repAdjFiles = [];
  const encRests = _esEncargado() ? _encRestList() : [];
  _repState = {
    restaurante: encRests.length === 1 ? encRests[0] : "", mes: "", anio: new Date().getFullYear(), responsable: "",
    urgencia: "No urgente",
    facturacion: "", comensales: "", ticketMedio: "", eventosCifra: "", valoracion: "",
    cartaPlatosActivos: "", cartaRecetasModificadas: "", cartaCambios: "", cartaPlatoDestacado: "",
    eventosRealizados: [], eventosProximos: [],
    proveedoresCambios: [], proveedoresIncidencias: [],
    equipoPlantilla: "", equipoAltasBajas: "", equipoObservaciones: "",
    calidadValoracion: "", calidadResenas: "", calidadIncidencias: [],
    notasObservaciones: "", notasPrioridades: [], notasUrgenciaOba: "No urgente"
  };
}

function showReportesPanel() {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".hnav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-reportes")?.classList.add("active");
  document.querySelector('.nav-btn[data-panel="reportes"]')?.classList.add("active");
  document.querySelector('.hnav-btn[data-panel="reportes"]')?.classList.add("active");
  scrollTop();
  closeHamburger();
  const fb = document.getElementById("ped-float-bar");
  if (fb) fb.classList.remove("visible");
  if (sessionStorage.getItem(REPORTES_ONLY_KEY) === "1") {
    // Report writers: straight to a fresh form, never the dashboard.
    if (_repView !== "form") {
      _repInit();
      _repView = "form";
    }
    rRepInner();
  } else if (sessionStorage.getItem(REPORTES_SESSION_KEY) === "1") {
    loadReportes();
  } else {
    _repRenderGate();
  }
}

function _repRenderGate() {
  const el = document.getElementById("rep-inner");
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:24px">
      <div style="background:var(--surface);border-radius:24px;box-shadow:var(--shadow);padding:32px 28px;width:100%;max-width:360px">
        <div style="text-align:center;margin-bottom:24px">
          <img src="./icons/oba-logo-white.png" alt="OBA" style="width:48px;margin-bottom:12px;opacity:.85">
          <div class="eyebrow" style="margin-bottom:4px">Acceso restringido</div>
          <h2 style="font-size:1.4rem;margin:0 0 4px">Reportes mensuales</h2>
          <p style="color:var(--muted);font-size:13px;margin:0">Introduce tus credenciales para continuar</p>
        </div>
        <label class="sr-only" for="rep-gate-usr">Usuario</label>
        <input class="login-input" type="text" id="rep-gate-usr" placeholder="Usuario" autocomplete="username"
          style="margin-bottom:10px" onkeydown="if(event.key==='Enter')document.getElementById('rep-gate-pwd').focus()">
        <label class="sr-only" for="rep-gate-pwd">Contraseña</label>
        <input class="login-input" type="password" id="rep-gate-pwd" placeholder="Contraseña" autocomplete="current-password"
          style="margin-bottom:10px" onkeydown="if(event.key==='Enter')repUnlockPanel()">
        <button class="primary-btn" style="width:100%" onclick="repUnlockPanel()">Entrar</button>
        <div class="login-error" id="rep-gate-err" style="margin-top:8px;text-align:center"></div>
      </div>
    </div>`;
}

function repUnlockPanel() {
  const usr = (document.getElementById("rep-gate-usr")?.value || "").trim();
  const pwd = document.getElementById("rep-gate-pwd")?.value || "";
  const err = document.getElementById("rep-gate-err");
  if (usr === REPORTES_USER && pwd === REPORTES_PWD) {
    sessionStorage.setItem(REPORTES_SESSION_KEY, "1");
    loadReportes();
  } else {
    if (err) { err.textContent = "Usuario o contraseña incorrectos"; setTimeout(() => { err.textContent = ""; }, 2500); }
  }
}

function loadReportes() {
  if (!storageMode || storageMode !== "firebase") {
    _repView = "dashboard";
    rRepInner();
    return;
  }
  if (_reportesUnsub) {
    rRepInner(); // already subscribed, data ready
    return;
  }
  // Show skeleton while first snapshot loads
  const el = document.getElementById("rep-inner");
  if (el && !_reportesList.length) {
    el.innerHTML = `<div class="rep-skeleton-wrap">
      <div class="rep-skeleton-head"></div>
      <div class="rep-skeleton-card"></div>
      <div class="rep-skeleton-card"></div>
      <div class="rep-skeleton-card rep-skeleton-card--short"></div>
    </div>`;
  }
  _reportesUnsub = db.collection("reportes")
    .orderBy("fechaEnvio", "desc")
    .onSnapshot(snap => {
      _reportesList = snap.docs.map(d => ({ _fsId: d.id, ...d.data() }));
      rRepInner();
    }, err => {
      console.warn("reportes snapshot error:", err);
      rRepInner();
    });
  _loadJsPDF().catch(() => {}); // precalienta el generador de PDF en segundo plano
}

function rRepInner() {
  const el = document.getElementById("rep-inner");
  if (!el) return;
  if (_repView === "form") { el.innerHTML = _repFormHTML(); return; }
  if (_repView === "detail") { el.innerHTML = _repDetailHTML(_repActiveId); return; }
  el.innerHTML = _repDashHTML();
}

// ── Dashboard ──────────────────────────────────────────
function _repFilteredList() {
  const rfil = document.getElementById("rep-filter-rest")?.value || "";
  const mfil = document.getElementById("rep-filter-mes")?.value || "";
  let list = _reportesList;
  if (_esEncargado()) {
    const rests = _encRestList();
    list = list.filter(r => rests.includes(r.restaurante));
  }
  if (rfil) list = list.filter(r => r.restaurante === rfil);
  if (mfil) list = list.filter(r => r.mes === mfil);
  // Destacados primero (orden estable: dentro de cada grupo se mantiene por fecha)
  return list.slice().sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
}

function _repDashHTML() {
  const rfil = document.getElementById("rep-filter-rest")?.value || "";
  const mfil = document.getElementById("rep-filter-mes")?.value || "";
  const list = _repFilteredList();

  const urgentes = list.filter(r => r.urgencia === "Urgente OBA");

  const alertsHTML = urgentes.map(r => `
    <div class="rep-urgent-alert">
      <div class="rep-urgent-alert-icon">🚨</div>
      <div class="rep-urgent-alert-body">
        <strong>${safeText(r.restaurante)} — ${safeText(r.mes)} ${safeText(String(r.anio || ""))}</strong>
        ${safeText(r.notas?.urgenciaOba || "Requiere atención de OBA")}
      </div>
    </div>`).join("");

  const restDisponibles = _esEncargado() ? _encRestList() : RESTAURANTES;
  const filterRest = restDisponibles.map(r => `<option value="${safeText(r)}"${rfil===r?" selected":""}>${safeText(r)}</option>`).join("");
  const filterMes = MESES.map(m => `<option value="${safeText(m)}"${mfil===m?" selected":""}>${safeText(m)}</option>`).join("");

  const cardsHTML = list.length
    ? list.map(r => _repCardHTML(r)).join("")
    : `<div class="rep-dash-empty"><p>No hay reportes${rfil||mfil ? " con estos filtros" : " todavía"}.</p></div>`;

  return `
    <div class="section-head section-head-lg">
      <div>
        <div class="eyebrow">Gestión interna</div>
        <h1>Reportes mensuales</h1>
        <p>Seguimiento por restaurante y mes.</p>
      </div>
      <button class="primary-btn" onclick="oReporteForm()">+ Nuevo reporte</button>
    </div>
    ${alertsHTML}
    <div class="rep-dash-filters">
      ${(_esEncargado() && restDisponibles.length <= 1) ? "" : `<select class="field-select" id="rep-filter-rest" onchange="rRepFilter()">
        <option value="">Todos${_esEncargado() ? " los míos" : " los restaurantes"}</option>${filterRest}
      </select>`}
      <select class="field-select" id="rep-filter-mes" onchange="rRepFilter()">
        <option value="">Todos los meses</option>${filterMes}
      </select>
    </div>
    <div id="rep-cards">${cardsHTML}</div>`;
}

function rRepFilter() {
  const el = document.getElementById("rep-cards");
  if (!el) return;
  const list = _repFilteredList();
  el.innerHTML = list.length
    ? list.map(r => _repCardHTML(r)).join("")
    : `<div class="rep-dash-empty"><p>No hay reportes con estos filtros.</p></div>`;
}

function _repUrgBadge(u) {
  const cls = u === "Urgente OBA" ? "urgente" : u === "Consulta" ? "consulta" : "no";
  return `<span class="rep-badge rep-badge-${cls}">${safeText(u||"No urgente")}</span>`;
}
function _repValBadge(v) {
  const cls = v === "Difícil" ? "dificil" : v === "Regular" ? "regular" : "bueno";
  return `<span class="rep-badge rep-badge-${cls}">${safeText(v||"—")}</span>`;
}

function _repCardHTML(r) {
  const kpis = r.kpis || {};
  const kpiHTML = [
    kpis.facturacion ? `<div class="rep-card-kpi"><strong>${safeText(String(kpis.facturacion))}€</strong><span>Facturación</span></div>` : "",
    kpis.comensales ? `<div class="rep-card-kpi"><strong>${safeText(String(kpis.comensales))}</strong><span>Comensales</span></div>` : "",
    kpis.ticketMedio ? `<div class="rep-card-kpi"><strong>${safeText(String(kpis.ticketMedio))}€</strong><span>Ticket medio</span></div>` : "",
  ].filter(Boolean).join("");

  const dest = !!r.destacado;
  return `
    <div class="rep-card${dest ? " destacada" : ""}" onclick="verReporte('${safeText(r._fsId)}')">
      <div class="rep-card-head">
        <div>
          <div class="rep-card-rest">${dest ? '<span class="rep-star">★</span> ' : ""}${safeText(r.restaurante||"—")}</div>
          <div class="rep-card-meta">${safeText(r.mes||"")} ${safeText(String(r.anio||""))} · ${safeText(r.responsable||"")}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          ${_repUrgBadge(r.urgencia)}
          ${kpis.valoracion ? _repValBadge(kpis.valoracion) : ""}
        </div>
      </div>
      ${kpiHTML ? `<div class="rep-card-kpis">${kpiHTML}</div>` : ""}
      <div class="rep-card-actions">
        <button class="rep-act-btn${dest ? " active" : ""}" onclick="event.stopPropagation();repToggleDestacado('${safeText(r._fsId)}')">${dest ? "★ Destacado" : "☆ Destacar"}</button>
        <button class="rep-act-btn" onclick="event.stopPropagation();repSharePDF('${safeText(r._fsId)}')">Compartir PDF</button>
        <button class="rep-act-btn rep-act-danger" onclick="event.stopPropagation();repEliminar('${safeText(r._fsId)}')">Eliminar</button>
      </div>
    </div>`;
}

// ── Form ───────────────────────────────────────────────
function oReporteForm() {
  _repInit();
  _repView = "form";
  rRepInner();
  scrollTop();
}

function repBack() {
  if (sessionStorage.getItem(REPORTES_ONLY_KEY) === "1") return; // no dashboard for report writers
  _repView = "dashboard";
  _repActiveId = null;
  rRepInner();
  scrollTop();
}

function _repFormHTML() {
  const s = _repState;
  const repOnly = sessionStorage.getItem(REPORTES_ONLY_KEY) === "1";
  const encRests = _esEncargado() ? _encRestList() : [];
  const restDisp = encRests.length ? encRests : RESTAURANTES;
  const restOpts = restDisp.map(r => `<option value="${safeText(r)}"${s.restaurante===r?" selected":""}>${safeText(r)}</option>`).join("");
  const mesOpts = MESES.map(m => `<option value="${safeText(m)}"${s.mes===m?" selected":""}>${safeText(m)}</option>`).join("");
  const anioOpts = [2024,2025,2026,2027].map(y => `<option value="${y}"${s.anio===y?" selected":""}>${y}</option>`).join("");

  return `<div class="rep-form-wrap">
    <div class="rep-form-head">
      ${repOnly ? "" : `<button class="ghost-btn ghost-btn-sm" onclick="repBack()">← Volver</button>`}
      <div class="rep-form-head-info">
        <div class="eyebrow" style="margin:0">Reporte mensual</div>
        <div class="rep-form-head-title">Nuevo reporte</div>
      </div>
    </div>

    <div class="rep-progress-wrap">
      <div class="rep-progress-bar"><div class="rep-progress-fill" id="rep-prog-fill" style="width:0%"></div></div>
      <div class="rep-progress-label" id="rep-prog-label">0 de 8 secciones completadas</div>
    </div>

    <!-- A: Identificación -->
    <div class="rep-section" id="rep-sec-a">
      <div class="rep-section-title">
        <div class="rep-section-letter">A</div>
        <div class="rep-section-name">Identificación</div>
      </div>
      <div class="fr"><label>Restaurante</label>
        <select class="field-select" onchange="repUpdate('restaurante',this.value)"${encRests.length === 1 ? " disabled" : ""}>
          <option value="">Selecciona…</option>${restOpts}
        </select>
      </div>
      <div class="fr"><label>Mes</label>
        <select class="field-select" onchange="repUpdate('mes',this.value)">
          <option value="">Selecciona…</option>${mesOpts}
        </select>
      </div>
      <div class="fr"><label>Año</label>
        <select class="field-select" onchange="repUpdate('anio',parseInt(this.value))">
          ${anioOpts}
        </select>
      </div>
      <div class="fr"><label>Responsable</label>
        <input type="text" class="field-input" placeholder="Nombre del responsable" value="${safeText(s.responsable)}" oninput="repUpdate('responsable',this.value)">
      </div>
    </div>

    <!-- B: Cifras -->
    <div class="rep-section" id="rep-sec-b">
      <div class="rep-section-title">
        <div class="rep-section-letter">B</div>
        <div class="rep-section-name">Cifras del mes</div>
      </div>
      <div class="rep-kpi-grid">
        <div class="fr"><label>Facturación (€)</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.facturacion))}" oninput="repUpdate('facturacion',this.value)">
        </div>
        <div class="fr"><label>Comensales</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.comensales))}" oninput="repUpdate('comensales',this.value)">
        </div>
        <div class="fr"><label>Ticket medio (€)</label>
          <input type="number" class="field-input" placeholder="0.00" step="0.01" value="${safeText(String(s.ticketMedio))}" oninput="repUpdate('ticketMedio',this.value)">
        </div>
        <div class="fr"><label>Eventos realizados</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.eventosCifra))}" oninput="repUpdate('eventosCifra',this.value)">
        </div>
      </div>
      <div class="fr" style="margin-top:12px"><label>Valoración general del mes</label>
        <div class="rep-semaforo">
          <button type="button" class="rep-sem-btn rep-sem-bueno${s.valoracion==='Bueno'?' active':''}" onclick="repSetVal('Bueno')">Bueno</button>
          <button type="button" class="rep-sem-btn rep-sem-regular${s.valoracion==='Regular'?' active':''}" onclick="repSetVal('Regular')">Regular</button>
          <button type="button" class="rep-sem-btn rep-sem-dificil${s.valoracion==='Difícil'?' active':''}" onclick="repSetVal('Difícil')">Difícil</button>
        </div>
      </div>
    </div>

    <!-- C: Eventos -->
    <div class="rep-section" id="rep-sec-c">
      <div class="rep-section-title">
        <div class="rep-section-letter">C</div>
        <div class="rep-section-name">Eventos</div>
      </div>
      <div class="fr"><label>Eventos realizados este mes</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-eventosRealizados">${_repListItemsHTML("eventosRealizados")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-eventosRealizados" placeholder="Añadir evento…" onkeydown="if(event.key==='Enter'){repAddItem('eventosRealizados');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('eventosRealizados')">+</button>
          </div>
        </div>
      </div>
      <div class="fr" style="margin-top:12px"><label>Eventos próximos</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-eventosProximos">${_repListItemsHTML("eventosProximos")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-eventosProximos" placeholder="Añadir evento próximo…" onkeydown="if(event.key==='Enter'){repAddItem('eventosProximos');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('eventosProximos')">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- D: Carta y recetas -->
    <div class="rep-section" id="rep-sec-d">
      <div class="rep-section-title">
        <div class="rep-section-letter">D</div>
        <div class="rep-section-name">Carta y recetas</div>
      </div>
      <div class="rep-kpi-grid">
        <div class="fr"><label>Platos activos en carta</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.cartaPlatosActivos))}" oninput="repUpdate('cartaPlatosActivos',this.value)">
        </div>
        <div class="fr"><label>Recetas modificadas</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.cartaRecetasModificadas))}" oninput="repUpdate('cartaRecetasModificadas',this.value)">
        </div>
      </div>
      <div class="fr" style="margin-top:4px"><label>Cambios de carta</label>
        <textarea class="field-input" rows="3" placeholder="Describe los cambios realizados en carta…" oninput="repUpdate('cartaCambios',this.value)">${safeText(s.cartaCambios)}</textarea>
      </div>
      <div class="fr"><label>Plato destacado del mes</label>
        <input type="text" class="field-input" placeholder="Nombre del plato estrella" value="${safeText(s.cartaPlatoDestacado)}" oninput="repUpdate('cartaPlatoDestacado',this.value)">
      </div>
    </div>

    <!-- E: Proveedores -->
    <div class="rep-section" id="rep-sec-e">
      <div class="rep-section-title">
        <div class="rep-section-letter">E</div>
        <div class="rep-section-name">Proveedores</div>
      </div>
      <div class="fr"><label>Cambios de proveedor</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-proveedoresCambios">${_repListItemsHTML("proveedoresCambios")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-proveedoresCambios" placeholder="Añadir cambio…" onkeydown="if(event.key==='Enter'){repAddItem('proveedoresCambios');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('proveedoresCambios')">+</button>
          </div>
        </div>
      </div>
      <div class="fr" style="margin-top:12px"><label>Incidencias con proveedores</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-proveedoresIncidencias">${_repListItemsHTML("proveedoresIncidencias")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-proveedoresIncidencias" placeholder="Añadir incidencia…" onkeydown="if(event.key==='Enter'){repAddItem('proveedoresIncidencias');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('proveedoresIncidencias')">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- F: Equipo -->
    <div class="rep-section" id="rep-sec-f">
      <div class="rep-section-title">
        <div class="rep-section-letter">F</div>
        <div class="rep-section-name">Equipo</div>
      </div>
      <div class="fr"><label>Plantilla actual (personas)</label>
        <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.equipoPlantilla))}" oninput="repUpdate('equipoPlantilla',this.value)">
      </div>
      <div class="fr"><label>Altas y bajas</label>
        <input type="text" class="field-input" placeholder="Ej: 1 alta, 0 bajas" value="${safeText(s.equipoAltasBajas)}" oninput="repUpdate('equipoAltasBajas',this.value)">
      </div>
      <div class="fr"><label>Observaciones de equipo</label>
        <textarea class="field-input" rows="3" placeholder="Ambiente, formación, incidencias de personal…" oninput="repUpdate('equipoObservaciones',this.value)">${safeText(s.equipoObservaciones)}</textarea>
      </div>
    </div>

    <!-- G: Calidad y reseñas -->
    <div class="rep-section" id="rep-sec-g">
      <div class="rep-section-title">
        <div class="rep-section-letter">G</div>
        <div class="rep-section-name">Calidad y reseñas</div>
      </div>
      <div class="rep-kpi-grid">
        <div class="fr"><label>Valoración online (0–5)</label>
          <input type="number" class="field-input" placeholder="4.5" min="0" max="5" step="0.1" value="${safeText(String(s.calidadValoracion))}" oninput="repUpdate('calidadValoracion',this.value)">
        </div>
        <div class="fr"><label>N.º reseñas del mes</label>
          <input type="number" class="field-input" placeholder="0" value="${safeText(String(s.calidadResenas))}" oninput="repUpdate('calidadResenas',this.value)">
        </div>
      </div>
      <div class="fr" style="margin-top:4px"><label>Incidencias de calidad</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-calidadIncidencias">${_repListItemsHTML("calidadIncidencias")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-calidadIncidencias" placeholder="Añadir incidencia…" onkeydown="if(event.key==='Enter'){repAddItem('calidadIncidencias');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('calidadIncidencias')">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- H: Notas y próximos pasos -->
    <div class="rep-section" id="rep-sec-h">
      <div class="rep-section-title">
        <div class="rep-section-letter">H</div>
        <div class="rep-section-name">Notas y próximos pasos</div>
      </div>
      <div class="fr"><label>Observaciones generales</label>
        <textarea class="field-input" rows="3" placeholder="Notas libres del mes…" oninput="repUpdate('notasObservaciones',this.value)">${safeText(s.notasObservaciones)}</textarea>
      </div>
      <div class="fr"><label>Prioridades para el mes siguiente</label>
        <div class="rep-list-editor">
          <div class="rep-list-items" id="rep-list-notasPrioridades">${_repListItemsHTML("notasPrioridades")}</div>
          <div class="rep-list-add">
            <input type="text" class="field-input" id="rep-add-notasPrioridades" placeholder="Añadir prioridad…" onkeydown="if(event.key==='Enter'){repAddItem('notasPrioridades');event.preventDefault()}">
            <button type="button" class="secondary-btn" onclick="repAddItem('notasPrioridades')">+</button>
          </div>
        </div>
      </div>
      <div class="fr" style="margin-top:12px"><label>¿Requiere atención de OBA?</label>
        <div class="rep-semaforo">
          <button type="button" class="rep-sem-btn rep-sem-bueno${s.notasUrgenciaOba==='No urgente'?' active':''}" onclick="repSetUrg('No urgente')">No urgente</button>
          <button type="button" class="rep-sem-btn rep-sem-regular${s.notasUrgenciaOba==='Consulta'?' active':''}" onclick="repSetUrg('Consulta')">Consulta</button>
          <button type="button" class="rep-sem-btn rep-sem-dificil${s.notasUrgenciaOba==='Urgente OBA'?' active':''}" onclick="repSetUrg('Urgente OBA')">Urgente OBA</button>
        </div>
      </div>
    </div>

    <!-- I: Adjuntos -->
    <div class="rep-section" id="rep-sec-adj">
      <div class="rep-section-title">
        <div class="rep-section-letter">I</div>
        <div class="rep-section-name">Archivos adjuntos <span style="font-weight:400;color:var(--muted)">(opcional)</span></div>
      </div>
      <div class="fr"><label>PDF, Excel, Word, imágenes… Máx. 5 archivos de 25 MB</label>
        <div class="rep-list-items" id="rep-adj-list">${_repAdjListHTML()}</div>
        <input type="file" id="rep-adj-input" multiple style="display:none"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.heic,.txt"
          onchange="repAdjPick(this)">
        <button type="button" class="secondary-btn" style="width:100%;margin-top:6px" onclick="document.getElementById('rep-adj-input').click()">+ Añadir archivo</button>
      </div>
    </div>

    <div style="padding:8px 0 32px;display:flex;gap:10px">
      ${repOnly ? "" : `<button class="ghost-btn" onclick="repBack()">Cancelar</button>`}
      <button class="primary-btn" style="flex:1" id="rep-submit-btn" onclick="sReporte()">Enviar reporte</button>
    </div>
  </div>`;
}

function repUpdate(key, val) {
  _repState[key] = val;
  _repUpdateProgress();
}

// ── Adjuntos del formulario ────────────────────────────
function _fmtBytes(n) {
  if (!n && n !== 0) return "";
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n >= 1024) return Math.round(n / 1024) + " KB";
  return n + " B";
}

function _repAdjListHTML() {
  return _repAdjFiles.map((f, idx) => `
    <div class="rep-list-item">
      <span>📎 ${safeText(f.name)} <span style="color:var(--muted);font-size:11px">${_fmtBytes(f.size)}</span></span>
      <button type="button" class="ghost-btn ghost-btn-sm" onclick="repAdjRemove(${idx})" style="padding:2px 8px;flex-shrink:0">✕</button>
    </div>`).join("");
}

function repAdjPick(input) {
  const MAX_FILES = 5;
  const MAX_SIZE = 25 * 1024 * 1024;
  for (const f of Array.from(input.files || [])) {
    if (_repAdjFiles.length >= MAX_FILES) { toast(`Máximo ${MAX_FILES} archivos.`, "error"); break; }
    if (f.size > MAX_SIZE) { toast(`"${f.name}" supera los 25 MB.`, "error"); continue; }
    _repAdjFiles.push(f);
  }
  input.value = "";
  const el = document.getElementById("rep-adj-list");
  if (el) el.innerHTML = _repAdjListHTML();
}

function repAdjRemove(idx) {
  _repAdjFiles.splice(idx, 1);
  const el = document.getElementById("rep-adj-list");
  if (el) el.innerHTML = _repAdjListHTML();
}

function repSetVal(val) {
  _repState.valoracion = val;
  document.querySelectorAll("#rep-sec-b .rep-sem-btn").forEach(b => b.classList.remove("active"));
  const map = { "Bueno": "rep-sem-bueno", "Regular": "rep-sem-regular", "Difícil": "rep-sem-dificil" };
  document.querySelector(`#rep-sec-b .${map[val]}`)?.classList.add("active");
  _repUpdateProgress();
}

function repSetUrg(val) {
  _repState.notasUrgenciaOba = val;
  _repState.urgencia = val;
  document.querySelectorAll("#rep-sec-h .rep-sem-btn").forEach(b => b.classList.remove("active"));
  const map = { "No urgente": "rep-sem-bueno", "Consulta": "rep-sem-regular", "Urgente OBA": "rep-sem-dificil" };
  document.querySelector(`#rep-sec-h .${map[val]}`)?.classList.add("active");
}

function _repListItemsHTML(type) {
  const arr = _repState[type] || [];
  return arr.map((item, idx) => `
    <div class="rep-list-item">
      <span>${safeText(item)}</span>
      <button type="button" class="ghost-btn ghost-btn-sm" onclick="repRemoveItem('${type}',${idx})" style="padding:2px 8px;flex-shrink:0">✕</button>
    </div>`).join("");
}

function repAddItem(type) {
  const inp = document.getElementById(`rep-add-${type}`);
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  if (!Array.isArray(_repState[type])) _repState[type] = [];
  _repState[type].push(val);
  inp.value = "";
  _repRenderList(type, `rep-list-${type}`);
  _repUpdateProgress();
}

function repRemoveItem(type, idx) {
  if (!Array.isArray(_repState[type])) return;
  _repState[type].splice(idx, 1);
  _repRenderList(type, `rep-list-${type}`);
  _repUpdateProgress();
}

function _repRenderList(type, elId) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = _repListItemsHTML(type);
}

function _repUpdateProgress() {
  const s = _repState;
  const checks = [
    !!(s.restaurante && s.mes && s.responsable),
    !!(s.facturacion || s.comensales || s.ticketMedio || s.valoracion),
    !!(s.eventosRealizados.length || s.eventosProximos.length),
    !!(s.cartaCambios || s.cartaPlatosActivos || s.cartaPlatoDestacado),
    !!(s.proveedoresCambios.length || s.proveedoresIncidencias.length),
    !!(s.equipoPlantilla || s.equipoObservaciones || s.equipoAltasBajas),
    !!(s.calidadValoracion || s.calidadResenas || s.calidadIncidencias.length),
    !!(s.notasObservaciones || s.notasPrioridades.length || s.notasUrgenciaOba)
  ];
  const done = checks.filter(Boolean).length;
  const pct = Math.round((done / 8) * 100);
  const fill = document.getElementById("rep-prog-fill");
  const label = document.getElementById("rep-prog-label");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${done} de 8 secciones completadas`;
}

// ── Save ───────────────────────────────────────────────
async function sReporte() {
  const s = _repState;
  if (!s.restaurante || !s.mes || !s.responsable) {
    toast("Completa al menos restaurante, mes y responsable.", "error");
    return;
  }
  if (storageMode !== "firebase") {
    toast("Necesitas Firebase para guardar reportes.", "error");
    return;
  }

  const btn = document.getElementById("rep-submit-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
  const _restoreBtn = () => { if (btn) { btn.disabled = false; btn.textContent = "Enviar reporte"; } };

  // Subir adjuntos a Storage antes de guardar el reporte
  let adjuntos = [];
  if (_repAdjFiles.length && firebase.storage) {
    try {
      for (let i = 0; i < _repAdjFiles.length; i++) {
        const f = _repAdjFiles[i];
        if (btn) btn.textContent = `Subiendo archivo ${i + 1}/${_repAdjFiles.length}…`;
        const ref = firebase.storage().ref(`reportes_adjuntos/${Date.now()}_${f.name}`);
        const snap = await ref.put(f);
        const url = await snap.ref.getDownloadURL();
        adjuntos.push({ nombre: f.name, url, tipo: f.type || "", tamano: f.size || 0 });
      }
    } catch (e) {
      console.error("Error subiendo adjuntos:", e);
      toast("Error subiendo un archivo adjunto: " + e.message, "error");
      _restoreBtn();
      return;
    }
    if (btn) btn.textContent = "Enviando…";
  }

  const doc = {
    adjuntos,
    restaurante: s.restaurante,
    mes: s.mes,
    anio: Number(s.anio) || new Date().getFullYear(),
    responsable: s.responsable,
    fechaEnvio: firebase.firestore.FieldValue.serverTimestamp(),
    estado: "enviado",
    urgencia: s.notasUrgenciaOba || "No urgente",
    kpis: {
      facturacion: s.facturacion ? Number(s.facturacion) : null,
      comensales: s.comensales ? Number(s.comensales) : null,
      ticketMedio: s.ticketMedio ? Number(s.ticketMedio) : null,
      eventos: s.eventosCifra ? Number(s.eventosCifra) : null,
      valoracion: s.valoracion || null
    },
    carta: {
      platosActivos: s.cartaPlatosActivos ? Number(s.cartaPlatosActivos) : null,
      recetasModificadas: s.cartaRecetasModificadas ? Number(s.cartaRecetasModificadas) : null,
      cambios: s.cartaCambios || "",
      platoDestacado: s.cartaPlatoDestacado || ""
    },
    eventos: {
      realizados: s.eventosRealizados || [],
      proximos: s.eventosProximos || []
    },
    proveedores: {
      cambios: s.proveedoresCambios || [],
      incidencias: s.proveedoresIncidencias || []
    },
    equipo: {
      plantilla: s.equipoPlantilla ? Number(s.equipoPlantilla) : null,
      altasBajas: s.equipoAltasBajas || "",
      observaciones: s.equipoObservaciones || ""
    },
    calidad: {
      valoracionOnline: s.calidadValoracion ? Number(s.calidadValoracion) : null,
      resenas: s.calidadResenas ? Number(s.calidadResenas) : null,
      incidencias: s.calidadIncidencias || []
    },
    notas: {
      observaciones: s.notasObservaciones || "",
      prioridades: s.notasPrioridades || [],
      urgenciaOba: s.notasUrgenciaOba || "No urgente"
    }
  };

  db.collection("reportes").add(doc)
    .then(() => {
      if (sessionStorage.getItem(REPORTES_ONLY_KEY) === "1") {
        _repInit();
        _repRenderSent();
        scrollTop();
      } else {
        toast("Reporte enviado correctamente.", "ok");
        _repInit();
        _repView = "dashboard";
        rRepInner();
        scrollTop();
      }
    })
    .catch(err => {
      console.error("Error guardando reporte:", err);
      toast("Error al guardar el reporte. Inténtalo de nuevo.", "error");
      _restoreBtn();
    });
}

// Success screen for report writers (no dashboard access)
function _repRenderSent() {
  const el = document.getElementById("rep-inner");
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:24px">
      <div style="background:var(--surface);border-radius:24px;box-shadow:var(--shadow);padding:40px 32px;width:100%;max-width:400px;text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--green-soft);color:var(--green-deep);font-size:26px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">✓</div>
        <h2 style="font-size:1.3rem;margin:0 0 6px">Reporte enviado</h2>
        <p style="color:var(--muted);font-size:14px;margin:0 0 24px">Gracias. El equipo de Cañitas Gastro lo revisará.</p>
        <button class="primary-btn" style="width:100%" onclick="oReporteForm()">Crear otro reporte</button>
      </div>
    </div>`;
}

// ── Acciones sobre reportes: destacar, eliminar, PDF ──
function repToggleDestacado(fsId) {
  const r = _reportesList.find(x => x._fsId === fsId);
  if (!r || storageMode !== "firebase") return;
  db.collection("reportes").doc(fsId).update({ destacado: !r.destacado })
    .catch(err => { console.error("repToggleDestacado:", err); toast("No se pudo actualizar.", "error"); });
}

function repEliminar(fsId) {
  const r = _reportesList.find(x => x._fsId === fsId);
  if (!r || storageMode !== "firebase") return;
  if (!confirm(`¿Eliminar el reporte de ${r.restaurante || "?"} — ${r.mes || "?"} ${r.anio || ""}?\nEsta acción no se puede deshacer.`)) return;
  db.collection("reportes").doc(fsId).delete()
    .then(() => {
      toast("Reporte eliminado.");
      if (_repView === "detail" && _repActiveId === fsId) {
        _repView = "dashboard";
        _repActiveId = null;
        rRepInner();
      }
    })
    .catch(err => { console.error("repEliminar:", err); toast("No se pudo eliminar.", "error"); });
}

// jsPDF se carga bajo demanda (y se precalienta al abrir el dashboard)
let _jsPDFPromise = null;
function _loadJsPDF() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (_jsPDFPromise) return _jsPDFPromise;
  _jsPDFPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = () => { _jsPDFPromise = null; reject(new Error("No se pudo cargar el generador de PDF")); };
    document.head.appendChild(s);
  });
  return _jsPDFPromise;
}

function _repBuildPdf(jsPDF, r) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - M * 2;
  let y = 20;
  const ensure = (h) => { if (y + h > 279) { doc.addPage(); y = 20; } };
  const title = (t) => {
    ensure(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(130);
    doc.text(t.toUpperCase(), M, y);
    y += 2.5;
    doc.setDrawColor(225); doc.line(M, y, W - M, y);
    y += 6;
  };
  const kv = (k, v) => {
    const val = (v === null || v === undefined || v === "") ? "—" : String(v);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(val, CW - 48);
    ensure(lines.length * 5 + 2);
    doc.setFont("helvetica", "bold"); doc.setTextColor(90);
    doc.text(k, M, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(25);
    doc.text(lines, M + 48, y);
    y += lines.length * 5 + 1.5;
  };
  const lista = (k, arr) => kv(k, (arr && arr.length) ? arr.map(x => "• " + x).join("\n") : "—");

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(0);
  doc.text(`${r.restaurante || "—"} — ${r.mes || ""} ${r.anio || ""}`, M, y);
  y += 7;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(130);
  doc.text(`Reporte mensual · Responsable: ${r.responsable || "—"} · Urgencia: ${r.urgencia || "No urgente"}`, M, y);
  y += 11;

  const kpis = r.kpis || {}, carta = r.carta || {}, ev = r.eventos || {},
        prov = r.proveedores || {}, eq = r.equipo || {}, cal = r.calidad || {}, no = r.notas || {};

  title("Cifras del mes");
  kv("Facturación", kpis.facturacion != null ? kpis.facturacion.toLocaleString("es-ES") + " €" : null);
  kv("Comensales", kpis.comensales);
  kv("Ticket medio", kpis.ticketMedio != null ? kpis.ticketMedio + " €" : null);
  kv("Eventos", kpis.eventos);
  kv("Valoración", kpis.valoracion);

  title("Eventos");
  lista("Realizados", ev.realizados);
  lista("Próximos", ev.proximos);

  title("Carta y recetas");
  kv("Platos activos", carta.platosActivos);
  kv("Recetas modificadas", carta.recetasModificadas);
  kv("Cambios", carta.cambios);
  kv("Plato destacado", carta.platoDestacado);

  title("Proveedores");
  lista("Cambios", prov.cambios);
  lista("Incidencias", prov.incidencias);

  title("Equipo");
  kv("Plantilla", eq.plantilla != null ? eq.plantilla + " personas" : null);
  kv("Altas y bajas", eq.altasBajas);
  kv("Observaciones", eq.observaciones);

  title("Calidad y reseñas");
  kv("Valoración online", cal.valoracionOnline != null ? cal.valoracionOnline + " / 5" : null);
  kv("Reseñas del mes", cal.resenas);
  lista("Incidencias", cal.incidencias);

  title("Notas y próximos pasos");
  kv("Observaciones", no.observaciones);
  lista("Prioridades", no.prioridades);
  kv("Atención OBA", no.urgenciaOba);

  if (r.adjuntos && r.adjuntos.length) {
    title("Archivos adjuntos");
    lista("Archivos", r.adjuntos.map(a => a.nombre || "archivo"));
  }

  ensure(12);
  y += 4;
  doc.setFontSize(8); doc.setTextColor(160);
  doc.text("Generado desde la Intranet OBA", M, y);
  return doc;
}

async function repSharePDF(fsId) {
  const r = _reportesList.find(x => x._fsId === fsId);
  if (!r) return;
  try {
    const jsPDF = await _loadJsPDF();
    const doc = _repBuildPdf(jsPDF, r);
    const clean = (s) => String(s || "").trim().replace(/[^\wáéíóúüñÁÉÍÓÚÜÑ-]+/g, "_");
    const filename = `Reporte_${clean(r.restaurante)}_${clean(r.mes)}_${r.anio || ""}.pdf`;
    const blob = doc.output("blob");
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // Hoja nativa de compartir: el usuario elige WhatsApp, Mail, etc.
      await navigator.share({ files: [file], title: `Reporte ${r.restaurante || ""} — ${r.mes || ""} ${r.anio || ""}` });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("PDF descargado — adjúntalo en WhatsApp o correo.", "ok");
    }
  } catch (err) {
    if (err && err.name === "AbortError") return; // el usuario cerró la hoja de compartir
    console.error("repSharePDF:", err);
    toast("No se pudo generar el PDF.", "error");
  }
}

// ── Detail view ────────────────────────────────────────
function verReporte(fsId) {
  _repActiveId = fsId;
  _repView = "detail";
  rRepInner();
  scrollTop();
}

function _repDetailHTML(fsId) {
  const r = _reportesList.find(x => x._fsId === fsId);
  if (!r) return `<button class="ghost-btn ghost-btn-sm" onclick="repBack()">← Volver</button><p style="color:var(--muted);margin-top:16px">Reporte no encontrado.</p>`;

  const kpis = r.kpis || {};
  const carta = r.carta || {};
  const eventos = r.eventos || {};
  const prov = r.proveedores || {};
  const equipo = r.equipo || {};
  const calidad = r.calidad || {};
  const notas = r.notas || {};

  const tagList = (arr) => arr && arr.length
    ? `<div class="rep-tag-list">${arr.map(t => `<span class="rep-tag">${safeText(t)}</span>`).join("")}</div>`
    : `<span style="color:var(--muted);font-size:13px">—</span>`;

  const row = (label, val) => `<div class="rep-detail-row"><span class="rep-detail-label">${label}</span><span>${val || "—"}</span></div>`;

  return `
    <div class="rep-form-head" style="margin-bottom:12px">
      <button class="ghost-btn ghost-btn-sm" onclick="repBack()">← Volver</button>
      <div style="flex:1">
        <div class="eyebrow" style="margin:0">${r.destacado ? '<span class="rep-star">★</span> ' : ""}${safeText(r.restaurante||"")} · ${safeText(r.mes||"")} ${safeText(String(r.anio||""))}</div>
        <div style="font-size:13px;color:var(--muted)">Responsable: ${safeText(r.responsable||"")}</div>
      </div>
      ${_repUrgBadge(r.urgencia)}
    </div>

    <div class="rep-detail-actions">
      <button class="rep-act-btn${r.destacado ? " active" : ""}" onclick="repToggleDestacado('${safeText(fsId)}')">${r.destacado ? "★ Destacado" : "☆ Destacar"}</button>
      <button class="rep-act-btn" onclick="repSharePDF('${safeText(fsId)}')">Compartir PDF</button>
      <button class="rep-act-btn rep-act-danger" onclick="repEliminar('${safeText(fsId)}')">Eliminar</button>
    </div>

    <div class="rep-detail-section">
      <h4>Cifras del mes</h4>
      <div class="rep-detail-kpis">
        ${kpis.facturacion != null ? `<div class="rep-detail-kpi"><strong>${kpis.facturacion.toLocaleString("es-ES")}€</strong><span>Facturación</span></div>` : ""}
        ${kpis.comensales != null ? `<div class="rep-detail-kpi"><strong>${kpis.comensales}</strong><span>Comensales</span></div>` : ""}
        ${kpis.ticketMedio != null ? `<div class="rep-detail-kpi"><strong>${kpis.ticketMedio}€</strong><span>Ticket medio</span></div>` : ""}
        ${kpis.eventos != null ? `<div class="rep-detail-kpi"><strong>${kpis.eventos}</strong><span>Eventos</span></div>` : ""}
        ${kpis.valoracion ? `<div class="rep-detail-kpi"><strong style="font-size:1rem">${safeText(kpis.valoracion)}</strong><span>Valoración</span></div>` : ""}
      </div>
    </div>

    <div class="rep-detail-section">
      <h4>Eventos</h4>
      ${row("Realizados", "")}
      ${tagList(eventos.realizados)}
      <div style="margin-top:10px">${row("Próximos", "")}</div>
      ${tagList(eventos.proximos)}
    </div>

    <div class="rep-detail-section">
      <h4>Carta y recetas</h4>
      ${row("Platos activos", carta.platosActivos != null ? String(carta.platosActivos) : null)}
      ${row("Recetas modificadas", carta.recetasModificadas != null ? String(carta.recetasModificadas) : null)}
      ${row("Plato destacado", safeText(carta.platoDestacado||""))}
      ${carta.cambios ? `<div class="rep-detail-row"><span class="rep-detail-label">Cambios</span><span>${safeText(carta.cambios)}</span></div>` : ""}
    </div>

    <div class="rep-detail-section">
      <h4>Proveedores</h4>
      ${row("Cambios", "")}${tagList(prov.cambios)}
      <div style="margin-top:8px">${row("Incidencias", "")}</div>${tagList(prov.incidencias)}
    </div>

    <div class="rep-detail-section">
      <h4>Equipo</h4>
      ${row("Plantilla", equipo.plantilla != null ? equipo.plantilla + " personas" : null)}
      ${row("Altas y bajas", safeText(equipo.altasBajas||""))}
      ${equipo.observaciones ? `<div class="rep-detail-row"><span class="rep-detail-label">Observaciones</span><span>${safeText(equipo.observaciones)}</span></div>` : ""}
    </div>

    <div class="rep-detail-section">
      <h4>Calidad y reseñas</h4>
      ${row("Valoración online", calidad.valoracionOnline != null ? calidad.valoracionOnline + " / 5" : null)}
      ${row("Reseñas del mes", calidad.resenas != null ? String(calidad.resenas) : null)}
      ${calidad.incidencias && calidad.incidencias.length ? `<div style="margin-top:8px">${row("Incidencias","")}</div>${tagList(calidad.incidencias)}` : ""}
    </div>

    <div class="rep-detail-section">
      <h4>Notas y próximos pasos</h4>
      ${notas.observaciones ? `<div class="rep-detail-row"><span class="rep-detail-label">Observaciones</span><span>${safeText(notas.observaciones)}</span></div>` : ""}
      ${notas.prioridades && notas.prioridades.length ? `<div style="margin-top:8px">${row("Prioridades","")}</div>${tagList(notas.prioridades)}` : ""}
      <div style="margin-top:10px">${row("Atención OBA", safeText(notas.urgenciaOba||"No urgente"))}</div>
    </div>

    ${r.adjuntos && r.adjuntos.length ? `
    <div class="rep-detail-section">
      <h4>Archivos adjuntos</h4>
      ${r.adjuntos.map(a => `
        <a class="rep-adj-link" href="${safeText(a.url)}" target="_blank" rel="noopener">
          <span class="rep-adj-ico">📎</span>
          <span class="rep-adj-name">${safeText(a.nombre || "archivo")}</span>
          <span class="rep-adj-size">${_fmtBytes(a.tamano)}</span>
        </a>`).join("")}
    </div>` : ""}`;
}
