import { Bed, Bath, Square, Calendar, Home, Ruler } from 'lucide-react';
import type { Property } from '../../types/property';

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bed className="w-6 h-6 text-gold-600" />
            </div>
            <div className="font-semibold text-navy-900 text-xl">{property.bedrooms}</div>
            <div className="text-gray-500 text-sm">Habitaciones</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bath className="w-6 h-6 text-gold-600" />
            </div>
            <div className="font-semibold text-navy-900 text-xl">{property.bathrooms}</div>
            <div className="text-gray-500 text-sm">Baños</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Square className="w-6 h-6 text-gold-600" />
            </div>
            <div className="font-semibold text-navy-900 text-xl">
              {property.squareFeet.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm">ft² Interior</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Ruler className="w-6 h-6 text-gold-600" />
            </div>
            <div className="font-semibold text-navy-900 text-xl">
              {property.lotSize?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-gray-500 text-sm">ft² Terreno</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
          Descripción
        </h2>
        <div className="prose prose-gray max-w-none">
          {property.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-600 mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
          Detalles de la Propiedad
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem icon={<Home />} label="Tipo" value={property.propertyType} />
          <DetailItem
            icon={<Calendar />}
            label="Año Construcción"
            value={property.yearBuilt?.toString() || 'N/A'}
          />
          <DetailItem label="Estado" value={property.status} />
          <DetailItem label="MLS #" value={property.mlsNumber || 'N/A'} />
          <DetailItem label="Días en Mercado" value={property.daysOnMarket.toString()} />
          <DetailItem label="ID Listado" value={property.listingId} />
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
          Amenidades
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {property.amenities.map((amenity, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-gray-600"
            >
              <svg
                className="w-5 h-5 text-gold-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">
          Ubicación
        </h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-medium text-navy-900">Dirección:</span>{' '}
            {property.address.full}
          </p>
          <p>
            <span className="font-medium text-navy-900">Ciudad:</span>{' '}
            {property.address.city}
          </p>
          <p>
            <span className="font-medium text-navy-900">Código Postal:</span>{' '}
            {property.address.zip}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-gold-500 mt-0.5">{icon}</div>}
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="font-medium text-navy-900">{value}</div>
      </div>
    </div>
  );
}
