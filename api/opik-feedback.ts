export const config = {
    runtime: 'nodejs',
};

import { getUser } from './_utils/auth.js';

/** Optional Opik client for sending user feedback to traces. */
async function getOpikClient() {
    const hasKey = !!(process.env.OPIK_API_KEY?.trim());
    const hasWorkspace = !!(process.env.OPIK_WORKSPACE_NAME?.trim());
    if (!hasKey && !hasWorkspace) return null;
    try {
        const { Opik } = await import('opik');
        return new Opik({
            projectName: process.env.OPIK_PROJECT_NAME || 'studymi',
        });
    } catch (e) {
        console.warn('[Opik] init failed:', (e as Error).message);
        return null;
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let body: { traceId?: string; name?: string; value?: number; reason?: string };
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const traceId = body.traceId?.trim();
    const value = typeof body.value === 'number' ? body.value : body.value === '1' || body.value === 1 ? 1 : 0;
    const name = (body.name?.trim() || 'user_rating').slice(0, 200);
    const reason = body.reason?.trim()?.slice(0, 500);

    if (!traceId || traceId.length < 10) {
        return res.status(400).json({ error: 'traceId is required' });
    }

    const opik = await getOpikClient();
    if (!opik) {
        return res.status(503).json({ error: 'Opik is not configured' });
    }

    try {
        await opik.api.traces.addTraceFeedbackScore(traceId, {
            body: {
                name,
                value,
                source: 'sdk',
                ...(reason ? { reason } : {}),
            },
        });
        return res.status(200).json({ ok: true });
    } catch (e: any) {
        console.warn('[Opik] addTraceFeedbackScore failed:', e?.message || e);
        return res.status(500).json({ error: 'Failed to submit feedback' });
    }
}
