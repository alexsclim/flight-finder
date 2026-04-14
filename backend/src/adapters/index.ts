export { AirlineAdapter, SearchParams, AvailabilityRecord } from './AirlineAdapter';
export { UnitedAdapter } from './UnitedAdapter';
export { AlaskaAdapter } from './AlaskaAdapter';

// Registry of all available adapters
import { AirlineAdapter } from './AirlineAdapter';
import { UnitedAdapter } from './UnitedAdapter';
import { AlaskaAdapter } from './AlaskaAdapter';

export const ADAPTER_REGISTRY: Record<string, typeof AirlineAdapter> = {
  United: UnitedAdapter,
  Alaska: AlaskaAdapter,
  // Add more adapters here as they're implemented
};

export function getAdapter(airline: string, apiKey?: string): AirlineAdapter | null {
  const AdapterClass = ADAPTER_REGISTRY[airline];
  if (!AdapterClass) return null;
  return new AdapterClass(apiKey);
}

export function getAvailableAdapters(): string[] {
  return Object.keys(ADAPTER_REGISTRY);
}
