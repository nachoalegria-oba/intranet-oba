# add-pdf-recipe

El usuario va a subir un PDF de una receta de Grupo Cañitas Gastro y decirte en qué restaurante va.
Tu trabajo es analizar el PDF, extraer todos los datos y añadir la receta al diccionario `_PDF_RECIPES` en `app.js`.

## Restaurantes disponibles y sus colecciones Firestore

| Restaurante | `col` (colección Firestore) |
|-------------|----------------------------|
| CEBO        | `cebo`                      |
| OBA         | `oba`                       |
| ENE         | `ene`                       |
| Cañitas Maite | `canitas`                 |
| Candomo     | `candomo`                   |

## Pasos a seguir

1. **Lee el PDF** y extrae: nombre exacto de la receta, descripción, subrecetas con ingredientes y cantidades, pasos de montaje/elaboración, alérgenos.
2. **Determina la clave** del diccionario: la primera parte del nombre antes de ` - ` en minúsculas. Por ejemplo `"Concha Fina - Gamba Blanca"` → clave `"concha fina"`. Si el nombre no tiene ` - `, usa el nombre completo en minúsculas.
3. **Añade la entrada** al diccionario `_PDF_RECIPES` en `/home/user/intranet-oba/app.js`. El diccionario empieza en la línea ~4470. Inserta la nueva entrada antes del cierre `};` del diccionario.
4. **Formato exacto del objeto**:

```javascript
"clave de la receta": {
  descripcion: "Descripción breve del plato.",
  subrecetas: [
    {
      nombre: "Nombre subreceta (X raciones/kg/ud)",
      ingredientes: [
        { nombre: "Ingrediente", cantidad: 100, unidad: "g" },
        // null para cantidad/unidad si no se especifica
      ],
      pasos: [
        "Paso 1 de elaboración.",
        "Paso 2.",
      ]
    },
    // más subrecetas...
  ],
  pasos: [
    "Paso 1 del montaje final.",
    "Paso 2.",
  ],
  alergenos: ["Lácteos", "Gluten", "Huevos"],  // solo los presentes
},
```

Alérgenos válidos (usar exactamente estos nombres):
`"Gluten"`, `"Crustáceos"`, `"Huevos"`, `"Pescado"`, `"Cacahuetes"`, `"Soja"`, `"Lácteos"`, `"Frutos de cáscara"`, `"Apio"`, `"Mostaza"`, `"Sésamo"`, `"Dióxido de azufre"`, `"Altramuces"`, `"Moluscos"`.

5. **Bump de versión** en `index.html`: incrementa el número de `app.js?v=NNN` en 1.
6. **Commit y push** firmado a `claude/intranet-updates-4wmp3s`:
   - Asegúrate de que `git config user.email` es `noreply@anthropic.com` y `user.name` es `Claude`.
   - `git add app.js index.html && git commit -m "Add <nombre receta> PDF recipe data (<restaurante>)"`
   - `git push origin HEAD:claude/intranet-updates-4wmp3s`

## Cómo funciona el banner en la intranet

Cuando la intranet abre una receta cuyo nombre (en minúsculas) coincide con una clave de `_PDF_RECIPES`, y la receta en Firestore tiene menos pasos totales que los del PDF, aparece automáticamente un banner amarillo "Datos del PDF disponibles" con el botón "Aplicar datos PDF". Al pulsarlo se llama `applyPdfRecipe(col, recipeNombre)` que actualiza el documento Firestore con todos los datos del PDF.

El banner desaparece automáticamente tras aplicar los datos (porque ahora los pasos en Firestore igualan los del PDF).

## Nota sobre impresión

El banner nunca aparece al imprimir (oculto con `@media print { #pdf-import-banner { display:none } }`).
