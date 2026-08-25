#!/usr/bin/env node
// Baja las fotos MLS de cada propiedad activa a public/images/listings/.
//
//   node scripts/fetch-photos.mjs          -> solo las que faltan
//   node scripts/fetch-photos.mjs --force   -> vuelve a bajar todo
//
// Corre DESPUES de fetch-inventory.mjs (necesita scripts/inventory.json).
//
// Las fotos viven en realtyserver con el patron <photoId>.L01, .L02, ...
// Cuando se acaban las fotos el servidor devuelve un placeholder de 14,576 bytes
// en vez de un 404, asi que hay que detectarlo por tamano.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'public/images/listings');
const MAX_PHOTOS = 8;
const PLACEHOLDER_BYTES = 14576;
const FORCE = process.argv.includes('--force');

const photoUrl = (id, n) =>
  'https://images.realtyserver.com/photo_server.php' +
  `?btnSubmit=GetPhoto&failover=portal_Blank.gif&board=puerto_rico&name=${id}.L${String(n).padStart(2, '0')}`;

mkdirSync(DIR, { recursive: true });

// Las fotos del MLS llegan a ~600KB cada una. A 8 por propiedad eso son decenas de
// MB que el visitante tiene que bajar. sips (viene con macOS) las recomprime a la
// tercera parte sin cambiar dimensiones. Si no existe sips, se dejan como vienen.
function compress(path) {
  try {
    const before = statSync(path).size;
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', 'low', path, '--out', path], {
      stdio: 'ignore',
    });
    return before - statSync(path).size;
  } catch {
    return 0;
  }
}

const inventory = JSON.parse(readFileSync(join(ROOT, 'scripts/inventory.json'), 'utf8'));
const active = inventory.filter((l) => l.status === 'Active');
const existing = new Set(readdirSync(DIR));

let downloaded = 0;

for (const l of active) {
  if (!l.slug) {
    console.error(`  ! ${l.title} sin slug — corre build-listings.mjs primero`);
    continue;
  }
  if (!FORCE && existing.has(`${l.slug}-1.jpg`)) {
    console.log(`  = ${l.slug} (ya está)`);
    continue;
  }

  let saved = 0;
  let shaved = 0;
  for (let n = 1; n <= MAX_PHOTOS; n++) {
    const res = await fetch(photoUrl(l.photoId, n));
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === PLACEHOLDER_BYTES || buf.length < 5000) break; // se acabaron
    const path = join(DIR, `${l.slug}-${saved + 1}.jpg`);
    writeFileSync(path, buf);
    shaved += compress(path);
    saved++;
  }

  downloaded += saved;
  console.log(`  ${saved ? '+' : '!'} ${l.slug}: ${saved} fotos${shaved ? ` (−${Math.round(shaved / 1024)}KB)` : ''}`);
}

console.log(`\n${downloaded} fotos nuevas en ${DIR}`);
