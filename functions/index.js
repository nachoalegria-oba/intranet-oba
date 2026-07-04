const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// La clave de la API de Anthropic — nunca en el código ni en el frontend.
// Configurar con:  firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// Secreto compartido entre la intranet y la función.
// Configurar con:  firebase functions:secrets:set INTRANET_SECRET
// (pon el mismo valor que INVOICE_SECRET en app.js)
const INTRANET_SECRET = defineSecret("INTRANET_SECRET");

// Dominio de la intranet. El CORS del SDK rechaza peticiones de otros orígenes.
const ALLOWED_ORIGIN = "https://intranet.obarestaurante.es";

const EXTRACTION_PROMPT = `Eres un asistente que digitaliza facturas y albaranes de proveedores de un restaurante.
Analiza la imagen y devuelve EXCLUSIVAMENTE un objeto JSON, sin texto adicional, sin markdown ni backticks, con esta estructura exacta:
{
  "proveedor": "string o null",
  "fecha": "YYYY-MM-DD o null",
  "numero_factura": "string o null",
  "lineas": [
    {"producto": "string", "cantidad": number o null, "unidad": "string corta (kg, ud, l, caja...) o null", "precio_unitario": number o null, "precio_total": number o null}
  ],
  "total_factura": number o null
}
Si un campo no se puede leer con seguridad, usa null en lugar de inventar un valor. No incluyas ninguna explicación, solo el JSON.`;

exports.scanInvoice = onRequest(
  {
    secrets: [ANTHROPIC_API_KEY, INTRANET_SECRET],
    cors: [ALLOWED_ORIGIN],
    region: "europe-west1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    // Verificación de secreto compartido.
    // La intranet envía:  Authorization: Bearer <INTRANET_SECRET>
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token || token !== INTRANET_SECRET.value()) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: "Falta imageBase64 en el cuerpo de la petición" });
      return;
    }

    try {
      const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 },
                },
                { type: "text", text: EXTRACTION_PROMPT },
              ],
            },
          ],
        }),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(`Anthropic API error ${apiResponse.status}: ${errText}`);
      }

      const data = await apiResponse.json();
      const textBlocks = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const clean = textBlocks.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      res.json(parsed);
    } catch (err) {
      console.error("Error procesando factura:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ═══════════════════════════════════════════════════════
// EMAIL DE REPORTES MENSUALES
// Se dispara al crearse un documento en la colección "reportes"
// y envía un resumen a reportes@canitasgastro.com.
//
// Configuración (una sola vez):
//   firebase functions:secrets:set REPORTES_SMTP_USER   → correo que envía (ej. reportes@canitasgastro.com)
//   firebase functions:secrets:set REPORTES_SMTP_PASS   → contraseña normal del buzón (la del webmail)
//   firebase deploy --only functions
// ═══════════════════════════════════════════════════════
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

const REPORTES_SMTP_USER = defineSecret("REPORTES_SMTP_USER");
const REPORTES_SMTP_PASS = defineSecret("REPORTES_SMTP_PASS");
const REPORTES_DESTINO = "reportes@canitasgastro.com";
// Servidor de correo del dominio (webmail propio, según su registro MX)
const REPORTES_SMTP_HOST = "mail.canitasgastro.com";

const esc = (v) => String(v ?? "—").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fila = (label, val) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#8E8E93;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>` +
  `<td style="padding:6px 0;font-size:14px">${val}</td></tr>`;

const lista = (arr) => (arr && arr.length)
  ? `<ul style="margin:0;padding-left:18px">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
  : "—";

exports.emailNuevoReporte = onDocumentCreated(
  {
    document: "reportes/{id}",
    region: "europe-west1",
    secrets: [REPORTES_SMTP_USER, REPORTES_SMTP_PASS],
    retry: false,
  },
  async (event) => {
    const r = event.data?.data();
    if (!r) return;

    const kpis = r.kpis || {};
    const carta = r.carta || {};
    const eventos = r.eventos || {};
    const prov = r.proveedores || {};
    const equipo = r.equipo || {};
    const calidad = r.calidad || {};
    const notas = r.notas || {};
    const urgente = r.urgencia === "Urgente OBA";

    const asunto = `${urgente ? "🚨 " : ""}Nuevo reporte: ${r.restaurante || "?"} — ${r.mes || "?"} ${r.anio || ""}`;

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 2px">${esc(r.restaurante)} — ${esc(r.mes)} ${esc(r.anio)}</h2>
        <p style="margin:0 0 18px;color:#8E8E93">Responsable: ${esc(r.responsable)} · Urgencia: <strong>${esc(r.urgencia)}</strong></p>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px">Cifras del mes</h3>
        <table style="border-collapse:collapse">
          ${fila("Facturación", kpis.facturacion != null ? esc(kpis.facturacion) + " €" : "—")}
          ${fila("Comensales", esc(kpis.comensales))}
          ${fila("Ticket medio", kpis.ticketMedio != null ? esc(kpis.ticketMedio) + " €" : "—")}
          ${fila("Eventos", esc(kpis.eventos))}
          ${fila("Valoración", esc(kpis.valoracion))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Eventos</h3>
        <table style="border-collapse:collapse">
          ${fila("Realizados", lista(eventos.realizados))}
          ${fila("Próximos", lista(eventos.proximos))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Carta</h3>
        <table style="border-collapse:collapse">
          ${fila("Platos activos", esc(carta.platosActivos))}
          ${fila("Recetas modificadas", esc(carta.recetasModificadas))}
          ${fila("Cambios", esc(carta.cambios || "—"))}
          ${fila("Plato destacado", esc(carta.platoDestacado || "—"))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Proveedores</h3>
        <table style="border-collapse:collapse">
          ${fila("Cambios", lista(prov.cambios))}
          ${fila("Incidencias", lista(prov.incidencias))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Equipo</h3>
        <table style="border-collapse:collapse">
          ${fila("Plantilla", esc(equipo.plantilla))}
          ${fila("Altas y bajas", esc(equipo.altasBajas || "—"))}
          ${fila("Observaciones", esc(equipo.observaciones || "—"))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Calidad y reseñas</h3>
        <table style="border-collapse:collapse">
          ${fila("Valoración online", esc(calidad.valoracionOnline))}
          ${fila("N.º reseñas", esc(calidad.resenas))}
          ${fila("Incidencias", lista(calidad.incidencias))}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Notas y próximos pasos</h3>
        <table style="border-collapse:collapse">
          ${fila("Observaciones", esc(notas.observaciones || "—"))}
          ${fila("Prioridades", lista(notas.prioridades))}
          ${fila("Atención OBA", esc(notas.urgenciaOba))}
        </table>

        ${(r.adjuntos && r.adjuntos.length) ? `
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#8E8E93;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Archivos adjuntos</h3>
        <ul style="margin:8px 0 0;padding-left:18px">
          ${r.adjuntos.map((a) => `<li><a href="${esc(a.url)}">${esc(a.nombre || "archivo")}</a></li>`).join("")}
        </ul>` : ""}

        <p style="margin-top:24px;color:#8E8E93;font-size:12px">Enviado automáticamente por la Intranet OBA.</p>
      </div>`;

    // Adjuntar los archivos al correo (hasta 15 MB en total; el resto
    // queda accesible por los enlaces del cuerpo del mensaje).
    const attachments = [];
    if (Array.isArray(r.adjuntos)) {
      let total = 0;
      for (const a of r.adjuntos) {
        if (!a || !a.url) continue;
        total += a.tamano || 0;
        if (total > 15 * 1024 * 1024) break;
        attachments.push({ filename: a.nombre || "adjunto", href: a.url });
      }
    }

    const auth = {
      user: REPORTES_SMTP_USER.value(),
      pass: REPORTES_SMTP_PASS.value(),
    };
    const mail = {
      from: `"Intranet OBA" <${auth.user}>`,
      to: REPORTES_DESTINO,
      subject: asunto,
      html,
      attachments,
    };

    // Intenta 465 (SSL directo) y si falla 587 (STARTTLS): los servidores
    // de webmail de hosting usan uno u otro según el proveedor.
    const configs = [
      { host: REPORTES_SMTP_HOST, port: 465, secure: true, auth },
      { host: REPORTES_SMTP_HOST, port: 587, secure: false, requireTLS: true, auth },
    ];
    let lastErr = null;
    for (const cfg of configs) {
      try {
        await nodemailer.createTransport(cfg).sendMail(mail);
        console.log(`Email de reporte enviado (puerto ${cfg.port}): ${asunto}`);
        return;
      } catch (err) {
        lastErr = err;
        console.warn(`Fallo enviando por puerto ${cfg.port}:`, err.message);
      }
    }
    throw lastErr;
  }
);

// ═══════════════════════════════════════════════════════
// COPIA DE SEGURIDAD SEMANAL DE FIRESTORE
// Cada lunes a las 05:00 exporta todas las colecciones a un JSON
// en Cloud Storage (carpeta backups/ del bucket del proyecto).
// Para restaurar: descargar el JSON desde la consola de Firebase
// (Storage → backups/) y reimportar los documentos.
// ═══════════════════════════════════════════════════════
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

exports.backupSemanal = onSchedule(
  {
    schedule: "every monday 05:00",
    timeZone: "Europe/Madrid",
    region: "europe-west1",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async () => {
    if (!admin.apps.length) admin.initializeApp();
    const db = admin.firestore();
    const collections = await db.listCollections();
    const out = {};
    for (const col of collections) {
      const snap = await col.get();
      out[col.id] = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    }
    const fecha = new Date().toISOString().slice(0, 10);
    const file = admin.storage().bucket().file(`backups/firestore-${fecha}.json`);
    await file.save(JSON.stringify(out), { contentType: "application/json" });
    const total = Object.values(out).reduce((n, arr) => n + arr.length, 0);
    console.log(`Backup ${fecha}: ${Object.keys(out).length} colecciones, ${total} documentos.`);
  }
);

// ═══════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS (solo administradores)
// Crea/actualiza cuentas de Firebase Auth + su perfil en la
// colección "usuarios". El que llama debe enviar su ID token
// (Authorization: Bearer <token>) y tener rol "admin".
// ═══════════════════════════════════════════════════════
async function _verificarAdmin(req) {
  if (!admin.apps.length) admin.initializeApp();
  const header = req.headers.authorization || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const doc = await admin.firestore().collection("usuarios").doc(decoded.uid).get();
    if (doc.exists && doc.data().rol === "admin" && doc.data().activo !== false) return decoded;
  } catch (e) {
    console.warn("verificarAdmin:", e.message);
  }
  return null;
}

exports.crearUsuario = onRequest(
  { region: "europe-west1", cors: true },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }
    const caller = await _verificarAdmin(req);
    if (!caller) { res.status(403).json({ error: "Solo administradores" }); return; }

    const { nombre, email, password, rol, restaurante } = req.body || {};
    if (!nombre || !email || !password || password.length < 6) {
      res.status(400).json({ error: "Faltan datos o la contraseña es demasiado corta" });
      return;
    }
    if (!["admin", "encargado", "reportes"].includes(rol)) {
      res.status(400).json({ error: "Rol no válido" });
      return;
    }
    try {
      const user = await admin.auth().createUser({ email, password, displayName: nombre });
      await admin.firestore().collection("usuarios").doc(user.uid).set({
        nombre, email, rol,
        restaurante: restaurante || "",
        activo: true,
        creado: admin.firestore.FieldValue.serverTimestamp(),
        creadoPor: caller.email || caller.uid,
      });
      console.log(`Usuario creado: ${email} (${rol}) por ${caller.email}`);
      res.json({ ok: true, uid: user.uid });
    } catch (e) {
      const msg = e.code === "auth/email-already-exists"
        ? "Ya existe una cuenta con ese email"
        : e.message;
      res.status(400).json({ error: msg });
    }
  }
);

exports.actualizarUsuario = onRequest(
  { region: "europe-west1", cors: true },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }
    const caller = await _verificarAdmin(req);
    if (!caller) { res.status(403).json({ error: "Solo administradores" }); return; }

    const { uid, activo, rol, restaurante, nombre } = req.body || {};
    if (!uid) { res.status(400).json({ error: "Falta uid" }); return; }
    if (uid === caller.uid && activo === false) {
      res.status(400).json({ error: "No puedes desactivar tu propia cuenta" });
      return;
    }
    try {
      const cambios = {};
      if (typeof activo === "boolean") {
        cambios.activo = activo;
        await admin.auth().updateUser(uid, { disabled: !activo });
      }
      if (rol && ["admin", "encargado", "reportes"].includes(rol)) cambios.rol = rol;
      if (typeof restaurante === "string") cambios.restaurante = restaurante;
      if (nombre) cambios.nombre = nombre;
      if (Object.keys(cambios).length) {
        await admin.firestore().collection("usuarios").doc(uid).update(cambios);
      }
      console.log(`Usuario ${uid} actualizado por ${caller.email}:`, JSON.stringify(cambios));
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// ═══════════════════════════════════════════════════════
// RECORDATORIO MENSUAL DE REPORTES
// El día 5 de cada mes a las 09:00 envía a cada encargado (usuarios
// activos con rol "encargado") un email-dashboard con sus restaurantes
// que aún NO han enviado el reporte del mes anterior, y un botón para
// hacerlo. Si ya lo enviaron todos, no se les molesta.
// Prueba manual (solo admins): POST /recordatorioReporteTest {to}
// ═══════════════════════════════════════════════════════
const MESES_REC = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const INTRANET_URL = "https://intranet.obarestaurante.es";

async function _enviarEmailSMTP(mail) {
  const auth = { user: REPORTES_SMTP_USER.value(), pass: REPORTES_SMTP_PASS.value() };
  const configs = [
    { host: REPORTES_SMTP_HOST, port: 465, secure: true, auth },
    { host: REPORTES_SMTP_HOST, port: 587, secure: false, requireTLS: true, auth },
  ];
  let lastErr = null;
  for (const cfg of configs) {
    try {
      await nodemailer.createTransport(cfg).sendMail({ from: `"Cañitas Gastro" <${auth.user}>`, ...mail });
      return;
    } catch (err) { lastErr = err; console.warn(`SMTP ${cfg.port}:`, err.message); }
  }
  throw lastErr;
}

function _htmlRecordatorio(nombre, pendientes, mes, anio) {
  const filas = pendientes.map((r) => `
    <tr>
      <td style="padding:13px 16px;font-weight:600;font-size:15px;color:#111;border-bottom:1px solid #ECECF1">${esc(r)}</td>
      <td style="padding:13px 16px;text-align:right;border-bottom:1px solid #ECECF1">
        <span style="background:#FFF3E0;color:#B45309;font-size:11px;font-weight:700;letter-spacing:.05em;padding:5px 12px;border-radius:999px">PENDIENTE</span>
      </td>
    </tr>`).join("");
  const saludo = nombre ? ` ${esc(String(nombre).split(" ")[0])}` : "";
  return `
  <div style="background:#F2F2F7;padding:28px 14px">
    <div style="font-family:-apple-system,'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:#111;border-radius:20px;padding:22px 26px;margin-bottom:14px">
        <div style="color:#fff;font-size:26px;font-weight:700;letter-spacing:-1px">oba–</div>
        <div style="color:#8E8E93;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:3px">Cañitas Gastro · Intranet</div>
      </div>
      <div style="background:#fff;border-radius:20px;padding:26px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.05)">
        <h2 style="margin:0 0 6px;font-size:19px;color:#111;font-family:-apple-system,'Segoe UI',Arial,sans-serif">Hola${saludo} 👋</h2>
        <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.55">Toca enviar el <strong>reporte mensual de ${esc(mes)} ${anio}</strong>. Son 5 minutos y mantiene a todo el grupo alineado.</p>
        <table style="width:100%;border-collapse:collapse;background:#F7F7FA;border-radius:14px;overflow:hidden">
          <tr>
            <td style="padding:10px 16px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93">Restaurante</td>
            <td style="padding:10px 16px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;text-align:right">Estado</td>
          </tr>
          ${filas}
        </table>
        <a href="${INTRANET_URL}" style="display:block;background:#007AFF;color:#fff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:16px;border-radius:14px;margin-top:20px;font-family:-apple-system,'Segoe UI',Arial,sans-serif">Hacer el reporte ahora →</a>
        <p style="margin:14px 0 0;color:#8E8E93;font-size:12px;text-align:center">Entra con tu cuenta y pulsa “+ Nuevo reporte”.</p>
      </div>
      <p style="color:#8E8E93;font-size:11px;text-align:center;margin:0;font-family:-apple-system,'Segoe UI',Arial,sans-serif">Enviado automáticamente por la Intranet OBA</p>
    </div>
  </div>`;
}

async function _enviarRecordatorios(overrideTo) {
  if (!admin.apps.length) admin.initializeApp();
  const fdb = admin.firestore();

  // Mes anterior según la hora de Madrid
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  let m = ahora.getMonth() - 1, y = ahora.getFullYear();
  if (m < 0) { m = 11; y -= 1; }
  const mesNombre = MESES_REC[m];

  // Restaurantes que YA enviaron el reporte de ese mes
  const repSnap = await fdb.collection("reportes").where("mes", "==", mesNombre).where("anio", "==", y).get();
  const hechos = new Set(repSnap.docs.map((d) => d.data().restaurante));

  // Encargados activos con pendientes
  const usrSnap = await fdb.collection("usuarios").where("rol", "==", "encargado").get();
  const enviados = [];
  for (const doc of usrSnap.docs) {
    const u = doc.data();
    if (u.activo === false || !u.email) continue;
    const rests = (Array.isArray(u.restaurantes) && u.restaurantes.length)
      ? u.restaurantes
      : (u.restaurante ? [u.restaurante] : []);
    const pendientes = rests.filter((r) => !hechos.has(r));
    if (!pendientes.length) continue;
    await _enviarEmailSMTP({
      to: overrideTo || u.email,
      subject: `📋 Recordatorio: reporte de ${mesNombre} pendiente`,
      html: _htmlRecordatorio(u.nombre, pendientes, mesNombre, y),
    });
    enviados.push(`${u.nombre || "?"} → ${overrideTo || u.email} (${pendientes.join(", ")})`);
  }

  // En modo prueba, si no había nada pendiente, enviar un ejemplo para ver el diseño
  if (overrideTo && !enviados.length) {
    await _enviarEmailSMTP({
      to: overrideTo,
      subject: `📋 [EJEMPLO] Recordatorio: reporte de ${mesNombre} pendiente`,
      html: _htmlRecordatorio("Ejemplo", ["CEBO"], mesNombre, y),
    });
    enviados.push(`ejemplo → ${overrideTo}`);
  }
  return { mes: mesNombre, anio: y, enviados };
}

exports.recordatorioReporte = onSchedule(
  {
    schedule: "0 9 5 * *",
    timeZone: "Europe/Madrid",
    region: "europe-west1",
    secrets: [REPORTES_SMTP_USER, REPORTES_SMTP_PASS],
    retryCount: 2,
  },
  async () => {
    const r = await _enviarRecordatorios(null);
    console.log(`Recordatorios ${r.mes} ${r.anio}: ${r.enviados.length} enviados`, r.enviados);
  }
);

exports.recordatorioReporteTest = onRequest(
  { region: "europe-west1", cors: true, secrets: [REPORTES_SMTP_USER, REPORTES_SMTP_PASS] },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }
    const caller = await _verificarAdmin(req);
    if (!caller) { res.status(403).json({ error: "Solo administradores" }); return; }
    const to = (req.body || {}).to || caller.email;
    if (!to) { res.status(400).json({ error: "Falta destinatario" }); return; }
    try {
      const r = await _enviarRecordatorios(to);
      res.json({ ok: true, ...r });
    } catch (e) {
      console.error("recordatorioReporteTest:", e);
      res.status(500).json({ error: e.message });
    }
  }
);
