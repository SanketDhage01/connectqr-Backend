import express from 'express';
import { getMyVehicle, updateMyVehicle } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vehicleUpdateRules } from '../validators/vehicleValidator.js';
import { validate } from '../validators/authValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyVehicle);
router.put('/', vehicleUpdateRules, validate, updateMyVehicle);

export default router;
