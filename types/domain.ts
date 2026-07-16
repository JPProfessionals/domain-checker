// types.ts

export interface DomainResult {
  id?: string;
  available: boolean;
  domain: string;
  currency?: string;
  definitive?: boolean;
  period?: number;
  price?: number;
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

