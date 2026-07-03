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
//   firebase functions:secrets:set REPORTES_SMTP_PASS   → contraseña de aplicación (Gmail/Workspace)
//   firebase deploy --only functions
// ═══════════════════════════════════════════════════════
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

const REPORTES_SMTP_USER = defineSecret("REPORTES_SMTP_USER");
const REPORTES_SMTP_PASS = defineSecret("REPORTES_SMTP_PASS");
const REPORTES_DESTINO = "reportes@canitasgastro.com";

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

        <p style="margin-top:24px;color:#8E8E93;font-size:12px">Enviado automáticamente por la Intranet OBA.</p>
      </div>`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: REPORTES_SMTP_USER.value(),
        pass: REPORTES_SMTP_PASS.value(),
      },
    });

    await transporter.sendMail({
      from: `"Intranet OBA" <${REPORTES_SMTP_USER.value()}>`,
      to: REPORTES_DESTINO,
      subject: asunto,
      html,
    });
    console.log(`Email de reporte enviado: ${asunto}`);
  }
);
