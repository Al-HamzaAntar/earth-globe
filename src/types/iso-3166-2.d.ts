declare module "iso-3166-2" {
  export interface Subdivision {
    type: string;
    name: string;
  }
  export interface CountryEntry {
    name: string;
    code: string;
    sub: Record<string, Subdivision>;
  }
  export function country(codeOrName: string): CountryEntry | null;
  export function subdivision(code: string, sub?: string): unknown;
  const iso3166: {
    country: typeof country;
    subdivision: typeof subdivision;
  };
  export default iso3166;
}
