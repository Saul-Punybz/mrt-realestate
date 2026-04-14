// Google Sheets integration via Google Apps Script
// The GOOGLE_SCRIPT_URL should be set after deploying the Apps Script

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbye0qPFQnTL5cu5xV2T23g5n4w9CHjMgWWMhOPbLiJqcUtSmNpI1Qfeqkdyg3r_uyPw/exec';

interface SheetSubmission {
  formType: 'contacto' | 'co-broke' | 'consulta-propiedad';
  data: Record<string, string | number | boolean | undefined>;
}

export async function submitToSheet(submission: SheetSubmission): Promise<{ success: boolean; message: string }> {
  if (GOOGLE_SCRIPT_URL === 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL') {
    console.warn('Google Sheets URL not configured. Form data:', submission);
    return { success: true, message: 'Formulario recibido (modo demo).' };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet: submission.formType,
        timestamp: new Date().toLocaleString('es-PR', { timeZone: 'America/Puerto_Rico' }),
        ...submission.data,
      }),
    });

    // no-cors mode always returns opaque response, so we assume success
    return { success: true, message: 'Formulario enviado exitosamente.' };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return { success: false, message: 'Error al enviar el formulario. Intente de nuevo.' };
  }
}
