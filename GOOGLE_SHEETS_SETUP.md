# Google Sheets Integration - MRT Real Estate

## Todas las formas del website se guardan en un Google Sheet automaticamente.

> **Estado al 26 ago 2026:** montado y funcionando desde marzo de 2026, verificado con envios
> de prueba. Hoja: **MRT Real Estate - Formularios**
> (`1PUg1_Ci5jev21vo8kMeiGXWCgSF0JVCdh5OW4vu2Hck`).
>
> **Para añadir el aviso por email a Marilyn, ver la seccion "Notificacion por email"
> al final de este documento.**

### Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com) y crea un nuevo spreadsheet
2. Nombra el archivo: **MRT Real Estate - Formularios**
3. Crea 3 tabs (hojas) con estos nombres exactos:
   - `contacto`
   - `consulta-propiedad`
   - `co-broke`

4. En cada tab, agrega estos headers en la fila 1:

**Tab: contacto**
| timestamp | nombre | email | telefono | mensaje |

**Tab: consulta-propiedad**
| timestamp | nombre | email | telefono | mensaje | propiedad_id | propiedad |

**Tab: co-broke**
| timestamp | broker_name | broker_license | broker_company | broker_phone | broker_email | client_name | client_phone | prequalified | property_id | preferred_date | notes |

### Paso 2: Crear el Google Apps Script

1. En el Google Sheet, ve a **Extensions > Apps Script**
2. Borra todo el codigo que aparece
3. Copia y pega este codigo:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet || 'contacto';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Get headers from first row
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // If no headers, create them from data keys
    if (!headers[0]) {
      headers = Object.keys(data).filter(k => k !== 'sheet');
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Map data to row based on headers
    var row = headers.map(function(header) {
      return data[header] || '';
    });

    // Append the row
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('MRT Real Estate Forms API is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. Guarda el proyecto (Ctrl+S o Cmd+S)
5. Nombra el proyecto: **MRT Forms Handler**

### Paso 3: Desplegar como Web App

1. Click en **Deploy > New deployment**
2. Click el icono de engranaje (gear) y selecciona **Web app**
3. Configuracion:
   - **Description:** MRT Forms
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Autoriza el acceso cuando Google lo pida
6. **COPIA LA URL** que aparece (se ve asi: `https://script.google.com/macros/s/AKfycb.../exec`)

### Paso 4: Actualizar el Website

Abre este archivo y reemplaza la URL en AMBOS lugares:

**Archivo 1:** `src/services/sheets.ts` (linea 4)
```
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

**Archivo 2:** `src/pages/co-broke.astro` (dentro del `<script>`)
```
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

### Paso 5: Re-deploy

```bash
cd /Users/saulgonzalez/Downloads/mrt-realestate
npm run build && vercel --prod
```

---

## Formularios conectados:

| Pagina | Tipo | Datos que se guardan |
|--------|------|---------------------|
| /contact | Contacto general | nombre, email, telefono, mensaje |
| /sell | Vender propiedad | nombre, email, telefono, mensaje |
| /properties/[slug] | Consulta propiedad | nombre, email, telefono, mensaje, propiedad |
| /co-broke | Co-Broke registro | broker info, client info, propiedad, fecha |

## Notas

- Los datos se guardan al instante cuando alguien envia un formulario
- Marilyn puede ver todo en el Google Sheet en tiempo real
- No tiene costo — Google Apps Script es gratis

---

# Notificacion por email a Marilyn

Cada vez que entra un lead nuevo, le llega un correo. Todo desde el mismo Apps Script,
sin SendGrid ni servicio externo.

**Solo los nuevos.** El correo se manda dentro del `doPost`, que corre una sola vez por
envio del formulario. **No hay ningun trigger que recorra la hoja**, asi que es imposible
que mande correos por las filas viejas. Si alguien mas adelante añade un trigger de tipo
`onOpen` o de tiempo que lea la hoja, se rompe esa garantia — no hacerlo.

## ⚠️ Lo que NO funciona

**Las "Reglas de notificacion" de Google Sheets (Herramientas > Reglas de notificacion) NO
sirven para esto.** Solo se disparan con ediciones hechas por una persona en la hoja, no con
filas escritas por un script o por la API. Si se configuran, no llega nada y parece que el
sistema esta roto.

El correo hay que mandarlo desde el `doPost`, que es donde ya sabemos que entra el lead.

## El codigo

Reemplaza el `doPost` del Apps Script por este. El `doGet` se queda como esta.

```javascript
// ── Configuracion ───────────────────────────────────────────────
// El correo sale desde la cuenta que despliega el script (saul@puny.bz),
// pero se presenta como MRT Real Estate para que Marilyn reconozca que
// el lead viene de su propia pagina.
var AVISAR_A   = 'marilyn@mrtrealestate.com';
var REMITENTE  = 'MRT Real Estate';
var SITIO      = 'https://www.mrtrealestate.com';

// Esto lo lee Marilyn, asi que va en español correcto, con acentos.
var TITULOS = {
  'contacto':           'Nuevo mensaje desde tu página',
  'consulta-propiedad': 'Alguien pregunta por una de tus propiedades',
  'co-broke':           'Un corredor se registró en Co-Broke'
};

// Como se rotula cada campo en el correo. Lo que no este aqui sale con
// el nombre crudo, con los guiones bajos cambiados por espacios.
var ETIQUETAS = {
  timestamp: 'Fecha', nombre: 'Nombre', email: 'Email', telefono: 'Teléfono',
  mensaje: 'Mensaje', propiedad: 'Propiedad', propiedad_id: 'ID de propiedad',
  broker_name: 'Corredor', broker_license: 'Licencia', broker_company: 'Compañía',
  broker_phone: 'Teléfono del corredor', broker_email: 'Email del corredor',
  client_name: 'Cliente', client_phone: 'Teléfono del cliente',
  prequalified: 'Precualificado', preferred_date: 'Fecha preferida', notes: 'Notas',
  property_id: 'ID de propiedad'
};

// Campos de control: no se listan en la tabla. propiedad_slug se usa para
// armar el enlace a la ficha de la propiedad, no para mostrarlo crudo.
var NO_LISTAR = ['sheet', 'propiedad_slug'];

function doPost(e) {
  var data, sheetName, hojaUrl = '';

  // 1) Guardar el lead. Esto es lo critico y va primero.
  try {
    data = JSON.parse(e.postData.contents);
    sheetName = data.sheet || 'contacto';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!headers[0]) {
      headers = Object.keys(data).filter(function (k) { return k !== 'sheet'; });
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    sheet.appendRow(headers.map(function (h) { return data[h] || ''; }));

    // Enlace directo a la pestaña donde acaba de caer el lead, no a la
    // hoja en general. Marilyn abre el correo y cae en la fila correcta.
    hojaUrl = ss.getUrl() + '#gid=' + sheet.getSheetId();
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2) Avisarle a Marilyn. En su propio try: si el correo falla, el lead YA
  //    quedo guardado y no se pierde. Nunca al reves.
  try {
    avisarAMarilyn(sheetName, data, hojaUrl);
  } catch (error) {
    console.error('Fallo el aviso por email: ' + error.message);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function avisarAMarilyn(sheetName, data, hojaUrl) {
  var titulo = TITULOS[sheetName] || 'Nuevo lead desde tu página';
  // En co-broke quien escribe es el corredor, no el cliente.
  var nombre = data.nombre || data.broker_name || data.client_name || 'Sin nombre';
  var email  = data.email  || data.broker_email || '';
  var tel    = data.telefono || data.broker_phone || data.client_phone || '';

  var asunto = titulo + ' — ' + nombre;
  if (data.propiedad) asunto += ' · ' + data.propiedad;

  // Todo lo que la persona escribio, tal cual lo mando.
  var filas = Object.keys(data)
    .filter(function (k) {
      return NO_LISTAR.indexOf(k) === -1 && data[k] !== '' && data[k] != null;
    })
    .map(function (k) {
      var etiqueta = ETIQUETAS[k] || k.replace(/_/g, ' ');
      return '<tr>' +
        '<td style="padding:7px 16px 7px 0;color:#6b7280;white-space:nowrap;vertical-align:top">' +
          escapar(etiqueta) + '</td>' +
        '<td style="padding:7px 0;color:#111827">' + escapar(String(data[k])) + '</td>' +
      '</tr>';
    })
    .join('');

  var boton = function (href, texto, fondo) {
    return '<a href="' + href + '" style="background:' + fondo + ';color:#fff;' +
      'padding:11px 20px;border-radius:6px;text-decoration:none;display:inline-block;' +
      'margin:0 8px 8px 0;font-size:14px">' + texto + '</a>';
  };

  var acciones = '';
  if (email) acciones += boton('mailto:' + encodeURI(email), 'Responder por email', '#c9a227');
  if (tel)   acciones += boton('tel:' + encodeURI(String(tel).replace(/[^0-9+]/g, '')), 'Llamar', '#1e2a44');

  // Enlaces secundarios. La hoja va SIEMPRE, para que pueda entrar desde el correo.
  var enlaces = [];
  if (data.propiedad_slug) {
    enlaces.push('<a href="' + SITIO + '/properties/' + encodeURIComponent(data.propiedad_slug) +
      '" style="color:#1e2a44">Ver la propiedad en tu página</a>');
  }
  if (hojaUrl) {
    enlaces.push('<a href="' + hojaUrl + '" style="color:#1e2a44">Abrir tu hoja de leads</a>');
  }

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;color:#111827">' +
      '<p style="font-size:18px;margin:0 0 6px"><strong>Marilyn, ' +
        titulo.charAt(0).toLowerCase() + titulo.slice(1) + '.</strong></p>' +
      '<p style="color:#6b7280;margin:0 0 20px;font-size:14px">' +
        'Esta persona escribió desde <a href="' + SITIO + '" style="color:#6b7280">mrtrealestate.com</a>. ' +
        'Ya quedó guardada en tu hoja de leads.</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + filas + '</table>' +
      (acciones ? '<p style="margin:24px 0 0">' + acciones + '</p>' : '') +
      (enlaces.length
        ? '<p style="margin:14px 0 0;font-size:14px">' + enlaces.join('&nbsp;&nbsp;·&nbsp;&nbsp;') + '</p>'
        : '') +
      '<p style="color:#9ca3af;font-size:12px;margin:28px 0 0;border-top:1px solid #e5e7eb;padding-top:14px">' +
        'Aviso automático de tu página. No hace falta responder este correo: ' +
        'dale a Responder y le contestas directo a la persona.</p>' +
    '</div>';

  MailApp.sendEmail(AVISAR_A, asunto, textoPlano(titulo, data, hojaUrl), {
    name: REMITENTE,
    htmlBody: html,
    // Con esto, "Responder" le contesta al cliente, no al script.
    replyTo: email || undefined
  });
}

function textoPlano(titulo, data, hojaUrl) {
  var lineas = Object.keys(data)
    .filter(function (k) { return NO_LISTAR.indexOf(k) === -1 && data[k]; })
    .map(function (k) { return (ETIQUETAS[k] || k.replace(/_/g, ' ')) + ': ' + data[k]; });

  if (data.propiedad_slug) {
    lineas.push('Ver la propiedad: ' + SITIO + '/properties/' + data.propiedad_slug);
  }
  if (hojaUrl) lineas.push('Tu hoja de leads: ' + hojaUrl);

  return 'Marilyn, ' + titulo.charAt(0).toLowerCase() + titulo.slice(1) + '.\n' +
    'Esta persona escribió desde mrtrealestate.com y ya quedó guardada en tu hoja.\n\n' +
    lineas.join('\n');
}

function escapar(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

## Pasos para activarlo

1. Abre la hoja > **Extensiones > Apps Script**
2. Reemplaza el `doPost` por el codigo de arriba (deja el `doGet` como esta)
3. Guarda
4. **Deploy > Manage deployments > el lapiz > Version: New version > Deploy**

   ⚠️ Ojo: si creas un **New deployment** en vez de una **New version**, cambia la URL `/exec`
   y hay que actualizarla en `src/services/sheets.ts` y `src/pages/co-broke.astro`.
   Con "New version" la URL se queda igual y no hay que tocar el sitio.
5. La primera vez Google pide autorizar el permiso de enviar correo. Autoriza.
6. Prueba: envia el formulario de contacto del sitio y confirma que le llega.

## Detalles que importan

- **Sale desde `saul@puny.bz`** (la cuenta que despliega el script), pero se presenta como
  **MRT Real Estate**, para que Marilyn reconozca que el lead viene de su propia pagina.
  Gmail puede mostrar "via" o "en nombre de" — es normal.

- **El nombre "MRT Real Estate" SOLO aplica a los correos del script.** `name` es un parametro
  por mensaje, no una configuracion de la cuenta. Los correos normales de Saul desde Gmail
  siguen saliendo con su nombre de siempre. Lo unico que cambiaria eso seria editar
  Gmail > Configuracion > Cuentas > "Enviar como" y renombrar la propia direccion — no hay
  que hacerlo.

- **Si algun dia se quita el "via puny.bz"** con un alias verificado de `mrtrealestate.com`:
  el alias es inofensivo, pero **no ponerlo como direccion predeterminada**, porque entonces
  los correos nuevos de Saul saldrian desde MRT por defecto. Como alias no-predeterminado se
  elige cuando usarlo y todo lo demas sigue igual.
- **Sin copia a Saul.** Decision del 26 ago 2026: el correo es solo para ella.
- **Si el correo falla, el lead igual se guarda.** Por eso van en dos `try` separados y el
  guardado va primero. Nunca al reves.
- **`replyTo` apunta al cliente**, no al script: Marilyn le da "Responder" y le contesta
  directo. El correo se lo dice explicitamente.
- **Botones de accion:** Responder por email y Llamar, con el telefono ya limpio de guiones.
- **Limite de Gmail:** 100 correos al dia con cuenta gratuita, 1,500 con Workspace. Muy por
  encima del volumen real (unos 11 leads en cinco meses).
- **El spam tambien va a generar correos.** Los formularios no tienen honeypot ni reCAPTCHA.
  Si empieza a molestarle a Marilyn, eso es lo que hay que atender.
