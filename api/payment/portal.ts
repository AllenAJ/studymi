// import DodoPayments from 'dodopayments';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Top-level try-catch
    try {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Dynamically import DodoPayments
        let DodoPaymentsClass;
        try {
            const module = await import('dodopayments');
            DodoPaymentsClass = module.default || module;
        } catch (importError: any) {
            console.error('Failed to import dodopayments:', importError);
            return res.status(500).json({ error: 'Server dependency error: dodopayments' });
        }

        // Detect Environment
        const explicitEnv = process.env.DODO_ENV;
        let environment;

        if (explicitEnv === 'test_mode' || explicitEnv === 'live_mode') {
            environment = explicitEnv;
        } else if (apiKey.startsWith('test_')) {
            environment = 'test_mode';
        } else if (apiKey.startsWith('live_')) {
            environment = 'live_mode';
        } else {
            console.log('[Portal] No prefix detected, defaulting to live_mode');
            environment = 'live_mode';
        }

        // Parse body if needed
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body) {
            return res.status(400).json({ error: 'Missing request body' });
        }

        const { subscriptionId } = body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Missing subscriptionId' });
        }

        const client = new DodoPaymentsClass({
            bearerToken: apiKey,
            environment: environment,
        });

        // 1. Fetch subscription to get customer_id
        try {
            const subscription = await client.subscriptions.retrieve(subscriptionId);

            if (!subscription || !subscription.customer || !subscription.customer.customer_id) {
                return res.status(404).json({ error: 'Could not find customer for this subscription' });
            }

            const customerId = subscription.customer.customer_id;

            // 2. Create Portal Session
            const session = await client.customers.customerPortal.create(customerId);

            return res.status(200).json({ url: session.link });
        } catch (sdkError: any) {
            console.error('Dodo SDK Error in Portal:', sdkError);
            const statusCode = sdkError.statusCode || sdkError.status || 500;
            return res.status(statusCode).json({ error: sdkError.message || 'Portal failed' });
        }

    } catch (fatalError: any) {
        console.error('Fatal Portal Error:', fatalError);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
