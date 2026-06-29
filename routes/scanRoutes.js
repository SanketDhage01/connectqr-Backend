import express from 'express';
import { getPublicVehicleDetails, submitContactForm } from '../controllers/scanController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { contactRules } from '../validators/messageValidator.js';
import { validate } from '../validators/authValidator.js';

const router = express.Router();

router.get('/details/:qrCodeId', getPublicVehicleDetails);
router.post(
  '/contact/:qrCodeId', 
  contactLimiter, 
  upload.single('imageAttachment'), 
  contactRules, 
  validate, 
  submitContactForm
);

export default router;
