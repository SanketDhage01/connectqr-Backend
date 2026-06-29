import { body } from 'express-validator';

export const vehicleUpdateRules = [
  body('vehicleNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle license plate/number cannot be empty'),

  body('vehicleType')
    .optional()
    .isIn(['car', 'bike', 'truck', 'other'])
    .withMessage('Vehicle type must be car, bike, truck, or other'),

  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle brand cannot be empty'),

  body('model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle model cannot be empty'),

  body('color')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle color cannot be empty'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];
