import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * AlertService handles CRUD operations for alerts
 */
export class AlertService {
  /**
   * Create a new alert
   */
  async createAlert(
    userId: string,
    departureAirport: string,
    arrivalAirport: string,
    startDate: Date,
    endDate: Date,
    cabinClasses: string[],
    airlines: string[],
    maxMilesCost?: number
  ) {
    return prisma.alert.create({
      data: {
        userId,
        departureAirport,
        arrivalAirport,
        startDate,
        endDate,
        cabinClasses,
        airlines,
        maxMilesCost,
        active: true,
      },
    });
  }

  /**
   * Get user's active alerts
   */
  async getUserAlerts(userId: string) {
    return prisma.alert.findMany({
      where: { userId, active: true },
      include: {
        _count: {
          select: { matches: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single alert with recent matches
   */
  async getAlertWithMatches(alertId: string, limit: number = 20) {
    return prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        matches: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });
  }

  /**
   * Update alert
   */
  async updateAlert(
    alertId: string,
    data: {
      startDate?: Date;
      endDate?: Date;
      cabinClasses?: string[];
      airlines?: string[];
      maxMilesCost?: number | null;
      active?: boolean;
    }
  ) {
    return prisma.alert.update({
      where: { id: alertId },
      data,
    });
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string) {
    return prisma.alert.delete({
      where: { id: alertId },
    });
  }

  /**
   * Get all active alerts that need to be checked
   */
  async getActiveAlertsForChecking() {
    return prisma.alert.findMany({
      where: {
        active: true,
        OR: [
          { lastChecked: null },
          { lastChecked: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) } }, // Last checked > 2 hours ago
        ],
      },
      include: { user: true },
    });
  }

  /**
   * Mark alert as checked
   */
  async markAlertChecked(alertId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: { lastChecked: new Date() },
    });
  }

  /**
   * Add match to alert
   */
  async addMatch(
    alertId: string,
    userId: string,
    airline: string,
    departureDate: Date,
    cabinClass: string,
    milesCost: number
  ) {
    return prisma.alertMatch.create({
      data: {
        alertId,
        userId,
        airline,
        departureDate,
        cabinClass,
        milesCost,
      },
    });
  }

  /**
   * Check if this exact match already exists (to avoid duplicates)
   */
  async matchExists(
    alertId: string,
    airline: string,
    departureDate: Date,
    cabinClass: string,
    milesCost: number
  ) {
    const dayStart = new Date(departureDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(departureDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.alertMatch.findFirst({
      where: {
        alertId,
        airline,
        cabinClass,
        milesCost,
        departureDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    return !!existing;
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationSettings(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        phoneNumber: true,
        notificationsEnabled: true,
        alertCooldownMinutes: true,
      },
    });
  }
}

export const alertService = new AlertService();
