// types.ts

export interface DomainResult {
  id?: string;
  available: boolean,
  currency: string,
  definitive: boolean,
  domain: string,
  period: number,
  price: number
}

export interface DomainsResult{
  domains: DomainResult[]
}

export interface DomainError {
  code: string;
  domain: string;
  message: string;
  path: string;
  status: 0;
}

// API Request/Response types
export interface TldApiResponse {
  data: Array<{ name: string }>;
}

export interface GetTldsRequestBody {
  input?: string;
  pageSize?: number;
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