import type { Property, BridgeProperty, PropertyFilters, PropertySearchResult } from '../types/property';

const BRIDGE_API_URL = import.meta.env.BRIDGE_API_URL || 'https://api.bridgedataoutput.com/api/v2';
const BRIDGE_API_KEY = import.meta.env.BRIDGE_API_KEY || '';
const BRIDGE_DATASET_ID = import.meta.env.BRIDGE_DATASET_ID || '';

interface BridgeApiResponse<T> {
  bundle: T[];
  total: number;
  '@odata.nextLink'?: string;
}

/**
 * Bridge API Client for fetching MLS listings
 */
export class BridgeApiClient {
  private baseUrl: string;
  private apiKey: string;
  private datasetId: string;

  constructor() {
    this.baseUrl = BRIDGE_API_URL;
    this.apiKey = BRIDGE_API_KEY;
    this.datasetId = BRIDGE_DATASET_ID;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}/${this.datasetId}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bridge API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Transform Bridge API property to internal Property format
   */
  private transformProperty(bridgeProperty: BridgeProperty): Property {
    return {
      id: bridgeProperty.ListingId,
      listingId: bridgeProperty.ListingId,
      slug: this.generateSlug(bridgeProperty),
      title: bridgeProperty.UnparsedAddress || `${bridgeProperty.PropertyType} en ${bridgeProperty.City}`,
      description: bridgeProperty.PublicRemarks || '',
      price: bridgeProperty.ListPrice,
      status: bridgeProperty.StandardStatus,
      propertyType: this.mapPropertyType(bridgeProperty.PropertyType),
      address: {
        street: bridgeProperty.StreetNumber
          ? `${bridgeProperty.StreetNumber} ${bridgeProperty.StreetName || ''}`
          : bridgeProperty.UnparsedAddress || '',
        city: bridgeProperty.City,
        state: bridgeProperty.StateOrProvince,
        zip: bridgeProperty.PostalCode,
        full: bridgeProperty.UnparsedAddress || '',
      },
      latitude: bridgeProperty.Latitude,
      longitude: bridgeProperty.Longitude,
      bedrooms: bridgeProperty.BedroomsTotal,
      bathrooms: bridgeProperty.BathroomsTotalInteger,
      squareFeet: bridgeProperty.LivingArea,
      lotSize: bridgeProperty.LotSizeSquareFeet,
      yearBuilt: bridgeProperty.YearBuilt,
      amenities: this.extractAmenities(bridgeProperty),
      images: bridgeProperty.Media?.map(m => m.MediaURL) || [],
      listDate: bridgeProperty.ListingContractDate,
      daysOnMarket: bridgeProperty.DaysOnMarket,
      mlsNumber: bridgeProperty.ListingId,
      featured: false,
      newListing: bridgeProperty.DaysOnMarket <= 7,
    };
  }

  private generateSlug(property: BridgeProperty): string {
    const parts = [
      property.PropertyType?.toLowerCase(),
      property.City?.toLowerCase(),
      property.ListingId,
    ].filter(Boolean);

    return parts.join('-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  private mapPropertyType(type: string): string {
    const mapping: Record<string, string> = {
      'Residential': 'Casa',
      'Single Family Residence': 'Casa',
      'Condominium': 'Apartamento',
      'Condo': 'Apartamento',
      'Apartment': 'Apartamento',
      'Townhouse': 'Casa',
      'Villa': 'Villa',
      'Land': 'Terreno',
      'Commercial': 'Comercial',
    };
    return mapping[type] || type;
  }

  private extractAmenities(property: BridgeProperty): string[] {
    const amenities: string[] = [];

    if (property.PoolPrivateYN) amenities.push('Piscina');
    if (property.SecurityFeatures?.length) amenities.push('Seguridad 24/7');
    if (property.ParkingTotal && property.ParkingTotal > 0) amenities.push('Estacionamiento');
    if (property.WaterfrontYN) amenities.push('Vista al Mar');
    if (property.Cooling?.includes('Central')) amenities.push('A/C Central');

    return amenities;
  }

  /**
   * Search properties with filters
   */
  async searchProperties(filters: PropertyFilters, page = 1, limit = 20): Promise<PropertySearchResult> {
    const filterParts: string[] = [];

    // Build OData filter string
    if (filters.minPrice) {
      filterParts.push(`ListPrice ge ${filters.minPrice}`);
    }
    if (filters.maxPrice) {
      filterParts.push(`ListPrice le ${filters.maxPrice}`);
    }
    if (filters.bedrooms) {
      filterParts.push(`BedroomsTotal ge ${filters.bedrooms}`);
    }
    if (filters.bathrooms) {
      filterParts.push(`BathroomsTotalInteger ge ${filters.bathrooms}`);
    }
    if (filters.city) {
      filterParts.push(`City eq '${filters.city}'`);
    }
    if (filters.propertyType?.length) {
      const typeFilter = filters.propertyType
        .map(t => `PropertyType eq '${t}'`)
        .join(' or ');
      filterParts.push(`(${typeFilter})`);
    }

    const params: Record<string, string> = {
      '$top': limit.toString(),
      '$skip': ((page - 1) * limit).toString(),
      '$orderby': 'ListingContractDate desc',
      '$select': 'ListingId,UnparsedAddress,ListPrice,StandardStatus,PropertyType,City,StateOrProvince,PostalCode,Latitude,Longitude,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeSquareFeet,YearBuilt,PublicRemarks,ListingContractDate,DaysOnMarket,Media,StreetNumber,StreetName,PoolPrivateYN,SecurityFeatures,ParkingTotal,WaterfrontYN,Cooling',
    };

    if (filterParts.length > 0) {
      params['$filter'] = filterParts.join(' and ');
    }

    try {
      const response = await this.fetch<BridgeApiResponse<BridgeProperty>>('/Property', params);

      return {
        properties: response.bundle.map(p => this.transformProperty(p)),
        total: response.total,
        page,
        totalPages: Math.ceil(response.total / limit),
        hasNextPage: !!response['@odata.nextLink'],
      };
    } catch (error) {
      console.error('Error fetching properties from Bridge API:', error);
      throw error;
    }
  }

  /**
   * Get a single property by ID
   */
  async getProperty(listingId: string): Promise<Property | null> {
    try {
      const params = {
        '$filter': `ListingId eq '${listingId}'`,
      };

      const response = await this.fetch<BridgeApiResponse<BridgeProperty>>('/Property', params);

      if (response.bundle.length === 0) {
        return null;
      }

      return this.transformProperty(response.bundle[0]);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit = 6): Promise<Property[]> {
    const params: Record<string, string> = {
      '$top': limit.toString(),
      '$orderby': 'ListPrice desc',
      '$filter': "StandardStatus eq 'Active' and ListPrice ge 500000",
    };

    try {
      const response = await this.fetch<BridgeApiResponse<BridgeProperty>>('/Property', params);
      return response.bundle.map(p => ({
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
    const params: Record<string, string> = {
      '$top': limit.toString(),
      '$orderby': 'ListingContractDate desc',
      '$filter': "StandardStatus eq 'Active' and DaysOnMarket le 7",
    };

    try {
      const response = await this.fetch<BridgeApiResponse<BridgeProperty>>('/Property', params);
      return response.bundle.map(p => ({
        ...this.transformProperty(p),
        newListing: true,
      }));
    } catch (error) {
      console.error('Error fetching new listings:', error);
      return [];
    }
  }
}

// Export singleton instance
export const bridgeApi = new BridgeApiClient();
