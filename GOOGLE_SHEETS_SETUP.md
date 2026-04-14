# Google Sheets Integration - MRT Real Estate

## Todas las formas del website se guardan en un Google Sheet automaticamente.

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
- Se puede configurar notificaciones por email en Google Sheets (Tools > Notification rules)
- No tiene costo — Google Apps Script es gratis
