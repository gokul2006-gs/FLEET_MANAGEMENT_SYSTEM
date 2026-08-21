import { Router } from 'express';
import {
  runRouteOptimization, runBenchmark, compareAlgorithms
} from '../controllers/optimizationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/optimize', runRouteOptimization);
router.get('/benchmark', runBenchmark);
router.post('/compare', compareAlgorithms);

export default router;
