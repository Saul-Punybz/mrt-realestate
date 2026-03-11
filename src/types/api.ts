export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Contact Form Data
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  source?: string;
}

// Property Inquiry Data
export interface PropertyInquiryData {
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  preApproved?: boolean;
  timeline?: string;
}

// Sell Property Form Data
export interface SellPropertyFormData {
  ownerName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  askingPrice?: number;
  reason?: string;
  timeline?: string;
  additionalInfo?: string;
}

// Calculator Results
export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPaymentAmount: number;
  loanAmount: number;
}

export interface ROIResult {
  annualROI: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
