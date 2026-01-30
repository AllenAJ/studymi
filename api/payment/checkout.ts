import DodoPayments from 'dodopayments';

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

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Dodo Payments API key not configured' });
    }

    const client = new DodoPayments({
        bearerToken: apiKey,
        environment: apiKey.startsWith('test_') ? 'test_mode' : 'live_mode',
    });

    const { plan, returnUrl, customerEmail, customerName, userId } = req.body;

    let productId;
    if (plan === 'monthly') {
        productId = process.env.DODO_PRODUCT_ID_MONTHLY;
    } else if (plan === 'yearly') {
        productId = process.env.DODO_PRODUCT_ID_YEARLY;
    } else {
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!productId) {
        return res.status(500).json({ error: 'Product IDs not configured' });
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
        return res.status(500).json({
            error: error.message || 'Failed to create checkout session'
        });
    }
}
