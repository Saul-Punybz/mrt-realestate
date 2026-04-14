import type { ContactFormData, PropertyInquiryData } from '../types/api';

const SENDGRID_API_KEY = import.meta.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@mrtrealestate.com';
const TO_EMAIL = import.meta.env.TO_EMAIL || 'info@mrtrealestate.com';

interface EmailResponse {
  success: boolean;
  message: string;
}

/**
 * Send email using SendGrid API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<EmailResponse> {
  if (!SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: 'MRT Real Estate' },
        reply_to: replyTo ? { email: replyTo } : undefined,
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (response.ok || response.status === 202) {
      return { success: true, message: 'Email sent successfully' };
    }

    const error = await response.text();
    console.error('SendGrid error:', error);
    return { success: false, message: 'Failed to send email' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Error sending email' };
  }
}

/**
 * Send contact form submission
 */
export async function sendContactEmail(data: ContactFormData): Promise<EmailResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A1628; padding: 20px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">MRT Real Estate</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #0A1628; margin-top: 0;">Nuevo Mensaje de Contacto</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Nombre:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.email}</td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Teléfono:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.phone}</td>
          </tr>
          ` : ''}
          ${data.subject ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Asunto:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.subject}</td>
          </tr>
          ` : ''}
        </table>
        <div style="margin-top: 20px;">
          <h3 style="color: #0A1628; margin-bottom: 10px;">Mensaje:</h3>
          <p style="background: white; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
      <div style="background: #0A1628; padding: 15px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">
          Este mensaje fue enviado desde el formulario de contacto de mrtrealestate.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(TO_EMAIL, `Nuevo Contacto: ${data.name}`, html, data.email);
}

/**
 * Send property inquiry email
 */
export async function sendPropertyInquiry(data: PropertyInquiryData): Promise<EmailResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A1628; padding: 20px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">MRT Real Estate</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #0A1628; margin-top: 0;">Nueva Consulta de Propiedad</h2>

        <div style="background: #D4AF37; color: #0A1628; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <strong>Propiedad:</strong> ${data.propertyTitle}<br>
          <strong>ID:</strong> ${data.propertyId}
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Nombre:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.email}</td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Teléfono:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.phone}</td>
          </tr>
          ` : ''}
        </table>
        <div style="margin-top: 20px;">
          <h3 style="color: #0A1628; margin-bottom: 10px;">Mensaje:</h3>
          <p style="background: white; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://mrtrealestate.com/properties/${data.propertyId}"
             style="background: #D4AF37; color: #0A1628; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ver Propiedad
          </a>
        </div>
      </div>
      <div style="background: #0A1628; padding: 15px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">
          Este mensaje fue enviado desde el formulario de consulta de mrtrealestate.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(
    TO_EMAIL,
    `Consulta: ${data.propertyTitle}`,
    html,
    data.email
  );
}

/**
 * Send auto-reply to user
 */
export async function sendAutoReply(name: string, email: string): Promise<EmailResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A1628; padding: 20px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0;">MRT Real Estate</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #0A1628; margin-top: 0;">¡Gracias por contactarnos, ${name}!</h2>
        <p style="color: #333; line-height: 1.6;">
          Hemos recibido tu mensaje y uno de nuestros agentes se pondrá en contacto contigo
          lo antes posible, generalmente dentro de las próximas 24 horas.
        </p>
        <p style="color: #333; line-height: 1.6;">
          Mientras tanto, te invitamos a explorar más propiedades en nuestro sitio web.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mrtrealestate.com/properties"
             style="background: #D4AF37; color: #0A1628; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ver Propiedades
          </a>
        </div>
        <p style="color: #333; line-height: 1.6;">
          Si necesitas asistencia inmediata, no dudes en contactarnos por WhatsApp:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://wa.me/17873261547"
             style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            WhatsApp: (787) 326-1547
          </a>
        </div>
      </div>
      <div style="background: #0A1628; padding: 20px; text-align: center;">
        <p style="color: #D4AF37; margin: 0 0 10px 0; font-weight: bold;">MRT Real Estate</p>
        <p style="color: #888; margin: 0; font-size: 12px;">
          Tu socio de confianza en bienes raíces en Puerto Rico
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, 'Gracias por contactar a MRT Real Estate', html);
}
