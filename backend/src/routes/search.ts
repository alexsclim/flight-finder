import { Router, Request, Response } from 'express';
import { searchService } from '../services';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/search - Perform an award search
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      departureAirport,
      arrivalAirport,
      startDate,
      endDate,
      cabinClasses,
      airlines,
      maxMilesCost,
    } = req.body;

    // Validate required fields
    if (!departureAirport || !arrivalAirport || !startDate || !endDate || !cabinClasses || !airlines) {
      return res.status(400).json({
        error: 'Missing required fields: departureAirport, arrivalAirport, startDate, endDate, cabinClasses, airlines',
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }

    // Perform search
    const result = await searchService.search(
      departureAirport,
      arrivalAirport,
      start,
      end,
      cabinClasses,
      airlines,
      maxMilesCost,
      (req as any).user?.id // user ID if authenticated
    );

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/search/:searchSessionId - Get previous search results
 */
router.get('/:searchSessionId', async (req: Request, res: Response) => {
  try {
    const { searchSessionId } = req.params;

    const result = await searchService.getSearchResults(searchSessionId);
    res.json(result);
  } catch (error) {
    console.error('Get search error:', error);
    res.status(404).json({ error: 'Search session not found' });
  }
});

/**
 * GET /api/search/history/user - Get user's search history
 */
router.get('/history/user', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const history = await searchService.getUserSearchHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

export default router;
