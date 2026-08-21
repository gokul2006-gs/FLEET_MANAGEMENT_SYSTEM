import { Router } from 'express';
import { body } from 'express-validator';
import {
  createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle, getVehicleStats
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post('/', [
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be positive')
], validate, createVehicle);

router.get('/', getVehicles);
router.get('/stats', getVehicleStats);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
