import { AirlineAdapter, SearchParams, AvailabilityRecord } from './AirlineAdapter';
import axios from 'axios';

/**
 * United Airlines MileagePlus adapter
 * Note: This is a placeholder implementation. Real implementation would use
 * United's actual API or scraping mechanism.
 */
export class UnitedAdapter extends AirlineAdapter {
  private apiBase: string = 'https://api.united.com/v1';

  constructor(apiKey?: string) {
    super('United', apiKey);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(params: SearchParams): Promise<AvailabilityRecord[]> {
    if (!this.isConfigured()) {
      console.warn('United adapter not configured with API key');
      return [];
    }

    try {
      return await this.retryWithBackoff(async () => {
        const results: AvailabilityRecord[] = [];
        
        // Format dates for API
        const startDateStr = params.startDate.toISOString().split('T')[0];
        const endDateStr = params.endDate.toISOString().split('T')[0];

        // Search for each cabin class
        for (const cabin of params.cabinClasses) {
          const response = await axios.get(
            `${this.apiBase}/award/search`,
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
              },
              params: {
                origin: params.departureAirport,
                destination: params.arrivalAirport,
                departDate: startDateStr,
                returnDate: endDateStr,
                cabin: this.mapCabinClass(cabin),
                adults: 1,
              },
            }
          );

          results.push(...this.parseResponse(response.data, cabin));
        }

        return results;
      });
    } catch (error) {
      console.error('United search failed:', error);
      return [];
    }
  }

  private parseResponse(data: any, cabinClass: string): AvailabilityRecord[] {
    const results: AvailabilityRecord[] = [];

    if (!data?.flights) return results;

    for (const flight of data.flights) {
      results.push({
        airline: 'United',
        departureDate: new Date(flight.departDate),
        departureTime: flight.departTime,
        arrivalTime: flight.arrivalTime,
        cabinClass,
        milesCost: flight.miles,
        availableSeats: flight.availabilityStatus === 'AVAILABLE' ? 1 : 0,
        externalId: flight.flightId,
      });
    }

    return results;
  }

  private mapCabinClass(cabin: string): string {
    const map: Record<string, string> = {
      Economy: 'ECONOMY',
      'Premium Economy': 'ECONOMY_PLUS',
      Business: 'BUSINESS',
      First: 'FIRST',
    };
    return map[cabin] || cabin;
  }
}
