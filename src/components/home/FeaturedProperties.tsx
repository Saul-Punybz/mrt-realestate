import { useEffect, useState } from 'react';
import { ArrowRight, Bed, Bath, Square, MapPin } from 'lucide-react';
import type { Property } from '../../types/property';
import { featuredListings } from '../../data/listings';

function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.newListing && (
            <span className="bg-gold-500 text-navy-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Nueva
            </span>
          )}
          <span className="bg-navy-900/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
        {/* Price */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-navy-900 px-4 py-2 rounded-lg font-serif text-xl font-bold">
            ${property.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{property.address.city}, Puerto Rico</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-6 text-gray-600 mb-6">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms} Hab</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms} Baños</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4" />
            <span className="text-sm">{property.squareFeet.toLocaleString()} ft²</span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={`/properties/${property.slug}`}
          className="flex items-center justify-center gap-2 w-full bg-navy-900 text-white py-3 rounded-lg font-medium hover:bg-gold-500 hover:text-navy-900 transition-colors"
        >
          Ver Detalles
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch - replace with actual API call
    const fetchProperties = async () => {
      try {
        setProperties(featuredListings.slice(0, 3));
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cargando propiedades...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold-600 font-semibold uppercase tracking-wider text-sm">
            Selección Exclusiva
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mt-2 mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre nuestra selección de propiedades premium en las mejores
            ubicaciones de Puerto Rico
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/properties"
            className="inline-flex items-center gap-2 bg-navy-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gold-500 hover:text-navy-900 transition-colors"
          >
            Ver Todas las Propiedades
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
