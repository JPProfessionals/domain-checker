// types.ts

export interface DomainResult {
  id?: string;
  available: boolean,
  currency: string,
  definitive: boolean,
  domain: string,
  period: int,
  price: int
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
