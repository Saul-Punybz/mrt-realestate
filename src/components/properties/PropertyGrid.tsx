import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import type { Property, PropertyFilters } from '../../types/property';
import { activeListings } from '../../data/listings';

interface PropertyGridProps {
  filters?: PropertyFilters;
  columns?: 2 | 3 | 4;
}

export default function PropertyGrid({ filters, columns = 3 }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let filtered = [...activeListings];

        // Apply filters
        if (filters?.minPrice) {
          filtered = filtered.filter((p) => p.price >= filters.minPrice!);
        }
        if (filters?.maxPrice) {
          filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
        }
        if (filters?.bedrooms) {
          filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms!);
        }
        if (filters?.propertyType?.length) {
          filtered = filtered.filter((p) =>
            filters.propertyType!.includes(p.propertyType)
          );
        }
        if (filters?.city) {
          filtered = filtered.filter(
            (p) => p.address.city.toLowerCase() === filters.city!.toLowerCase()
          );
        }

        // Sort
        switch (sortBy) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'date-asc':
            filtered.sort((a, b) => new Date(a.listDate).getTime() - new Date(b.listDate).getTime());
            break;
          case 'date-desc':
          default:
            filtered.sort((a, b) => new Date(b.listDate).getTime() - new Date(a.listDate).getTime());
        }

        setProperties(filtered);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, sortBy]);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
            <div className="h-64 bg-gray-200" />
            <div className="p-5">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-gray-600">
          <span className="font-semibold text-navy-900">{properties.length}</span> propiedades encontradas
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Ordenar por:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguas</option>
            <option value="price-desc">Mayor precio</option>
            <option value="price-asc">Menor precio</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {properties.length > 0 ? (
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="font-serif text-2xl text-navy-900 mb-2">
            No encontramos propiedades
          </h3>
          <p className="text-gray-600">
            Intenta ajustar tus filtros para ver más resultados
          </p>
        </div>
      )}
    </div>
  );
}
