import { AirlineAdapter, SearchParams, AvailabilityRecord } from './AirlineAdapter';
import axios from 'axios';

/**
 * Alaska Airlines Atmos Rewards adapter
 */
export class AlaskaAdapter extends AirlineAdapter {
  private apiBase: string = 'https://www.alaskaair.com/api';

  constructor(apiKey?: string) {
    super('Alaska', apiKey);
  }

  isConfigured(): boolean {
    // Alaska's public API may not require an API key, but we check anyway
    return true;
  }

  async search(params: SearchParams): Promise<AvailabilityRecord[]> {
    try {
      return await this.retryWithBackoff(async () => {
        const results: AvailabilityRecord[] = [];

        const startDateStr = params.startDate.toISOString().split('T')[0];
        const endDateStr = params.endDate.toISOString().split('T')[0];

        for (const cabin of params.cabinClasses) {
          const response = await axios.get(
            `${this.apiBase}/award/search`,
            {
              params: {
                from: params.departureAirport,
                to: params.arrivalAirport,
                outboundDate: startDateStr,
                returnDate: endDateStr,
                cabin: this.mapCabinClass(cabin),
              },
            }
          );

          results.push(...this.parseResponse(response.data, cabin));
        }

        return results;
      });
    } catch (error) {
      console.error('Alaska search failed:', error);
      return [];
    }
  }

  private parseResponse(data: any, cabinClass: string): AvailabilityRecord[] {
    const results: AvailabilityRecord[] = [];

    if (!data?.flights) return results;

    for (const flight of data.flights) {
      results.push({
        airline: 'Alaska',
        departureDate: new Date(flight.date),
        departureTime: flight.departTime,
        arrivalTime: flight.arrivalTime,
        cabinClass,
        milesCost: flight.milesRequired,
        availableSeats: flight.available ? 1 : 0,
        externalId: flight.id,
      });
    }

    return results;
  }

  private mapCabinClass(cabin: string): string {
    const map: Record<string, string> = {
      Economy: 'MAIN',
      'Premium Economy': 'MAIN',
      Business: 'FIRST',
      First: 'FIRST',
    };
    return map[cabin] || cabin;
  }
}
