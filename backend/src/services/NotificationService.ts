import twilio from 'twilio';

/**
 * NotificationService handles sending SMS alerts
 */
export class NotificationService {
  private twilio: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.twilio = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER!;
  }

  /**
   * Send SMS notification for an award match
   */
  async sendAlertNotification(
    toNumber: string,
    departureAirport: string,
    arrivalAirport: string,
    airline: string,
    cabinClass: string,
    departureDate: string,
    milesCost: number
  ): Promise<boolean> {
    try {
      const message = this.formatAlertMessage(
        departureAirport,
        arrivalAirport,
        airline,
        cabinClass,
        departureDate,
        milesCost
      );

      await this.twilio.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber,
      });

      console.log(`SMS sent to ${toNumber}: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Format alert message for SMS
   */
  private formatAlertMessage(
    from: string,
    to: string,
    airline: string,
    cabin: string,
    date: string,
    miles: number
  ): string {
    // SMS has 160 char limit, so keep it concise
    return `✈️ Award found! ${from}→${to} on ${date} ${cabin} • ${miles}k miles • ${airline}`;
  }

  /**
   * Send test notification
   */
  async sendTestNotification(toNumber: string): Promise<boolean> {
    try {
      await this.twilio.messages.create({
        body: '✈️ Award Alerts test notification - if you received this, everything works!',
        from: this.fromNumber,
        to: toNumber,
      });
      return true;
    } catch (error) {
      console.error('Failed to send test SMS:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
