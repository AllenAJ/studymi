import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
let supabase: any = null;

export const getUser = async (req: any) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    // Lazy load supabase to prevent top-level crashes
    if (!supabase) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase Environment Variables in auth.ts');
            return null;
        }
        supabase = createClient(supabaseUrl, supabaseKey);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.warn(`[AUTH FAIL] IP: ${(req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string}`);
        return null;
    }
    return user;
};
