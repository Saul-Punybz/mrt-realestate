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

Cada vez que entra un lead, que le llegue un correo. Todo desde el mismo Apps Script,
sin SendGrid ni servicio externo.

## ⚠️ Lo que NO funciona

**Las "Reglas de notificacion" de Google Sheets (Herramientas > Reglas de notificacion) NO
sirven para esto.** Solo se disparan con ediciones hechas por una persona en la hoja, no con
filas escritas por un script o por la API. Si se configuran, no llega nada y parece que el
sistema esta roto.

El correo hay que mandarlo desde el `doPost`, que es donde ya sabemos que entra el lead.

## El codigo

Reemplaza el `doPost` del Apps Script por este. Lo unico que cambia arriba son los correos.

```javascript
// ── Configuracion ───────────────────────────────────────────────
var AVISAR_A  = 'marilyn@mrtrealestate.com';  // quien recibe el aviso
var COPIA_A   = 'saul@puny.bz';               // deja '' si no quieres copia
var SITIO     = 'https://www.mrtrealestate.com';

var TITULOS = {
  'contacto':           'Nuevo mensaje de contacto',
  'consulta-propiedad': 'Consulta sobre una propiedad',
  'co-broke':           'Registro de Co-Broke'
};

function doPost(e) {
  var data, sheetName;

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
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2) Avisar por correo. En su propio try: si el correo falla, el lead YA
  //    quedo guardado y no se pierde. Nunca al reves.
  try {
    enviarAviso(sheetName, data);
  } catch (error) {
    console.error('Fallo el aviso por email: ' + error.message);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function enviarAviso(sheetName, data) {
  var titulo = TITULOS[sheetName] || 'Nuevo lead del website';
  var nombre = data.nombre || data.broker_name || 'Sin nombre';
  var email  = data.email  || data.broker_email || '';

  var asunto = titulo + ' — ' + nombre;
  if (data.propiedad) asunto += ' · ' + data.propiedad;

  // Todos los campos que vinieron, en orden, menos los de control
  var filas = Object.keys(data)
    .filter(function (k) { return k !== 'sheet' && data[k] !== '' && data[k] != null; })
    .map(function (k) {
      var etiqueta = k.replace(/_/g, ' ');
      etiqueta = etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
      return '<tr>' +
        '<td style="padding:6px 14px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top">' +
          etiqueta + '</td>' +
        '<td style="padding:6px 0;color:#111827">' + escapar(String(data[k])) + '</td>' +
      '</tr>';
    })
    .join('');

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px">' +
      '<p style="font-size:17px;margin:0 0 4px"><strong>' + titulo + '</strong></p>' +
      '<p style="color:#6b7280;margin:0 0 18px">Desde ' + SITIO + '</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + filas + '</table>' +
      (email
        ? '<p style="margin:22px 0 0"><a href="mailto:' + email + '" ' +
          'style="background:#c9a227;color:#fff;padding:10px 18px;border-radius:6px;' +
          'text-decoration:none;display:inline-block">Responder a ' + nombre + '</a></p>'
        : '') +
      '<p style="color:#9ca3af;font-size:12px;margin:26px 0 0">' +
        'Aviso automatico del website. El lead ya quedo guardado en la hoja ' +
        '"' + sheetName + '".</p>' +
    '</div>';

  var opciones = {
    name: 'Website MRT Real Estate',
    htmlBody: html
  };
  if (COPIA_A) opciones.cc = COPIA_A;
  // Con esto, darle "Responder" en el correo le contesta al cliente directo.
  if (email) opciones.replyTo = email;

  MailApp.sendEmail(AVISAR_A, asunto, textoPlano(sheetName, data), opciones);
}

function textoPlano(sheetName, data) {
  return (TITULOS[sheetName] || 'Nuevo lead') + '\n\n' +
    Object.keys(data)
      .filter(function (k) { return k !== 'sheet' && data[k]; })
      .map(function (k) { return k.replace(/_/g, ' ') + ': ' + data[k]; })
      .join('\n');
}

function escapar(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

## Pasos

1. Abre la hoja > **Extensiones > Apps Script**
2. Reemplaza el `doPost` por el codigo de arriba (deja el `doGet` como esta)
3. Guarda
4. **Deploy > Manage deployments > el lapiz > Version: New version > Deploy**
   Ojo: si creas un *New deployment* en vez de una version nueva, cambia la URL `/exec`
   y hay que actualizarla en `src/services/sheets.ts` y `src/pages/co-broke.astro`.
   **Usa "New version" y la URL se queda igual.**
5. La primera vez Google pide autorizar el permiso de enviar correo. Autoriza.
6. Prueba: envia el formulario de contacto del sitio y confirma que llega el correo.

## Detalles que importan

- **El correo sale desde la cuenta que despliega el script** (`saul@puny.bz`), no desde
  Marilyn. Si se quiere que salga como `info@mrtrealestate.com`, hay que tener ese correo
  configurado como alias en ese Gmail y añadir `from: 'info@mrtrealestate.com'` a `opciones`.
- **Si el correo falla, el lead igual se guarda.** Por eso van en dos `try` separados y el
  guardado va primero. Nunca al reves.
- **`replyTo`** apunta al cliente: Marilyn le da "Responder" y le contesta directo, sin copiar
  y pegar la direccion.
- **Limite de Gmail:** 100 correos al dia con cuenta gratuita, 1,500 con Workspace. Muy por
  encima del volumen real (unos 11 leads en cinco meses).
- **El spam tambien va a generar correos.** Los formularios no tienen honeypot ni reCAPTCHA.
  Si empieza a molestar, eso es lo que hay que atender.
