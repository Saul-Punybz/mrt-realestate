import type { Property, SimplyRETSProperty, PropertyFilters, PropertySearchResult } from '../types/property';

const SIMPLYRETS_API_URL = import.meta.env.SIMPLYRETS_API_URL || 'https://api.simplyrets.com';
const SIMPLYRETS_USERNAME = import.meta.env.SIMPLYRETS_USERNAME || '';
const SIMPLYRETS_PASSWORD = import.meta.env.SIMPLYRETS_PASSWORD || '';

/**
 * SimplyRETS API Client for fetching MLS listings
 */
export class SimplyRETSClient {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = SIMPLYRETS_API_URL;
    this.authHeader = 'Basic ' + btoa(`${SIMPLYRETS_USERNAME}:${SIMPLYRETS_PASSWORD}`);
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SimplyRETS API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Transform SimplyRETS property to internal Property format
   */
  private transformProperty(srProperty: SimplyRETSProperty): Property {
    return {
      id: srProperty.mlsId.toString(),
      listingId: srProperty.listingId || srProperty.mlsId.toString(),
      slug: this.generateSlug(srProperty),
      title: srProperty.address?.full || `Propiedad en ${srProperty.address?.city}`,
      description: srProperty.remarks || '',
      price: srProperty.listPrice,
      status: srProperty.mls?.status || 'Active',
      propertyType: this.mapPropertyType(srProperty.property?.type),
      address: {
        street: srProperty.address?.streetNumber
          ? `${srProperty.address.streetNumber} ${srProperty.address.streetName || ''}`
          : srProperty.address?.full || '',
        city: srProperty.address?.city || '',
        state: srProperty.address?.state || 'PR',
        zip: srProperty.address?.postalCode || '',
        full: srProperty.address?.full || '',
      },
      latitude: srProperty.geo?.lat || 0,
      longitude: srProperty.geo?.lng || 0,
      bedrooms: srProperty.property?.bedrooms || 0,
      bathrooms: srProperty.property?.bathsFull || 0,
      squareFeet: srProperty.property?.area || 0,
      lotSize: srProperty.property?.lotSize,
      yearBuilt: srProperty.property?.yearBuilt,
      amenities: this.extractAmenities(srProperty),
      images: srProperty.photos || [],
      listDate: srProperty.listDate || '',
      daysOnMarket: srProperty.mls?.daysOnMarket || 0,
      mlsNumber: srProperty.mlsId.toString(),
      featured: false,
      newListing: (srProperty.mls?.daysOnMarket || 0) <= 7,
    };
  }

  private generateSlug(property: SimplyRETSProperty): string {
    const parts = [
      property.property?.type?.toLowerCase(),
      property.address?.city?.toLowerCase(),
      property.mlsId,
    ].filter(Boolean);

    return parts.join('-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  private mapPropertyType(type?: string): string {
    if (!type) return 'Casa';

    const mapping: Record<string, string> = {
      'residential': 'Casa',
      'single family': 'Casa',
      'condo': 'Apartamento',
      'condominium': 'Apartamento',
      'apartment': 'Apartamento',
      'townhouse': 'Casa',
      'villa': 'Villa',
      'land': 'Terreno',
      'commercial': 'Comercial',
    };
    return mapping[type.toLowerCase()] || type;
  }

  private extractAmenities(property: SimplyRETSProperty): string[] {
    const amenities: string[] = [];
    const features = property.property;

    if (features?.pool) amenities.push('Piscina');
    if (features?.parking?.spaces && features.parking.spaces > 0) amenities.push('Estacionamiento');
    if (features?.cooling?.includes('Central')) amenities.push('A/C Central');
    if (property.address?.city?.toLowerCase().includes('beach') ||
        property.address?.city?.toLowerCase().includes('ocean')) {
      amenities.push('Vista al Mar');
    }

    return amenities;
  }

  /**
   * Search properties with filters
   */
  async searchProperties(filters: PropertyFilters, page = 1, limit = 20): Promise<PropertySearchResult> {
    const params: Record<string, string | number | boolean> = {
      limit,
      offset: (page - 1) * limit,
      status: 'active',
    };

    // Apply filters
    if (filters.minPrice) {
      params.minprice = filters.minPrice;
    }
    if (filters.maxPrice) {
      params.maxprice = filters.maxPrice;
    }
    if (filters.bedrooms) {
      params.minbeds = filters.bedrooms;
    }
    if (filters.bathrooms) {
      params.minbaths = filters.bathrooms;
    }
    if (filters.city) {
      params.cities = filters.city;
    }
    if (filters.propertyType?.length) {
      params.type = filters.propertyType[0].toLowerCase();
    }

    try {
      const properties = await this.fetch<SimplyRETSProperty[]>('/properties', params);

      // SimplyRETS doesn't return total count in listing response
      // We'll estimate based on returned results
      const hasMore = properties.length === limit;

      return {
        properties: properties.map(p => this.transformProperty(p)),
        total: hasMore ? (page * limit) + 1 : (page - 1) * limit + properties.length,
        page,
        totalPages: hasMore ? page + 1 : page,
        hasNextPage: hasMore,
      };
    } catch (error) {
      console.error('Error fetching properties from SimplyRETS:', error);
      throw error;
    }
  }

  /**
   * Get a single property by MLS ID
   */
  async getProperty(mlsId: string): Promise<Property | null> {
    try {
      const property = await this.fetch<SimplyRETSProperty>(`/properties/${mlsId}`);
      return this.transformProperty(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * Get featured properties (high-value listings)
   */
  async getFeaturedProperties(limit = 6): Promise<Property[]> {
    const params = {
      limit,
      minprice: 500000,
      status: 'active',
      sort: '-listprice',
    };

    try {
      const properties = await this.fetch<SimplyRETSProperty[]>('/properties', params);
      return properties.map(p => ({
        ...this.transformProperty(p),
        featured: true,
      }));
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  /**
   * Get new listings
   */
  async getNewListings(limit = 6): Promise<Property[]> {
    const params = {
      limit,
      status: 'active',
      sort: '-listdate',
    };

    try {
      const properties = await this.fetch<SimplyRETSProperty[]>('/properties', params);
      return properties
        .filter(p => (p.mls?.daysOnMarket || 0) <= 7)
        .map(p => ({
          ...this.transformProperty(p),
          newListing: true,
        }));
    } catch (error) {
      console.error('Error fetching new listings:', error);
      return [];
    }
  }

  /**
   * Search properties by location (geo search)
   */
  async searchByLocation(
    lat: number,
    lng: number,
    radiusMiles = 10,
    filters?: PropertyFilters
  ): Promise<Property[]> {
    const params: Record<string, string | number | boolean> = {
      'points': `${lat},${lng}`,
      'radius': radiusMiles,
      'status': 'active',
      'limit': 50,
    };

    if (filters?.minPrice) params.minprice = filters.minPrice;
    if (filters?.maxPrice) params.maxprice = filters.maxPrice;
    if (filters?.bedrooms) params.minbeds = filters.bedrooms;

    try {
      const properties = await this.fetch<SimplyRETSProperty[]>('/properties', params);
      return properties.map(p => this.transformProperty(p));
    } catch (error) {
      console.error('Error searching by location:', error);
      return [];
    }
  }
}

// Export singleton instance
export const simplyRets = new SimplyRETSClient();
