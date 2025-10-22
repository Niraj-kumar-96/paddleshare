// A file for storing client-side environment variables.
// DO NOT ADD SENSITIVE DATA TO THIS FILE.

// The publishable key is safe to be exposed on the client-side.
// It does not grant any special permissions and is only used to identify your Stripe account.
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(`
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. 
    Please set it in your environment variables. 
    Payments will not work until this is set.
  `);
}

// Ensure you have a .env.local file at the root of your project with the following:
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
// STRIPE_SECRET_KEY=sk_test_... (This one is for the server-side and should NOT be in this file)
