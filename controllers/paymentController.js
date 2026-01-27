import Stripe from 'stripe';
import Order from '../schemas/orderSchema.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET STRIPE PUBLIC KEY
export const getStripePublicKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (err) {
    console.error('Get Public Key Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve public key',
      message: err.message,
    });
  }
};

// CREATE PAYMENT INTENT
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description, cartItems, customerEmail } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.',
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required.',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || 'Product Purchase',
      metadata: {
        userId: userId.toString(),
      },
    });

    // Create order record
    const order = new Order({
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: amount,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      paymentMethod: 'card',
      customerEmail: customerEmail || req.user.email,
    });

    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order._id,
    });
  } catch (err) {
    console.error('Payment Intent Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      message: err.message,
    });
  }
};

// CREATE CHECKOUT SESSION
export const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, customerEmail } = req.body;
    const userId = req.user._id;

    console.log('Checkout Request - Cart Items:', JSON.stringify(cartItems, null, 2));

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    console.log('Total Amount:', totalAmount);

    // Format cart items for Stripe
    const line_items = cartItems.map((item) => {
      const itemName = item.title || item.productName || item.name || 'Product';
      const itemPrice = Math.round((item.price || 0) * 100);
      const itemQuantity = item.quantity || 1;
      const productId = item._id || item.productId || item.id || 'unknown';

      console.log('Processing item:', { itemName, itemPrice, itemQuantity, productId });

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemName,
            metadata: {
              productId: productId.toString(),
            },
          },
          unit_amount: itemPrice,
        },
        quantity: itemQuantity,
      };
    });

    console.log('Line Items:', JSON.stringify(line_items, null, 2));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        userId: userId.toString(),
      },
      success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout.html`,
    });

    // Create order record
    const order = new Order({
      userId,
      items: cartItems.map((item) => ({
        productId: item._id || item.productId || item.id,
        productName: item.title || item.productName || item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      totalAmount,
      sessionId: session.id,
      status: 'pending',
      paymentMethod: 'checkout_session',
      customerEmail: customerEmail || req.user.email,
    });

    await order.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: order._id,
    });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    console.error('Error details:', {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
      raw: err.raw,
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: err.message,
      details: err.raw?.message || err.message,
    });
  }
};

// RETRIEVE PAYMENT INTENT
export const retrievePaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.status(200).json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Retrieve Payment Intent Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment intent',
      message: err.message,
    });
  }
};

// RETRIEVE CHECKOUT SESSION
export const retrieveCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      success: true,
      payment_status: session.payment_status,
      amount: session.amount_total / 100,
      currency: session.currency,
      customer_email: session.customer_email,
    });
  } catch (err) {
    console.error('Retrieve Checkout Session Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve checkout session',
      message: err.message,
    });
  }
};

// WEBHOOK FOR PAYMENT UPDATES
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('Warning: STRIPE_WEBHOOK_SECRET not configured. Webhooks may not work properly.');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    // req.body should be raw buffer from the raw body middleware
    const body = req.body instanceof Buffer ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await Order.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          {
            status: 'completed',
            receiptUrl: paymentIntent.charges.data[0]?.receipt_url || null,
          }
        );
        console.log('✓ Payment succeeded and order updated:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await Order.findOneAndUpdate(
          { paymentIntentId: failedPayment.id },
          {
            status: 'failed',
            failureReason: failedPayment.last_payment_error?.message || 'Unknown error',
          }
        );
        console.log('✗ Payment failed and order updated:', failedPayment.id);
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        await Order.findOneAndUpdate(
          { sessionId: session.id },
          {
            status: 'completed',
            stripeCustomerId: session.customer,
          }
        );
        console.log('✓ Checkout completed and order updated:', session.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    return res.status(500).json({
      error: 'Webhook error',
      message: err.message,
    });
  }
};
