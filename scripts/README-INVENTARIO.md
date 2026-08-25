# Actualizar el inventario de MRT

**Para Claude:** esto es todo lo que necesitas. Lee este archivo, corre los cuatro
comandos, revisa lo que la sección "Qué revisar a mano" pide, y despliega. No hace
falta abrir el navegador ni volver a investigar de dónde sale la data.

---

## Por qué existe esto

El sitio **no está conectado en vivo al MLS**. Las propiedades viven en
`src/data/listings.ts`, un archivo estático. Entre marzo y agosto de 2026 nadie lo
tocó y la dueña se quejó de que el sitio seguía anunciando casas ya vendidas.

Estos scripts convierten esa actualización en un trabajo de ~10 minutos en vez de
un día. La fuente de verdad es el feed Xposure/RealtyHD de Marilyn:

> https://mrtrealestate.realtyhd.com/listings

Ese feed es HTML server-rendered (no hace falta navegador) y marca cada propiedad
como `xp-active` o `xp-sold`. Cada una enlaza a `properties.listingspuertorico.com`,
que trae MLS#, municipio, código postal, tipo y tamaño del solar.

---

## Los cuatro comandos

```bash
cd ~/Downloads/_Projects/mrt-realestate

node scripts/fetch-inventory.mjs    # 1. baja el feed vivo -> scripts/inventory.json
node scripts/build-listings.mjs     # 2. asigna slugs y arma la data
node scripts/fetch-photos.mjs       # 3. baja las fotos que falten (y las comprime)
node scripts/build-listings.mjs     # 4. otra vez, ya con las fotos en disco

npm run build                       # verifica que compila
vercel --prod                       # despliega
```

El paso 2 corre dos veces a propósito: la primera asigna los slugs (que
`fetch-photos.mjs` necesita para nombrar los archivos), la segunda ya encuentra las
fotos en disco y las mete en la data.

---

## Qué revisar a mano

`build-listings.mjs` avisa si algo quedó incompleto, pero hay tres cosas que ningún
script puede decidir solo:

**1. Slugs de las propiedades nuevas.** Si no le das uno, lo saca del título del MLS
y quedan feos (`3-66-completely-flat-acres-ri-with-commercial-influence`). Ponle uno
corto en `scripts/listings-manual.json`, bajo `overrideByMls`, con el MLS# como
llave:

```json
"66193": { "slug": "terreno-3-66-acres-hato-bajo" }
```

Los slugs de propiedades **que ya estaban publicadas nunca se cambian** — rompería
enlaces vivos y el SEO. Por eso llevan `"preserved": true`.

**2. Las que desaparecen del feed.** Cuando una propiedad ya no aparece, hay que
moverla a mano al arreglo `retired` de `listings-manual.json`, con:

- `"status": "Sold"` si el feed la muestra explícitamente como vendida
- `"status": "Off Market"` si simplemente desapareció sin decir por qué

Las dos salen de la parrilla de disponibles, pero la página sigue viva con un aviso
y `noindex`, para no romper enlaces ni resultados de Google.

**No adivines.** Si desapareció sin marcar vendida, es `Off Market` y hay que
preguntarle a Marilyn. Poner "Vendida" sin confirmarlo es inventar un hecho sobre la
propiedad de un cliente.

**3. Municipios nuevos.** Si sale inventario en un pueblo que no está en `COORDS`
(dentro de `build-listings.mjs`), el mapa lo manda a Arecibo por defecto. Añade las
coordenadas del pueblo.

---

## Cosas que ya están resueltas — no las vuelvas a investigar

- **Fotos.** Patrón `https://images.realtyserver.com/photo_server.php?...&name=<photoId>.L01`,
  `.L02`, etc. Cuando se acaban, el servidor **no da 404**: devuelve un placeholder de
  exactamente **14,576 bytes**. Por eso el corte es por tamaño. Máximo 8 por propiedad.
- **Peso.** Las fotos del MLS pesan ~600KB. `fetch-photos.mjs` las pasa por `sips`
  (viene con macOS) y las deja en ~200KB sin cambiar dimensiones.
- **Idioma.** Sin `?locale=en_PR` el feed contesta en español según la cookie del
  servidor. El sitio publica los textos del MLS en inglés; el locale ya va forzado.
- **Área interior.** El MLS **solo** publica el área del solar, nunca la interior.
  Por eso `squareFeet` queda en 0 y el dato va en `lotSize`. La tarjeta muestra
  "X ft² solar" y el detalle pone "—" en Interior. No lo rellenes a ojo.
- **Multifamiliares.** El MLS los clasifica como `House`. `propertyType()` los detecta
  por el texto y por beds≥4 + baths≥3.
- **Filtros.** Los municipios y tipos de `PropertyFilters` salen del inventario real
  (`listingCities` / `activeListings`), no de una lista fija. Se actualizan solos.

---

## Verificación antes de desplegar

```bash
node -e "
const fs=require('fs');let s=fs.readFileSync('src/data/listings.ts','utf8');
s=s.replace(/^import type.*\$/m,'').replace(/export const listings: Property\[\] =/,'const listings =').replace(/export const activeListings[\s\S]*\$/,'module.exports=listings;');
fs.writeFileSync('/tmp/chk.cjs',s);const L=require('/tmp/chk.cjs');
const A=L.filter(l=>l.status==='Active'||l.status==='Rental');
console.log('disponibles:',A.length);
console.log('sin fotos:',A.filter(l=>!l.images.length).map(l=>l.slug));
console.log('sin municipio:',A.filter(l=>!l.address.city).map(l=>l.slug));
console.log('slugs repetidos:',L.map(l=>l.slug).filter((s,i,a)=>a.indexOf(s)!==i));
"
```

Los tres arreglos tienen que salir vacíos.

Después, con `npm run build` hecho, levanta `npx serve dist -l 4399` y confirma en
`/properties` que el contador del hero cuadra con el número de disponibles, y que
una propiedad vendida (por ejemplo `/properties/casa-lista-arecibo`) muestra la
franja azul de **VENDIDA**.

---

## Estado al 25 de agosto de 2026

Primera corrida de estos scripts. El sitio llevaba desde marzo con la data congelada.

- **16 disponibles** (antes se anunciaban 21, casi todas desactualizadas)
- **5 vendidas** confirmadas en el feed, que seguían publicadas como disponibles:
  MLS 63859, 63915, 63453, 61251, 63272
- **14 fuera de mercado** — desaparecieron del feed sin marcarse vendidas.
  **Pendiente: confirmar con Marilyn una por una qué pasó con cada una.**
- **13 propiedades nuevas** que el feed tenía y el sitio nunca mostró, incluyendo el
  complejo comercial de $1.85M en San Sebastián.
- Un cambio de precio real: "Two plots of land" pasó de $210,000 por los dos juntos a
  **$95,000 cada uno por separado**.

## La solución de fondo

Esto sigue siendo un parche manual. Lo que resuelve el problema de raíz es conectar
el sitio al feed en tiempo de build (Vercel puede reconstruir por cron), o a una API
del MLS. Ya existen clientes escritos y sin usar en `src/services/bridge-api.ts` y
`src/services/simplyrets.ts`, pero nunca se les consiguió credenciales. Con
`fetch-inventory.mjs` funcionando, la vía más corta hoy es correr ese script en el
build de Vercel y quitar el paso manual.
