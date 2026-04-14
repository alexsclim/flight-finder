import { PrismaClient } from '@prisma/client';
import { getAdapter, SearchParams, AvailabilityRecord } from '../adapters';

const prisma = new PrismaClient();

/**
 * SearchService handles on-demand award searches
 */
export class SearchService {
  /**
   * Perform a multi-airline search
   */
  async search(
    departureAirport: string,
    arrivalAirport: string,
    startDate: Date,
    endDate: Date,
    cabinClasses: string[],
    airlines: string[],
    maxMilesCost?: number,
    userId?: string
  ) {
    // Create search session
    const searchSession = await prisma.searchSession.create({
      data: {
        departureAirport,
        arrivalAirport,
        startDate,
        endDate,
        cabinClasses,
        airlines,
        maxMilesCost,
        userId,
      },
    });

    // Search in parallel across airlines
    const searchParams: SearchParams = {
      departureAirport,
      arrivalAirport,
      startDate,
      endDate,
      cabinClasses,
    };

    const results = await Promise.allSettled(
      airlines.map(airline => this.searchAirline(airline, searchParams))
    );

    // Flatten and normalize results
    const allResults: AvailabilityRecord[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        console.error('Search failed for airline:', result.reason);
      }
    });

    // Filter by maxMilesCost if specified
    let filtered = allResults;
    if (maxMilesCost) {
      filtered = allResults.filter(r => r.milesCost <= maxMilesCost);
    }

    // Save results to database
    const savedResults = await Promise.all(
      filtered.map(result =>
        prisma.availabilityResult.create({
          data: {
            searchSessionId: searchSession.id,
            airline: result.airline,
            departureDate: result.departureDate,
            departureTime: result.departureTime,
            arrivalTime: result.arrivalTime,
            cabinClass: result.cabinClass,
            milesCost: result.milesCost,
            availableSeats: result.availableSeats,
            externalId: result.externalId,
          },
        })
      )
    );

    return {
      searchSessionId: searchSession.id,
      results: savedResults,
      totalResults: savedResults.length,
    };
  }

  /**
   * Search a single airline
   */
  private async searchAirline(
    airline: string,
    params: SearchParams
  ): Promise<AvailabilityRecord[]> {
    try {
      const adapter = getAdapter(airline);
      if (!adapter) {
        console.warn(`No adapter found for airline: ${airline}`);
        return [];
      }

      return await adapter.search(params);
    } catch (error) {
      console.error(`Error searching ${airline}:`, error);
      return [];
    }
  }

  /**
   * Get previous search results (cached for 30 minutes)
   */
  async getSearchResults(searchSessionId: string) {
    const session = await prisma.searchSession.findUnique({
      where: { id: searchSessionId },
      include: {
        results: {
          orderBy: [{ departureDate: 'asc' }, { milesCost: 'asc' }],
        },
      },
    });

    if (!session) {
      throw new Error('Search session not found');
    }

    return {
      session: {
        id: session.id,
        departureAirport: session.departureAirport,
        arrivalAirport: session.arrivalAirport,
        startDate: session.startDate,
        endDate: session.endDate,
        cabinClasses: session.cabinClasses,
        airlines: session.airlines,
        createdAt: session.createdAt,
      },
      results: session.results,
    };
  }

  /**
   * Get user's search history
   */
  async getUserSearchHistory(userId: string, limit: number = 10) {
    return prisma.searchSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { results: true },
        },
      },
    });
  }
}

export const searchService = new SearchService();
