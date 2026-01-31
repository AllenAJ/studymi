import DodoPayments from 'dodopayments';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Missing subscriptionId' });
        }

        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Fix: Some test keys don't start with 'test_', so we default to test_mode
        // unless the key explicitly starts with 'live_'.
        const isLive = apiKey.startsWith('live_');
        const environment = isLive ? 'live_mode' : 'test_mode';

        const client = new DodoPayments({
            bearerToken: apiKey,
            environment: environment,
        });

        // 1. Fetch subscription to get customer_id
        const subscription = await client.subscriptions.retrieve(subscriptionId);

        if (!subscription || !subscription.customer || !subscription.customer.customer_id) {
            return res.status(404).json({ error: 'Could not find customer for this subscription' });
        }

        const customerId = subscription.customer.customer_id;

        // 2. Create Portal Session
        // Use standard create method on the resource
        const session = await client.customers.customerPortal.create(customerId);

        return res.status(200).json({ url: session.link });

    } catch (error: any) {
        console.error('Portal Error:', error);
        return res.status(500).json({ error: error.message || 'Portal session creation failed' });
    }
}
