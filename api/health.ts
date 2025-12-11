// Use static imports to ensure Vercel includes these files in the bundle
import * as Auth from './_utils/auth.js';
import * as DB from './_utils/db.js';
// Dynamically import dodo to check node_modules presence without crashing if missing (though it should be there)

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    const results: any = {};

    // Check Auth
    try {
        if (Auth && typeof Auth.getUser === 'function') {
            results.auth = 'OK';
        } else {
            results.auth = 'FAIL: Module loaded but unexpected shape';
        }
    } catch (e: any) {
        results.auth = `FAIL: ${e.message}`;
    }

    // Check DB
    try {
        if (DB && typeof DB.logUsage === 'function') {
            results.db = 'OK';
        } else {
            results.db = 'FAIL: Module loaded but unexpected shape';
        }
    } catch (e: any) {
        results.db = `FAIL: ${e.message}`;
    }

    // Check Dodo (Dynamic is fine for node_modules validation here)
    try {
        const dodo = await import('dodopayments');
        results.dodo = 'OK';
    } catch (e: any) {
        results.dodo = `FAIL: ${e.message}`;
    }

    // Verify ENV vars (sanitized)
    results.env = {
        supabaseUrl: !!process.env.VITE_SUPABASE_URL,
        supabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        dodoKey: !!process.env.DODO_PAYMENTS_API_KEY,
        dodoEnv: process.env.DODO_ENV || 'auto'
    };

    res.status(200).json({ status: 'Health Check Complete v2', modules: results });
}
