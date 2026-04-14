import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { submitToSheet } from '../../services/sheets';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

export default function ContactForm({ propertyId, propertyTitle }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: propertyTitle
      ? `Estoy interesado/a en la propiedad "${propertyTitle}". Por favor contáctenme.`
      : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formType = propertyId ? 'consulta-propiedad' : 'contacto';
      const result = await submitToSheet({
        formType,
        data: {
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone,
          mensaje: formData.message,
          ...(propertyId && { propiedad_id: propertyId }),
          ...(propertyTitle && { propiedad: propertyTitle }),
        },
      });

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Hubo un error al enviar el mensaje. Por favor intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h4 className="font-serif text-xl font-semibold text-navy-900 mb-2">
          ¡Mensaje Enviado!
        </h4>
        <p className="text-gray-600">
          Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
          placeholder="(787) 000-0000"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm resize-none"
          placeholder="Escribe tu mensaje aquí..."
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold-500 text-navy-900 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enviar Mensaje
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al enviar este formulario, acepta que MRT Real Estate use su información para comunicarse con usted sobre bienes raíces.
      </p>
    </form>
  );
}
