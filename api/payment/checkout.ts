// Remove top-level static import to prevent crash on load
// import DodoPayments from 'dodopayments'; 
import { getUser } from '../_utils/auth.js';
import { rateLimit } from '../_utils/rate-limit.js';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Top-level try-catch to prevent crashes returning non-JSON 500s
    try {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
        if (!apiKey) {
            console.error('Configuration Error: DODO_PAYMENTS_API_KEY is missing');
            return res.status(500).json({ error: 'Payment configuration error' });
        }

        // Dynamically import DodoPayments to catch usage errors
        let DodoPaymentsClass;
        try {
            const module = await import('dodopayments');
            DodoPaymentsClass = module.default || module;
        } catch (importError: any) {
            console.error('Failed to import dodopayments:', importError);
            return res.status(500).json({ error: 'Server dependency error: dodopayments' });
        }

        // Detect Environment
        // 1. Check explicit DODO_ENV variable
        // 2. Check for 'test_' prefix
        // 3. Default to 'live_mode' (Safe default for production keys which might lack prefix)
        const explicitEnv = process.env.DODO_ENV;
        let environment;

        if (explicitEnv === 'test_mode' || explicitEnv === 'live_mode') {
            environment = explicitEnv;
        } else if (apiKey.startsWith('test_')) {
            environment = 'test_mode';
        } else if (apiKey.startsWith('live_')) {
            environment = 'live_mode';
        } else {
            // Fallback: Assume Live Mode for unstructured keys in production
            // Log this so we can debug if it's wrong
            console.log('[Checkout] No prefix detected, defaulting to live_mode');
            environment = 'live_mode';
        }

        console.log(`[Checkout] Initializing in ${environment}`);

        const client = new DodoPaymentsClass({
            bearerToken: apiKey,
            environment: environment,
        });

        // Parse body if needed (Vercel usually handles this, but safety first)
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        if (!body) {
            return res.status(400).json({ error: 'Missing request body' });
        }

        const { plan, returnUrl, customerEmail, customerName, userId } = body;

        // Security Check
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }

        if (!userId || user.id !== userId) {
            return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
        }

        // Rate Limit (Strict for payments: 5 per minute)
        if (!rateLimit(user.id, 5, 60000)) {
            return res.status(429).json({ error: 'Too many payment attempts' });
        }

        let productId;
        if (plan === 'monthly') {
            productId = process.env.DODO_PRODUCT_ID_MONTHLY;
        } else if (plan === 'yearly') {
            productId = process.env.DODO_PRODUCT_ID_YEARLY;
        } else {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        if (!productId) {
            console.error('Configuration Error: Product IDs are missing');
            return res.status(500).json({ error: 'Product configuration error' });
        }

        try {
            const session = await client.checkoutSessions.create({
                product_cart: [{
                    product_id: productId,
                    quantity: 1,
                }],
                customer: {
                    email: customerEmail,
                    name: customerName,
                },
                metadata: {
                    userId: userId || 'unknown'
                },
                return_url: returnUrl,
            });

            return res.status(200).json({ checkout_url: session.checkout_url });
        } catch (error: any) {
            console.error('Dodo Payments SDK Error:', error);
            // Forward the specific status code if available (e.g. 401, 422)
            const statusCode = error.statusCode || error.status || 500;
            return res.status(statusCode).json({
                error: error.message || 'Failed to create checkout session'
            });
        }
    } catch (fatalError: any) {
        console.error('Fatal Checkout Error:', fatalError);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
