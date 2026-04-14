import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['broker_name', 'broker_license', 'broker_company', 'broker_phone', 'broker_email', 'client_name', 'prequalified', 'property_id'];
    for (const field of required) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Campo requerido: ${field}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Log the submission (in production, this would send an email or save to DB)
    console.log('Co-Broke submission:', JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Solicitud de Co-Broke recibida exitosamente.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Co-Broke form error:', error);
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
