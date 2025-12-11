import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper to read raw body
async function getRawBody(readable: Readable): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
    // Methods check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const rawBody = await getRawBody(req);

        // Parse the body manually since we disabled bodyParser
        let event;
        try {
            event = JSON.parse(rawBody.toString('utf8'));
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }

        // Signature Verification
        const signature = req.headers['webhook-signature'];
        const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

        console.log(`[Webhook] Received ${event.type}. Sig Header: ${!!signature}, Secret Configured: ${!!secret}`);

        // SECURITY: ALWAYS require signature if secret is configured
        if (secret) {
            if (!signature) {
                console.error('[Security] Missing Webhook Signature Header');
                return res.status(401).json({ error: 'Missing signature' });
            }

            // Compute HMAC SHA256 of the raw body
            const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

            // Dodo may use 't=...,v1=...' format or simple hash - check if computed hash is present
            if (!signature.includes(computed)) {
                console.error('[Security] Invalid Webhook Signature', { received: signature.substring(0, 20) + '...', computed: computed.substring(0, 20) + '...' });
                return res.status(401).json({ error: 'Invalid signature' });
            }

            console.log('[Security] Signature Verified ✅');
        } else {
            // Log warning if no secret configured (should be configured in production)
            console.warn('[Security] No DODO_PAYMENTS_WEBHOOK_SECRET configured - signature verification skipped');
        }

        if (!event || !event.type) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        // Handle successful payments or active subscriptions
        if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
            const { metadata } = event.data;
            const userId = metadata?.userId;

            if (!userId) {
                console.error('Webhook Error: No userId in metadata', event);
                return res.status(200).json({ received: true }); // Acknowledge anyway
            }

            // Initialize Supabase Admin Client
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseServiceKey) {
                console.error(`[Webhook Error] Missing Config: URL=${!!supabaseUrl}, Key=${!!supabaseServiceKey}`);
                return res.status(500).json({ error: 'Server configuration error: Missing env vars' });
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
        // Handle cancellations or expirations
        else if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired' || event.type === 'payment.failed') {
            const { metadata } = event.data;
            const userId = metadata?.userId;

            if (userId) {
                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (supabaseUrl && supabaseServiceKey) {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey);

                    console.log(`Downgrading user ${userId} due to ${event.type}`);

                    await supabase
                        .from('profiles')
                        .update({
                            is_premium: false,
                            subscription_status: event.type.replace('subscription.', ''),
                        })
                        .eq('id', userId);
                }
            }
        }

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error('Webhook Handler Error:', err);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
