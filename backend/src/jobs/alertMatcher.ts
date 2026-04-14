import { alertService, searchService, notificationService } from '../services';
import { SearchParams } from '../adapters';

/**
 * Background job that checks all active alerts and sends notifications
 */
export async function startAlertMatcher() {
  // Run immediately, then every hour
  await checkAndMatchAlerts();
  
  setInterval(async () => {
    try {
      await checkAndMatchAlerts();
    } catch (error) {
      console.error('Alert matcher error:', error);
    }
  }, 60 * 60 * 1000); // Every hour
}

/**
 * Check all active alerts and find matches
 */
async function checkAndMatchAlerts() {
  console.log('⏰ Checking active alerts...');
  
  try {
    const alerts = await alertService.getActiveAlertsForChecking();
    console.log(`Found ${alerts.length} alerts to check`);

    for (const alert of alerts) {
      try {
        await processAlert(alert);
        await alertService.markAlertChecked(alert.id);
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
}

/**
 * Process a single alert
 */
async function processAlert(alert: any) {
  const user = alert.user;

  // Get notification preferences
  const settings = await alertService.getUserNotificationSettings(user.id);
  if (!settings?.notificationsEnabled || !settings?.phoneNumber) {
    return; // User doesn't want notifications
  }

  // Perform search for this alert
  const searchParams: SearchParams = {
    departureAirport: alert.departureAirport,
    arrivalAirport: alert.arrivalAirport,
    startDate: alert.startDate,
    endDate: alert.endDate,
    cabinClasses: alert.cabinClasses,
  };

  try {
    const result = await searchService.search(
      alert.departureAirport,
      alert.arrivalAirport,
      alert.startDate,
      alert.endDate,
      alert.cabinClasses,
      alert.airlines,
      alert.maxMilesCost
    );

    console.log(`Alert ${alert.id}: Found ${result.totalResults} results`);

    // Parse results and check for matches
    for (const result of result.results) {
      const isDuplicate = await alertService.matchExists(
        alert.id,
        result.airline,
        result.departureDate,
        result.cabinClass,
        result.milesCost
      );

      if (!isDuplicate) {
        // Add to matches
        await alertService.addMatch(
          alert.id,
          user.id,
          result.airline,
          result.departureDate,
          result.cabinClass,
          result.milesCost
        );

        // Send SMS notification (with cooldown check)
        const lastNotification = await getLastNotificationTime(alert.id);
        const cooldownMs = (settings.alertCooldownMinutes || 30) * 60 * 1000;
        
        if (!lastNotification || Date.now() - lastNotification > cooldownMs) {
          const sent = await notificationService.sendAlertNotification(
            settings.phoneNumber,
            alert.departureAirport,
            alert.arrivalAirport,
            result.airline,
            result.cabinClass,
            result.departureDate.toISOString().split('T')[0],
            result.milesCost
          );

          if (sent) {
            // Mark notification as sent
            // TODO: Add notification tracking to db
            console.log(`✅ Notification sent for alert ${alert.id}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error searching for alert ${alert.id}:`, error);
  }
}

/**
 * Get last notification time for an alert (placeholder - would track in DB)
 */
async function getLastNotificationTime(alertId: string): Promise<number | null> {
  // TODO: Track last notification time in alertMatch table
  return null;
}
