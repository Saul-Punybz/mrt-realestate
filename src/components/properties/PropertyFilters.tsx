import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import type { PropertyFilters as FilterState } from '../../types/property';

interface PropertyFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const propertyTypes = ['Casa', 'Apartamento', 'Comercial', 'Terreno', 'Multi-Familiar', 'Mixto', 'Finca'];

const cities = [
  'Aguadilla',
  'Arecibo',
  'Barceloneta',
  'Bayamón',
  'Cabo Rojo',
  'Caguas',
  'Carolina',
  'Ciales',
  'Culebra',
  'Dorado',
  'Guaynabo',
  'Hatillo',
  'Humacao',
  'Lares',
  'Mayagüez',
  'Ponce',
  'Rincón',
  'San Juan',
  'Utuado',
  'Vieques',
];

export default function PropertyFilters({ onFilterChange, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    bedrooms: initialFilters?.bedrooms,
    bathrooms: initialFilters?.bathrooms,
    propertyType: initialFilters?.propertyType || [],
    amenities: initialFilters?.amenities || [],
    city: initialFilters?.city,
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      propertyType: [],
      amenities: [],
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.bathrooms ||
    (filters.propertyType?.length ?? 0) > 0 ||
    filters.city;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gold-500" />
          <h3 className="font-serif text-lg font-semibold text-navy-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-3">
        <label className="block font-semibold text-navy-900 text-xs mb-1.5">Precio</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice || ''}
            onChange={(e) =>
              handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-xs"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full p-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Beds & Baths - Single Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block font-semibold text-navy-900 text-xs mb-1.5">Hab.</label>
          <div className="flex flex-wrap gap-1">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleFilterChange({ bedrooms: num === 0 ? undefined : num })}
                className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                  (filters.bedrooms ?? 0) === num || (num === 0 && !filters.bedrooms)
                    ? 'bg-gold-500 border-gold-500 text-navy-900'
                    : 'border-gray-200 hover:border-gold-500 text-gray-600'
                }`}
              >
                {num === 0 ? 'All' : `${num}+`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold text-navy-900 text-xs mb-1.5">Baños</label>
          <div className="flex flex-wrap gap-1">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleFilterChange({ bathrooms: num === 0 ? undefined : num })}
                className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                  (filters.bathrooms ?? 0) === num || (num === 0 && !filters.bathrooms)
                    ? 'bg-gold-500 border-gold-500 text-navy-900'
                    : 'border-gray-200 hover:border-gold-500 text-gray-600'
                }`}
              >
                {num === 0 ? 'All' : `${num}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Type - Compact chips */}
      <div className="mb-3">
        <label className="block font-semibold text-navy-900 text-xs mb-1.5">Tipo</label>
        <div className="flex flex-wrap gap-1.5">
          {propertyTypes.map((type) => {
            const isActive = filters.propertyType?.includes(type) || false;
            return (
              <button
                key={type}
                onClick={() => {
                  const newTypes = isActive
                    ? (filters.propertyType || []).filter((t) => t !== type)
                    : [...(filters.propertyType || []), type];
                  handleFilterChange({ propertyType: newTypes });
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-navy-900 border-navy-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gold-500'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block font-semibold text-navy-900 text-xs mb-1.5">Ciudad</label>
        <div className="relative">
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange({ city: e.target.value || undefined })}
            className="w-full p-2 pr-8 border border-gray-200 rounded-lg appearance-none bg-white focus:border-gold-500 focus:outline-none text-xs"
          >
            <option value="">Todas</option>
            {cities.map((city) => (
              <option key={city} value={city.toLowerCase()}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
