# voice-recipe

El usuario va a pegar una transcripción de nota de voz con una receta.
Tu trabajo es analizar la transcripción, extraer los datos y añadir la receta directamente a Firestore.

## Pasos

### 1. Lee la transcripción y extrae
- Nombre del plato
- Descripción del plato
- Raciones / número de comensales
- Tiempo de elaboración
- Temperatura de servicio
- Ingredientes con cantidad y unidad
- Subrecetas (elaboraciones previas) con sus propios ingredientes y pasos
- Pasos de elaboración / montaje final
- Alérgenos presentes
- Notas adicionales

### 2. Pregunta al usuario si no está claro
- ¿Para qué restaurante es la receta?
- ¿En qué sección va el plato?

### 3. Determina destino y sección

**OBA** (recetario principal, colección `recipes`):
- Secciones: `"Bienvenida"` `"Huerta"` `"Bosque"` `"Afluente"` `"Corral"` `"Acantilado"` `"Monte Bajo"` `"Llanura"` `"Rivera"` `"Postres"`

**Grupo Cañitas** (por restaurante):
| Restaurante    | Colección          |
|----------------|--------------------|
| CEBO           | `cebo_recetas`     |
| ENE            | `ene_recetas`      |
| Cañitas Maite  | `canitas_recetas`  |
| Candomo        | `candomo_recetas`  |
- Secciones: `"Snacks"` `"Entrantes"` `"Principales"` `"Postres"` `"Mise en place"`

### 4. Muestra el resumen y pide confirmación

Presenta la receta estructurada de forma clara antes de guardar. Espera confirmación del usuario.

### 5. Escribe y ejecuta un script Python en el scratchpad

El script debe:
1. Construir el `recipe` dict con todos los datos
2. Consultar la colección para encontrar el `_i` máximo
3. Asignar `_i = max_i + 1` (y `id = _i` para la colección `recipes` de OBA)
4. Hacer PATCH a `{BASE}/{collection}/{new_i}` con el payload Firestore
5. Imprimir el nombre del documento creado

**Credenciales:**
- API_KEY = `AIzaSyAUUgLnKnh1xUbCjis4nPoEzoLLrJp9loY`
- PROJECT = `intranet-oba`
- BASE = `https://firestore.googleapis.com/v1/projects/intranet-oba/databases/(default)/documents`

## Formato del dict Python

```python
recipe = {
    "nombre": "Nombre del plato",
    "seccion": "Huerta",
    "temporada": "Primavera",
    "descripcion": "Descripción breve del plato.",
    "raciones": "4",
    "tiempoElaboracion": "45 min",
    "temperatura": "Caliente",
    "foto": "",
    "alergenos": ["Gluten", "Lácteos"],
    "ingredientes": [
        {"i": "Ingrediente 1", "c": "200", "u": "g"},
        {"i": "Ingrediente 2", "c": "1",   "u": "ud"},
    ],
    "subrecetas": [
        {
            "nombre": "Nombre subreceta",
            "descripcion": "",
            "ingredientes": [
                {"i": "Ingrediente", "c": "100", "u": "ml"},
            ],
            "pasos": [
                "Paso 1 de la subreceta.",
                "Paso 2.",
            ]
        }
    ],
    "pasos": [
        "Paso 1 del montaje.",
        "Paso 2.",
    ],
    "notas": "",
    "fecha": "2026-07-02",   # usar la fecha actual
    "autor": "OBA"           # nombre del restaurante
}
```

## Script de inserción Firestore (reutilizable)

```python
import requests, json

API_KEY = "AIzaSyAUUgLnKnh1xUbCjis4nPoEzoLLrJp9loY"
PROJECT = "intranet-oba"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents"

def to_fs(value):
    if value is None:
        return {"nullValue": None}
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        return {"integerValue": str(value)}
    if isinstance(value, float):
        return {"doubleValue": value}
    if isinstance(value, str):
        return {"stringValue": value}
    if isinstance(value, list):
        return {"arrayValue": {"values": [to_fs(v) for v in value]}}
    if isinstance(value, dict):
        return {"mapValue": {"fields": {k: to_fs(v) for k, v in value.items()}}}
    return {"stringValue": str(value)}

def add_recipe(collection, recipe):
    # Find current max _i
    resp = requests.get(f"{BASE}/{collection}?pageSize=300&key={API_KEY}")
    docs = resp.json().get("documents", [])
    max_i = 0
    for doc in docs:
        i_val = doc.get("fields", {}).get("_i", {}).get("integerValue")
        if i_val:
            max_i = max(max_i, int(i_val))
    new_i = max_i + 1

    recipe["_i"] = new_i
    if collection == "recipes":
        recipe["id"] = new_i   # OBA recetario usa campo 'id' numérico

    payload = {"fields": {k: to_fs(v) for k, v in recipe.items()}}
    url = f"{BASE}/{collection}/{new_i}?key={API_KEY}"
    r = requests.patch(url, json=payload)
    r.raise_for_status()
    print(f"Receta guardada: {r.json()['name']}")

add_recipe("recipes", recipe)   # cambia la colección según el restaurante
```

## Alérgenos válidos

`"Gluten"` `"Crustáceos"` `"Huevos"` `"Pescado"` `"Cacahuetes"` `"Soja"` `"Lácteos"` `"Frutos de cáscara"` `"Apio"` `"Mostaza"` `"Sésamo"` `"Dióxido de azufre"` `"Altramuces"` `"Moluscos"`

## Nota final

- No es necesario hacer commit ni push (no se modifica ningún archivo del repo).
- La receta aparece en la intranet automáticamente al recargar (el listener `onSnapshot` la captará).
- Confirma al usuario el nombre del plato y en qué sección quedó.
