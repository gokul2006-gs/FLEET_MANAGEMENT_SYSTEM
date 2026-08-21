import { Router } from 'express';
import {
  createRoute, getRoutes, getRoute, updateRoute, deleteRoute,
  publishRoute, reorderStops, getRouteStats
} from '../controllers/routeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createRoute);
router.get('/', getRoutes);
router.get('/stats', getRouteStats);
router.get('/:id', getRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);
router.post('/:id/publish', publishRoute);
router.put('/:id/reorder', reorderStops);

export default router;
