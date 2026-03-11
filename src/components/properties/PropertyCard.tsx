import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import type { Property } from '../../types/property';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
}

export default function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const isCompact = variant === 'compact';

  return (
    <article
      className={`group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
        isCompact ? 'flex' : ''
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          isCompact ? 'w-48 h-full flex-shrink-0' : 'h-64'
        }`}
      >
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/fav"
          aria-label="Add to favorites"
        >
          <Heart className="w-5 h-5 text-gray-400 group-hover/fav:text-red-500 transition-colors" />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {property.newListing && (
            <span className="bg-gold-500 text-navy-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Nueva
            </span>
          )}
          {property.featured && (
            <span className="bg-navy-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
              Destacada
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-navy-900 px-3 py-1 rounded-full text-xs font-medium">
            {property.propertyType}
          </span>
        </div>

        {/* Price */}
        {!isCompact && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-navy-900 px-4 py-2 rounded-lg font-serif text-xl font-bold shadow-lg">
              ${property.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 ${isCompact ? 'flex-1' : ''}`}>
        {isCompact && (
          <div className="text-gold-600 font-serif text-lg font-bold mb-1">
            ${property.price.toLocaleString()}
          </div>
        )}

        <h3 className="font-serif text-lg font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-1">
          <a href={`/properties/${property.slug}`}>{property.title}</a>
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{property.address.city}, Puerto Rico</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4" />
            <span>{property.squareFeet.toLocaleString()} ft²</span>
          </div>
        </div>

        {/* CTA - Only for default variant */}
        {!isCompact && (
          <a
            href={`/properties/${property.slug}`}
            className="mt-5 flex items-center justify-center w-full bg-navy-900 text-white py-3 rounded-lg font-medium hover:bg-gold-500 hover:text-navy-900 transition-colors"
          >
            Ver Detalles
          </a>
        )}
      </div>
    </article>
  );
}
