import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    // Methods check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // TODO: Add Signature Verification if Dodo Payments provides a standard header like 'X-Webhook-Signature'
    // const signature = req.headers['webhook-signature'];
    // if (!verifySignature(req.body, signature)) return res.status(400).send('Invalid signature');

    const event = req.body;

    console.log('Received Dodo Webhook:', event.type);

    if (!event || !event.type) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Handle successful payments or active subscriptions
    if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
        const { metadata, customer } = event.data;
        const userId = metadata?.userId;

        if (!userId) {
            console.error('Webhook Error: No userId in metadata', event);
            return res.status(200).json({ received: true }); // Acknowledge anyway
        }

        // Initialize Supabase Admin Client
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Server Configuration Error: Supabase secrets missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update User Profile
        const { error } = await supabase
            .from('profiles')
            .update({
                is_premium: true,
                subscription_status: 'active',
                subscription_id: event.data.subscription_id || event.data.id
            })
            .eq('id', userId);

        if (error) {
            console.error('Supabase Update Error:', error);
            return res.status(500).json({ error: 'Database update failed' });
        }

        console.log(`Successfully upgraded user ${userId}`);
    }

    return res.status(200).json({ received: true });
}
