# MRT Real Estate — Save Point

> **Última sesión: 25 de agosto de 2026** — actualización del inventario y despliegue a producción.
> Sesión anterior: 10 de marzo de 2026 (construcción del sitio).
> Para continuar: **"CONTINUE MRT"**. Para refrescar el inventario: **"ACTUALIZA INVENTARIO MRT"**.

---

## El cliente

**MRT Real Estate, The Dealmaker** — corretaje de bienes raíces, zona norte de Puerto Rico
(Arecibo, Utuado, Hatillo, Lares, Ciales, Camuy, Isabela, Barceloneta, Manatí, San Sebastián).

| | |
|---|---|
| **Contacto principal** | Marilyn Rivera Torres — Fundadora y Agente Principal |
| **Teléfonos** | (787) 939-8739 · (787) 326-1547 |
| **Email** | marilyn@mrtrealestate.com |
| **Oficina** | 326 Calle José Olmo, Arecibo, PR 00612 |
| **Brokerage** | Blue Ribbon Real Estate LLC — Lic. E-405 |
| **Lic. Marilyn** | C19882 |
| **Equipo** | Arelis González Estrada (agente e inspectora, G&G Inspectors) · Marla Enid Fuster Lamourt (agente, Lic. C-20059) · Eneth González |

---

## Dónde vive todo

| | |
|---|---|
| **Sitio en vivo** | https://www.mrtrealestate.com |
| **Local** | `~/Downloads/_Projects/mrt-realestate/` |
| **Repo** | https://github.com/Saul-Punybz/mrt-realestate (rama `main`) |
| **Vercel** | proyecto `mrt-realestate`, team `example-pages-projects` |
| **Deploy** | `vercel --prod` desde el directorio (⚠️ el repo **no** está conectado a git en Vercel) |
| **Stack** | Astro 5.16.6 · React 19 · Tailwind v4 · Vercel |
| **Dev** | `npm run dev` → http://localhost:4321/ |

### Fuentes de datos del cliente

| | |
|---|---|
| **Feed del inventario (fuente de verdad)** | https://mrtrealestate.realtyhd.com/listings |
| **Fichas MLS** | properties.listingspuertorico.com |
| **Xposure/RealtyHD user ID** | 659384 |
| **Portal MLS embebido** | properties.listingspuertorico.com/userId_659384 |
| **YouTube** | @mrtrealestate1547 |
| **Zillow** | /profile/MRT%20Real%20Estate |
| **WhatsApp** | +1 787 939 8739 |

---

## Sesión del 25 de agosto de 2026 — actualización del inventario

### El problema

Marilyn se quejó de que el sitio **seguía anunciando casas ya vendidas**. Confirmado: el
inventario era un archivo estático (`src/data/listings.ts`) congelado desde marzo. De las
**21 propiedades publicadas como disponibles, solo 3 seguían activas**.

Los clientes MLS que existían en `src/services/bridge-api.ts` y `src/services/simplyrets.ts`
**nunca se conectaron** — no los importa ningún archivo y nunca se les consiguió credenciales.
El panel `/admin/mls-api` solo guarda credenciales en el `localStorage` del navegador. Lo único
vivo era el iframe del mapa MLS, que muestra las ~1,538 propiedades de toda la isla, no las de MRT.

### Lo que se hizo

Comparación contra el feed real de Marilyn (30 propiedades: 16 activas, 14 vendidas):

- **5 vendidas** que seguían publicadas como disponibles → fuera de la parrilla
  (MLS 63859, 63915, 63453, 61251, y el alquiler 63272)
- **14 desaparecieron del feed** sin marcarse vendidas → `Off Market`.
  **No se marcaron como vendidas porque no está confirmado.**
- **13 propiedades nuevas** que el feed tenía y el sitio nunca mostró, con fotos reales del MLS
  (126 fotos bajadas y comprimidas). Incluye el complejo comercial de **$1.85M en San Sebastián**
  y las oficinas de **$699K en Manatí**.
- **Corrección de precio:** "Two plots of land" ya no son $210,000 los dos juntos sino
  **$95,000 cada uno por separado**.

Las vendidas y fuera de mercado **conservan su página** con franja de aviso, `noindex` y
`schema.org SoldOut` — no se rompe ningún enlace vivo ni resultado de Google.

### Correcciones que salieron de usar data real

- **Área interior.** El MLS **solo** publica área del solar, nunca interior. Antes el sitio
  habría presentado el solar como área habitable. Ahora `squareFeet` queda en 0, el dato va en
  `lotSize`, la tarjeta rotula "X ft² solar" y el detalle pone "—" en Interior.
- **Filtros.** Municipios y tipos ahora salen del inventario real. La lista fija ofrecía San Juan,
  Ponce y Vieques sin una sola propiedad, y **omitía Isabela, Manatí y San Sebastián**, donde sí hay.
- **Multifamiliares.** El MLS los clasifica como "House"; ahora se detectan aparte.
- **Estado en español.** El detalle mostraba "Active" en crudo.

### Scripts nuevos — la próxima vez son 10 minutos

```
scripts/fetch-inventory.mjs    baja el feed + fichas MLS -> inventory.json
scripts/build-listings.mjs     genera src/data/listings.ts
scripts/fetch-photos.mjs       baja y comprime las fotos que falten
scripts/listings-manual.json   lo que no viene del feed (slugs, retiradas)
scripts/README-INVENTARIO.md   ← instrucciones completas
```

**Recordatorio trimestral en el calendario de Saul**, desde el 25 de noviembre de 2026,
repitiendo cada 3 meses.

---

## Pendientes

### Alta prioridad

- [ ] **Llamar a Marilyn por las 14 propiedades en `Off Market`.** Desaparecieron del feed sin
      marcarse vendidas. Si alguna sigue en venta hay que devolverla; si se vendió, marcarla `Sold`.
      Son: Solar 3,480 m², 1.33 Acres Wooded Lot, Fixer Upper Barceloneta, Finca 32 Acres Lares,
      9 Acres Aguadilla, Casa Remodelada Ciales, Propiedad Histórica Utuado, Multi-Familiar
      Sabana Hoyos, Finca Montaña Ciales, Casa Familiar Lares, Edificio Mixto Utuado, Casa
      Flamboyan Gardens, Penthouse Guaynabo, Hacienda Iberia.
- [ ] **Conectar el repo a Vercel.** Hoy los deploys salen del CLI desde la máquina de Saul.
      Conectarlo es el paso previo para automatizar el refresco.
- [ ] **La solución de fondo:** correr `fetch-inventory.mjs` dentro del build de Vercel con un
      cron de reconstrucción y eliminar el paso manual. El script ya funciona; falta el cron.

### Media prioridad

- [ ] **Anti-spam en los formularios.** No tienen ninguno: en la hoja hay 4 envíos idénticos de
      "harrison brooks", uno de una agencia web y dos con nombres generados. Vale un honeypot
      o reCAPTCHA.
- [ ] **Notificaciones de la hoja de leads.** Verificar si están activas (Herramientas → Reglas
      de notificación). Sin eso, hay que acordarse de abrir la hoja.

**Los formularios FUNCIONAN — no tocarlos "para arreglarlos".** Capturan a la hoja
**"MRT Real Estate - Formularios"** (`1PUg1_Ci5jev21vo8kMeiGXWCgSF0JVCdh5OW4vu2Hck`) vía Google
Apps Script y llevan haciéndolo sin fallar desde marzo de 2026. Verificado el 26 ago con envíos
de prueba. Marilyn tiene acceso y la está usando (confirmado por Saul; ojo, la API de permisos
de Drive solo devuelve a `saul@puny.bz` como owner — probablemente hereda de una unidad
compartida). Los `src/pages/api/*` que apuntan a SendGrid son código muerto: el formulario no
los usa.
- [ ] **SearchBar del hero no es funcional** y ofrece municipios sin inventario.
- [ ] **Blog** — los 6 artículos son genéricos, sin contenido real.
- [ ] **Estadísticas del About** ("500+", "98%") son placeholder.
- [ ] **Verificar Xposure data-id** 659384 en admin.realtyhd.com.

### Baja prioridad

- [ ] Fotos del equipo sin uniformar (crop/resize).
- [ ] Logo real en vez del círculo dorado "MRT".
- [ ] Peso de las imágenes: `public/images/listings/` pesa ~66MB. Las de marzo (~39MB) nunca se
      comprimieron; las nuevas sí.
- [ ] YouTube iframes pesados, considerar lazy load.
- [ ] Accesibilidad: contraste, alt texts, focus states.
- [ ] Panel `/admin` sin backend funcional.

---

## Estructura del proyecto

```
scripts/                 # ← NUEVO: actualización del inventario
  fetch-inventory.mjs
  build-listings.mjs
  fetch-photos.mjs
  listings-manual.json
  inventory.json
  README-INVENTARIO.md
src/
  data/listings.ts       # GENERADO — no editar a mano
  pages/
    index.astro
    properties/index.astro     # parrilla + mapa MLS embebido
    properties/[slug].astro    # detalle + franja de vendida/no disponible
    blog/  admin/  api/
    about · sell · contact · calculators · co-broke · showing · edi
  components/
    properties/  PropertyCard · PropertyGrid · PropertyFilters
                 PropertyGallery · PropertyDetails · PropertyMap
    home/  Hero · FeaturedProperties · SearchBar · Stats
    common/  Header · Navigation · Footer
    forms/ · calculators/
  services/
    bridge-api.ts        # escrito, SIN USAR — nunca hubo credenciales
    simplyrets.ts        # escrito, SIN USAR
    sheets.ts · email.ts
  layouts/  BaseLayout (soporta noindex) · PropertyLayout · BlogLayout · AdminLayout
public/images/listings/  # ~236 fotos
```

---

## Cómo continuar

```bash
cd ~/Downloads/_Projects/mrt-realestate
npm run dev          # http://localhost:4321/
```

Para actualizar el inventario, leer `scripts/README-INVENTARIO.md` y correr los cuatro comandos.
