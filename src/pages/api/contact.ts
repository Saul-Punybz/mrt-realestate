import type { APIRoute } from 'astro';
import { sendContactEmail, sendAutoReply } from '../../services/email';
import type { ContactFormData } from '../../types/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Por favor complete todos los campos requeridos',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Por favor ingrese un correo electrónico válido',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send the contact email
    const result = await sendContactEmail(data);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error al enviar el mensaje. Por favor intente de nuevo.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send auto-reply to user
    await sendAutoReply(data.name, data.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Mensaje enviado con éxito! Te contactaremos pronto.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno del servidor',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
