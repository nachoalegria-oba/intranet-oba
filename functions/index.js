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
