import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDriver, getDrivers, getDriver, updateDriver, deleteDriver
} from '../controllers/driverController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required')
], validate, createDriver);

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
