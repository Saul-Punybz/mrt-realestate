import type { APIRoute } from 'astro';
import { sendPropertyInquiry, sendAutoReply } from '../../services/email';
import type { PropertyInquiryData } from '../../types/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: PropertyInquiryData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message || !data.propertyId) {
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

    // Send the property inquiry email
    const result = await sendPropertyInquiry(data);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error al enviar la consulta. Por favor intente de nuevo.',
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
        message: '¡Consulta enviada con éxito! Te contactaremos pronto.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Property inquiry error:', error);
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
