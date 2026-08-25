#!/usr/bin/env node
// Regenera src/data/listings.ts desde el inventario real de MRT.
//
//   node scripts/fetch-inventory.mjs      # 1. baja el feed
//   node scripts/build-listings.mjs       # 2. arma la data (asigna slugs)
//   node scripts/fetch-photos.mjs         # 3. baja las fotos que falten
//   node scripts/build-listings.mjs       # 4. otra vez, ya con las fotos en disco
//
// Fuentes:
//   scripts/inventory.json        <- generado por fetch-inventory.mjs (el feed vivo)
//   scripts/listings-manual.json  <- lo que NO viene del feed:
//        overrideByMls: slug/fotos/coords a preservar para no romper URLs vivas
//        retired:       propiedades que estuvieron publicadas y ya no estan en el
//                       feed. Se mantienen para que su URL no de 404, con status
//                       'Sold' (confirmado vendido en el feed) u 'Off Market'
//                       (desaparecio del feed, razon sin confirmar).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const inventory = read('scripts/inventory.json');
const manual = read('scripts/listings-manual.json');

// Centro de cada municipio. El sitio nunca tuvo coordenadas exactas por propiedad
// —el feed no las da— asi que el mapa apunta al pueblo, igual que antes.
const COORDS = {
  Arecibo: [18.4725, -66.7156],
  Isabela: [18.5008, -67.0244],
  Utuado: [18.2683, -66.7005],
  Barceloneta: [18.4508, -66.5385],
  Lares: [18.2947, -66.8779],
  Ciales: [18.3364, -66.4686],
  'San Sebastián': [18.3372, -66.9905],
  Manatí: [18.4278, -66.4822],
  Hatillo: [18.4863, -66.8254],
  'Vega Alta': [18.4122, -66.3313],
  Camuy: [18.4844, -66.8449],
  Aguadilla: [18.4275, -67.1541],
  Guaynabo: [18.3644, -66.1102],
};

// Tipos del MLS -> tipos que usan los filtros del sitio
const TYPES = {
  'Vacant Lot': 'Terreno',
  Land: 'Terreno',
  Farm: 'Finca',
  House: 'Casa',
  'Single Family': 'Casa',
  Condo: 'Apartamento',
  Apartment: 'Apartamento',
  'Commercial Space': 'Comercial',
  Commercial: 'Comercial',
  Office: 'Comercial',
  'Multi Family': 'Multi-Familiar',
  Multifamily: 'Multi-Familiar',
};

const M2_TO_SQFT = 10.7639;

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// El MLS solo publica el area del SOLAR (Lot Size); nunca da area interior. Por eso
// squareFeet (que el sitio rotula "ft² Interior") se queda en 0 y el dato real va en
// lotSize. Inventarse el area interior seria justo el tipo de dato falso que estamos
// tratando de sacar del sitio.
function toSqft(raw) {
  const n = Number(String(raw).replace(/[^\d.]/g, '')) || 0;
  if (!n) return 0;
  return Math.round(/m²/.test(String(raw)) ? n * M2_TO_SQFT : n);
}

function propertyType(l) {
  // Ojo: el MLS clasifica los multifamiliares como "House". Hay que mirar el texto.
  if (/multifamil/i.test(`${l.title} ${l.fullDescription}`) || (l.beds >= 4 && l.baths >= 3)) {
    return 'Multi-Familiar';
  }
  if (TYPES[l.propertyType]) return TYPES[l.propertyType];
  if (l.commercial) return 'Comercial';
  return l.beds > 0 ? 'Casa' : 'Terreno';
}

function amenities(l) {
  const out = [];
  const text = `${l.title} ${l.fullDescription}`.toLowerCase();
  if (l.barrio) out.push(`Bo. ${l.barrio}`);
  if (l.lotSize) out.push(`Solar ${l.lotSize}`);
  if (/beach|playa|ocean|mar\b/.test(text)) out.push('Cerca de la playa');
  if (/pool|piscina/.test(text)) out.push('Piscina');
  if (/river|río|rio\b|creek/.test(text)) out.push('Río');
  if (/garage|carport|marquesina/.test(text)) out.push('Garaje');
  if (/view|vista/.test(text)) out.push('Vista');
  if (/rent|lease|alquil/.test(text) && l.price < 5000) out.push('Alquiler');
  return [...new Set(out)].slice(0, 5);
}

// --- slugs -------------------------------------------------------------
// Las propiedades que ya estaban publicadas conservan su slug para no romper
// enlaces ni el SEO. Las nuevas lo sacan del titulo.
const taken = new Set(manual.retired.map((r) => r.slug));
const active = inventory.filter((l) => l.status === 'Active');

for (const l of active) {
  const ov = manual.overrideByMls[l.mls];
  if (ov?.slug) {
    l.slug = ov.slug;
  } else {
    let base = slugify(l.title) || `propiedad-${l.mls}`;
    let s = base;
    let i = 2;
    while (taken.has(s)) s = `${base}-${i++}`;
    l.slug = s;
  }
  taken.add(l.slug);
}

// Reescribe inventory.json con los slugs, para que fetch-photos.mjs sepa
// como nombrar los archivos.
writeFileSync(join(ROOT, 'scripts/inventory.json'), JSON.stringify(inventory, null, 2));

// --- armado ------------------------------------------------------------
function imagesFor(l) {
  const ov = manual.overrideByMls[l.mls];
  if (ov?.images) return ov.images;
  const found = [];
  for (let n = 1; n <= 8; n++) {
    if (existsSync(join(ROOT, `public/images/listings/${l.slug}-${n}.jpg`))) {
      found.push(`/images/listings/${l.slug}-${n}.jpg`);
    }
  }
  return found;
}

const today = new Date().toISOString().slice(0, 10);

const built = active.map((l, i) => {
  const ov = manual.overrideByMls[l.mls] || {};
  const [lat, lng] = COORDS[l.municipality] || [18.4725, -66.7156];
  const isRental = l.price > 0 && l.price < 5000;
  const street = l.street || l.title;

  return {
    id: String(i + 1),
    listingId: `MLS-${l.mls}`,
    slug: l.slug,
    title: l.title,
    // El MLS suele cerrar las descripciones con ".." o "...". Se normaliza a un punto.
    description: (l.fullDescription || l.description).replace(/\.{2,}\s*$/, '.').trim(),
    price: l.price,
    status: isRental ? 'Rental' : 'Active',
    propertyType: propertyType(l),
    address: {
      street,
      city: l.municipality,
      state: 'PR',
      zip: l.zip || '',
      full: [street, l.barrio, l.municipality, `PR ${l.zip || ''}`].filter(Boolean).join(', ').trim(),
    },
    latitude: ov.latitude ?? lat,
    longitude: ov.longitude ?? lng,
    bedrooms: l.beds,
    bathrooms: l.baths,
    squareFeet: 0, // el MLS no publica área interior — ver nota en toSqft()
    lotSize: toSqft(l.lotSize),
    amenities: amenities(l),
    images: imagesFor(l),
    listDate: today,
    daysOnMarket: 0,
    mlsNumber: l.mls,
    featured: ov.featured ?? l.price >= 300000,
    // "NUEVA" = no estaba publicada antes de esta actualización
    newListing: !ov.preserved,
  };
});

const all = [...built, ...manual.retired];

const missing = built.filter((b) => b.images.length === 0);

const out = `import type { Property } from '../types/property';

// Inventario real de MRT Real Estate.
// GENERADO — no editar a mano. Para actualizar:
//   node scripts/fetch-inventory.mjs && node scripts/build-listings.mjs
//   node scripts/fetch-photos.mjs && node scripts/build-listings.mjs
// Ver scripts/README-INVENTARIO.md
//
// Fuente: feed Xposure/RealtyHD de Marilyn (mrtrealestate.realtyhd.com/listings)
// Última actualización: ${today}
// ${built.length} disponibles · ${manual.retired.filter((r) => r.status === 'Sold').length} vendidas · ${manual.retired.filter((r) => r.status === 'Off Market').length} fuera de mercado

export const listings: Property[] = ${JSON.stringify(all, null, 2)};

// Helper: solo las disponibles para la venta — NO vendidas ni fuera de mercado
export const activeListings = listings.filter(l => l.status === 'Active');

// Helper: destacadas (portada)
export const featuredListings = listings.filter(l => l.featured && l.status === 'Active');

// Helper: alquileres
export const rentalListings = listings.filter(l => l.status === 'Rental');

// Helper: ya no disponibles — la página existe pero se marca como tal
export const unavailableListings = listings.filter(l => l.status === 'Sold' || l.status === 'Off Market');

// Todos los municipios con inventario disponible
export const listingCities = [...new Set(activeListings.map(l => l.address.city))].sort();
`;

writeFileSync(join(ROOT, 'src/data/listings.ts'), out);

console.log(`\nsrc/data/listings.ts regenerado`);
console.log(`  ${built.length} disponibles (${built.filter((b) => b.status === 'Rental').length} alquiler)`);
console.log(`  ${manual.retired.filter((r) => r.status === 'Sold').length} vendidas`);
console.log(`  ${manual.retired.filter((r) => r.status === 'Off Market').length} fuera de mercado`);
if (missing.length) {
  console.log(`\n  ! ${missing.length} sin fotos — corre: node scripts/fetch-photos.mjs`);
  missing.forEach((m) => console.log(`      ${m.slug}`));
}
