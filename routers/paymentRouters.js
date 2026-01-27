import express from 'express';
import { 
  createPaymentIntent, 
  createCheckoutSession, 
  retrievePaymentIntent,
  retrieveCheckoutSession,
  handleWebhook,
  getStripePublicKey
} from '../controllers/paymentController.js';
import { protectedRoute } from '../controllers/userController.js';

const router = express.Router();

// Get Stripe public key (for frontend initialization)
router.route('/config')
  .get(getStripePublicKey);

// Create payment intent (for card payment)
router.route('/payment-intent')
  .post(protectedRoute, createPaymentIntent);

// Create checkout session (for Stripe hosted checkout)
router.route('/checkout-session')
  .post(protectedRoute, createCheckoutSession);

// Retrieve payment intent status
router.route('/payment-intent/:paymentIntentId')
  .get(protectedRoute, retrievePaymentIntent);

// Retrieve checkout session status
router.route('/checkout-session/:sessionId')
  .get(protectedRoute, retrieveCheckoutSession);

// Webhook for payment updates (no auth required for webhooks)
router.route('/webhook')
  .post(handleWebhook);

export default router;
