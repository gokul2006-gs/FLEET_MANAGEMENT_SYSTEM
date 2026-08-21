import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder, getOrders, getOrder, updateOrder, deleteOrder, bulkAssignOrders
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post('/', [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('packageWeight').isFloat({ min: 0 }).withMessage('Package weight must be positive')
], validate, createOrder);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.post('/bulk-assign', bulkAssignOrders);

export default router;
