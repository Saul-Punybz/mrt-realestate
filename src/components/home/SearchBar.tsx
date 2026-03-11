import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchFilters {
  propertyType: string;
  location: string;
  minPrice: string;
  maxPrice: string;
}

const propertyTypes = [
  { value: '', label: 'Todos los tipos' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'multi-familiar', label: 'Multi-Familiar' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'finca', label: 'Finca' },
];

const locations = [
  { value: '', label: 'Todas las ubicaciones' },
  { value: 'arecibo', label: 'Arecibo' },
  { value: 'utuado', label: 'Utuado' },
  { value: 'lares', label: 'Lares' },
  { value: 'ciales', label: 'Ciales' },
  { value: 'hatillo', label: 'Hatillo' },
  { value: 'aguadilla', label: 'Aguadilla' },
  { value: 'barceloneta', label: 'Barceloneta' },
  { value: 'guaynabo', label: 'Guaynabo' },
];

const priceRanges = [
  { value: '', label: 'Sin límite' },
  { value: '100000', label: '$100,000' },
  { value: '250000', label: '$250,000' },
  { value: '500000', label: '$500,000' },
  { value: '750000', label: '$750,000' },
  { value: '1000000', label: '$1,000,000' },
  { value: '2000000', label: '$2,000,000' },
];

export default function SearchBar() {
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: '',
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.location) params.set('city', filters.location);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    window.location.href = `/properties${params.toString() ? '?' + params.toString() : ''}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Property Type */}
        <div className="relative">
          <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">
            Tipo
          </label>
          <div className="relative">
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg appearance-none bg-white focus:border-gold-500 focus:outline-none transition-colors text-navy-900"
            >
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Location */}
        <div className="relative">
          <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">
            Ubicación
          </label>
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg appearance-none bg-white focus:border-gold-500 focus:outline-none transition-colors text-navy-900"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Price Range */}
        <div className="relative">
          <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">
            Precio Máx
          </label>
          <div className="relative">
            <select
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg appearance-none bg-white focus:border-gold-500 focus:outline-none transition-colors text-navy-900"
            >
              {priceRanges.map((price) => (
                <option key={price.value} value={price.value}>
                  {price.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-gold-500 text-navy-900 font-bold py-3 px-6 rounded-lg hover:bg-navy-900 hover:text-gold-500 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
