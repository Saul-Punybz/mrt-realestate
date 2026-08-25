#!/usr/bin/env node
// Extrae el inventario real de MRT desde el feed Xposure/RealtyHD de Marilyn.
//
//   node scripts/fetch-inventory.mjs            -> escribe scripts/inventory.json
//   node scripts/fetch-inventory.mjs --no-detail -> solo el feed, sin abrir cada detalle
//
// Fuente: https://mrtrealestate.realtyhd.com/listings  (HTML server-rendered, 30 listings)
// Cada listing enlaza a properties.listingspuertorico.com, que trae MLS#, municipio,
// codigo postal, tipo y tamano.
//
// El feed marca cada propiedad como xp-active o xp-sold. Eso es la unica fuente de
// verdad sobre que sigue disponible.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// locale=en_PR fuerza ingles; el sitio publico esta en ingles y sin esto el feed
// contesta en espanol segun la cookie del servidor.
const FEED_URL = 'https://mrtrealestate.realtyhd.com/listings?locale=en_PR';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'inventory.json');
const WITH_DETAIL = !process.argv.includes('--no-detail');

const decode = (s) =>
  s
    .replace(/&sup2;/g, '²')
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const clean = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function parseFeed(html) {
  // Cada tarjeta arranca en <div class="xp-listing ... y termina en el siguiente </div>
  const chunks = html.split(/<div class="xp-listing/).slice(1);

  return chunks.map((chunk, i) => {
    const grab = (re) => {
      const m = chunk.match(re);
      return m ? clean(m[1]) : '';
    };

    const status = /xp-sold/.test(chunk.slice(0, 200)) ? 'Sold' : 'Active';
    const photoId = (chunk.match(/name=([0-9A-F]{6,})\.L01/) || [])[1] || '';
    const detailUrl = (chunk.match(/href="(https:\/\/properties\.listingspuertorico\.com\/listing\/[^"]+)"/) || [])[1] || '';

    // /listing/<Barrio>-<codigo>/<Direccion>/<id>
    const path = detailUrl.replace(/^https:\/\/[^/]+\/listing\//, '').split('?')[0].split('/');
    const barrio = decodeURIComponent(path[0] || '').replace(/-\d+$/, '').replace(/-/g, ' ');
    const street = decodeURIComponent(path[1] || '').replace(/-+/g, ' ').trim();

    return {
      n: i + 1,
      status,
      commercial: /xp-commercial/.test(chunk.slice(0, 200)),
      photoId,
      detailUrl,
      barrio,
      street,
      title: grab(/<span class="xp-name">([\s\S]*?)<\/span>/),
      price: Number(grab(/<span class="xp-price">([\s\S]*?)<\/span>/).replace(/[^0-9]/g, '')) || 0,
      beds: Number(grab(/<span class="xp-bed">([\s\S]*?)<\/span>/).replace(/\D/g, '')) || 0,
      baths: Number(grab(/<span class="xp-bath">([\s\S]*?)<\/span>/).replace(/[^\d.]/g, '')) || 0,
      description: grab(/<p class="xp-description">([\s\S]*?)<\/p>/).replace(/\.\.\.$/, ''),
    };
  });
}

function parseDetail(html) {
  // La ficha es una tabla plana: <tr><td><strong>Label</strong></td><td>Valor</td></tr>
  const rows = {};
  for (const m of html.matchAll(/<tr><td><strong>([\s\S]*?)<\/strong><\/td><td>([\s\S]*?)<\/td><\/tr>/g)) {
    rows[clean(m[1]).replace(/&\w+;/g, '').replace(/[®#]/g, '').trim()] = clean(m[2]);
  }

  // Descripcion completa: el <p> que sigue a la tabla de detalles
  const body = html.match(/<div id="basicDiv"[\s\S]*?<\/table>\s*<p>([\s\S]*?)<\/p>/);

  return {
    mls: rows['MLS'] || '',
    area: rows['Area'] || '',
    subArea: rows['Sub Area'] || '',
    zip: rows['Postal Code'] || '',
    municipality: rows['State/Province'] || '',
    propertyType: rows['Property Type'] || '',
    lotSize: rows['Lot Size'] || '',
    buildingSize: rows['Building Size'] || rows['Square Footage'] || '',
    yearBuilt: rows['Year Built'] || '',
    fullDescription: body ? clean(body[1]) : '',
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const html = await fetch(FEED_URL).then((r) => r.text());
const listings = parseFeed(html);

if (WITH_DETAIL) {
  for (const l of listings) {
    if (!l.detailUrl) continue;
    try {
      const url = l.detailUrl.includes('locale=') ? l.detailUrl : `${l.detailUrl}?locale=en_PR`;
      const d = await fetch(url).then((r) => r.text());
      Object.assign(l, parseDetail(d));
    } catch (err) {
      console.error(`  ! detalle falló para #${l.n} ${l.title}: ${err.message}`);
    }
    await sleep(400); // no martillar el servidor
  }
}

writeFileSync(OUT, JSON.stringify(listings, null, 2));

const active = listings.filter((l) => l.status === 'Active');
const sold = listings.filter((l) => l.status === 'Sold');
console.log(`\n${listings.length} propiedades en el feed: ${active.length} activas, ${sold.length} vendidas`);
console.log(`Escrito: ${OUT}\n`);
for (const l of listings) {
  console.log(
    `${String(l.n).padStart(2)} ${l.status === 'Sold' ? 'VENDIDA' : 'activa '} ` +
      `${(l.mls || l.photoId).padEnd(9)} $${String(l.price).padStart(9)}  ${(l.municipality || '?').padEnd(12)} ${l.title.slice(0, 58)}`
  );
}
