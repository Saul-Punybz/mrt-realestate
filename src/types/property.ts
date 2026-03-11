export interface Property {
  id: string;
  listingId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  status: 'Active' | 'Pending' | 'Sold' | 'Off Market' | 'Optioned' | 'Rental';
  propertyType: 'Casa' | 'Apartamento' | 'Villa' | 'Comercial' | 'Terreno' | 'Multi-Familiar' | 'Mixto' | 'Finca';

  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  latitude: number;
  longitude: number;

  // Features
  bedrooms: number;
  bathrooms: number;
  halfBaths?: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  stories?: number;
  garageSpaces?: number;

  // Amenities
  amenities: string[];

  // Media
  images: string[];
  virtualTourUrl?: string;

  // Listing Info
  listDate: string;
  daysOnMarket: number;
  mlsNumber: string;

  // Agent
  agentId?: string;

  // Flags
  featured: boolean;
  newListing: boolean;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  city?: string;
  amenities?: string[];
  squareFeetMin?: number;
  squareFeetMax?: number;
  status?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

// Bridge API Property Structure
export interface BridgeProperty {
  ListingId: string;
  ListPrice: number;
  StandardStatus: string;
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  LivingArea: number;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  Latitude: number;
  Longitude: number;
  PublicRemarks: string;
  Media: BridgeMedia[];
  PropertyType: string;
  ListingContractDate: string;
  DaysOnMarket: number;
}

export interface BridgeMedia {
  MediaURL: string;
  MediaCategory: string;
  MediaKey: string;
  Order: number;
}

// SimplyRETS Property Structure
export interface SimplyRETSProperty {
  mlsId: number;
  listingId: string;
  listPrice: number;
  listDate: string;
  address: {
    full: string;
    streetNumber: number;
    streetName: string;
    unit?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  property: {
    bedrooms: number;
    bathsFull: number;
    bathsHalf: number;
    area: number;
    type: string;
    subType?: string;
    style: string;
    yearBuilt?: number;
    stories?: number;
    garageSpaces?: number;
    pool?: string;
    heating?: string;
    cooling?: string;
    fireplaces?: number;
  };
  geo: {
    lat: number;
    lng: number;
  };
  photos: string[];
  agent: {
    firstName: string;
    lastName: string;
    id: string;
    contact?: {
      email: string;
      office: string;
      cell: string;
    };
  };
  mls: {
    status: string;
    statusText: string;
    daysOnMarket: number;
    area: string;
  };
  remarks: string;
}
