// types.ts

export interface DomainResult {
  id?: string;
  available: boolean;
  currency: string;
  definitive: boolean;
  domain: string;
  period: number;
  price: number;
}

export interface DomainsResult {
  domains: DomainResult[];
}

export interface DomainError {
  code: string;
  domain: string;
  message: string;
  path: string;
  status: 0;
}

// TLD Types
export type TldType = 'GENERIC' | 'COUNTRY_CODE';

export interface Tld {
  name: string;
  type: TldType;
}

export interface TldData {
  tlds: Tld[];
  lastUpdated: string;
  totalCount: number;
}

// API Request/Response types (Legacy - will be removed when Directus is removed)
export interface TldApiResponse {
  data: Array<{ name: string }>;
}

export interface GetTldsRequestBody {
  input?: string;
  pageSize?: number;
  type?: TldType; // Filter by TLD type
}

export interface CheckDomainsRequestBody {
  domain: string;
  tlds?: string[];
}

export interface GoDaddyApiError {
  response?: {
    data?: unknown;
  };
}