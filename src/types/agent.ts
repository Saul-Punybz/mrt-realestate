export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile?: string;
  photo?: string;
  bio?: string;
  title?: string;
  license?: string;

  // Social Media
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };

  // Stats
  totalListings?: number;
  totalSales?: number;
  yearsExperience?: number;

  // Languages
  languages?: string[];

  // Specialties
  specialties?: string[];
}

export interface AgentContact {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  source: 'website' | 'whatsapp' | 'email';
  createdAt: string;
}
