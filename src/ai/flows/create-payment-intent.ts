'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe Payment Intent.
 * This flow takes a booking ID and amount, calculates the amount in cents,
 * and creates a payment intent with Stripe.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables.
// This should NOT be exposed on the client.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export const CreatePaymentIntentInputSchema = z.object({
  bookingId: z.string().describe('The unique identifier for the booking.'),
  amount: z.number().describe('The payment amount in dollars.'),
});
export type CreatePaymentIntentInput = z.infer<
  typeof CreatePaymentIntentInputSchema
>;

export const CreatePaymentIntentOutputSchema = z.object({
  clientSecret: z.string().describe('The client secret for the Payment Intent.'),
});
export type CreatePaymentIntentOutput = z.infer<
  typeof CreatePaymentIntentOutputSchema
>;

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<CreatePaymentIntentOutput> {
  return createPaymentIntentFlow(input);
}

const createPaymentIntentFlow = ai.defineFlow(
  {
    name: 'createPaymentIntentFlow',
    inputSchema: CreatePaymentIntentInputSchema,
    outputSchema: CreatePaymentIntentOutputSchema,
  },
  async ({ amount, bookingId }) => {
    // Stripe requires the amount in the smallest currency unit (e.g., cents for USD).
    const amountInCents = Math.round(amount * 100);

    if (amountInCents <= 0) {
      throw new Error('Amount must be greater than 0.');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        // In the future, we can add customer and metadata information.
        metadata: { bookingId },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent: Client secret is missing.');
      }

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error('Error creating Stripe Payment Intent:', error);
      throw new Error(`Stripe API error: ${error.message}`);
    }
  }
);
