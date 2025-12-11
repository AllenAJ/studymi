import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export const getUser = async (req: any) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.warn(`[AUTH FAIL] IP: ${(req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string}`);
        return null;
    }
    return user;
};
