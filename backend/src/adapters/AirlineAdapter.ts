/**
 * Base class for airline adapters.
 * All airline-specific implementations should extend this class.
 */

export interface SearchParams {
  departureAirport: string;
  arrivalAirport: string;
  startDate: Date;
  endDate: Date;
  cabinClasses: string[];
}

export interface AvailabilityRecord {
  airline: string;
  departureDate: Date;
  departureTime?: string;
  arrivalTime?: string;
  cabinClass: string;
  milesCost: number;
  availableSeats: number; // -1 = unknown, 0 = not available, >0 = available
  externalId?: string;
}

export abstract class AirlineAdapter {
  protected airline: string;
  protected apiKey?: string;

  constructor(airline: string, apiKey?: string) {
    this.airline = airline;
    this.apiKey = apiKey;
  }

  /**
   * Search for award availability
   */
  abstract search(params: SearchParams): Promise<AvailabilityRecord[]>;

  /**
   * Check if adapter is properly configured
   */
  abstract isConfigured(): boolean;

  /**
   * Get adapter name
   */
  getName(): string {
    return this.airline;
  }

  /**
   * Handle API rate limiting and retries
   */
  protected shouldRetry(error: any): boolean {
    return error?.status === 429 || error?.code === 'RATE_LIMITED';
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (!this.shouldRetry(error) || i === maxRetries - 1) {
          throw error;
        }
        const delay = Math.pow(2, i) * 1000; // exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}
