import { Router } from 'express';
import { getDashboardKPIs, getRouteAnalytics, getPerformanceData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboardKPIs);
router.get('/routes', getRouteAnalytics);
router.get('/performance', getPerformanceData);

export default router;
