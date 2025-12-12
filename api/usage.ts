import { getUser } from './_utils/auth.js';
import { getMonthlyGenerationCount, getProfile } from './_utils/db.js';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const [profile, count] = await Promise.all([
            getProfile(user.id),
            getMonthlyGenerationCount(user.id)
        ]);

        const isPremium = profile?.is_premium || false;
        // Limit: 3 for Free, 1000 for Premium (effectively unlimited)
        const limit = isPremium ? 1000 : 3;

        return res.status(200).json({
            count,
            limit,
            isPremium,
            remaining: Math.max(0, limit - count)
        });

    } catch (error: any) {
        console.error('Usage API error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
