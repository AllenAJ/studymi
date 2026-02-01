import DodoPayments from 'dodopayments';
import { getUser } from '../_utils/auth';
import { rateLimit } from '../_utils/rate-limit';

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

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    if (!apiKey) {
        console.error('Configuration Error: DODO_PAYMENTS_API_KEY is missing');
        return res.status(500).json({ error: 'Payment configuration error' });
    }

    // Fix: Some test keys don't start with 'test_', so we default to test_mode
    // unless the key explicitly starts with 'live_'.
    const isLive = apiKey.startsWith('live_');
    const environment = isLive ? 'live_mode' : 'test_mode';

    // Using console.error to ensure it shows up in Vercel Error Logs
    console.error(`[DEBUG] Initializing Dodo in ${environment} (Key: ...${apiKey.slice(-4)})`);

    const client = new DodoPayments({
        bearerToken: apiKey,
        environment: environment,
    });

    const { plan, returnUrl, customerEmail, customerName, userId } = req.body;

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
        console.error('Dodo Payments checkout error:', error);
        // Forward the specific status code if available (e.g. 401, 422)
        const statusCode = error.statusCode || error.status || 500;
        return res.status(statusCode).json({
            error: error.message || 'Failed to create checkout session'
        });
    }
}
