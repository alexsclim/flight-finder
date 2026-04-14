import { Router, Request, Response } from 'express';
import { alertService } from '../services';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/alerts - Create a new alert
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      departureAirport,
      arrivalAirport,
      startDate,
      endDate,
      cabinClasses,
      airlines,
      maxMilesCost,
    } = req.body;

    // Validate
    if (!departureAirport || !arrivalAirport || !startDate || !endDate || !cabinClasses || !airlines) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alert = await alertService.createAlert(
      userId,
      departureAirport,
      arrivalAirport,
      new Date(startDate),
      new Date(endDate),
      cabinClasses,
      airlines,
      maxMilesCost
    );

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * GET /api/alerts - Get all user alerts
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const alerts = await alertService.getUserAlerts(userId);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

/**
 * GET /api/alerts/:alertId - Get alert with recent matches
 */
router.get('/:alertId', authenticate, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = await alertService.getAlertWithMatches(alertId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Verify user owns this alert
    if (alert.userId !== (req as any).user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to get alert' });
  }
});

/**
 * PATCH /api/alerts/:alertId - Update alert
 */
router.patch('/:alertId', authenticate, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = await alertService.getAlertWithMatches(alertId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.userId !== (req as any).user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await alertService.updateAlert(alertId, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * DELETE /api/alerts/:alertId - Delete alert
 */
router.delete('/:alertId', authenticate, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = await alertService.getAlertWithMatches(alertId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.userId !== (req as any).user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await alertService.deleteAlert(alertId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
