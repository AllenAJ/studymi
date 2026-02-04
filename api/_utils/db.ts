import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
let supabase: any = null;

const getSupabase = () => {
    if (!supabase) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
        // Prioritize Service Role Key for server-side operations to bypass RLS
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
        if (supabaseUrl && supabaseKey) {
            supabase = createClient(supabaseUrl, supabaseKey);
            // Debug log to check if we are using the Service Role Key
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.log('Using Service Role Key for DB connection');
            } else {
                console.log('Using Anon Key for DB connection (RLS might block inserts)');
            }
        } else {
            console.error('Missing Supabase Environment Variables in db.ts');
        }
    }
    return supabase;
};

export const logUsage = async (
    userId: string,
    feature: string,
    inputTokens: number,
    outputTokens: number,
    details: any = {}
) => {
    try {
        const client = getSupabase();
        if (!client) return;

        const { error } = await client
            .from('usage_logs')
            .insert({
                user_id: userId,
                feature,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                details
            });

        if (error) {
            console.warn('Failed to log usage:', error.message);
        }
    } catch (err) {
        console.warn('Error logging usage:', err);
    }
};

export const checkUsageLimit = async (userId: string, limit: number = 2000000): Promise<boolean> => {
    try {
        const client = getSupabase();
        if (!client) return true; // Fail open if DB is missing

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data, error } = await client
            .from('usage_logs')
            .select('input_tokens, output_tokens')
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (error) {
            console.warn('Error checking usage limit:', error);
            return true; // Fail open to avoid blocking legitimate users on error
        }

        const totalTokens = data.reduce((sum: number, log: any) => sum + (log.input_tokens || 0) + (log.output_tokens || 0), 0);
        return totalTokens < limit;

    } catch (err) {
        console.warn('Error checking usage limit:', err);
        return true; // Fail open
    }
};

export const getProfile = async (userId: string) => {
    try {
        const client = getSupabase();
        if (!client) return null;

        const { data, error } = await client
            .from('profiles')
            .select('is_premium')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
        return data;
    } catch {
        return null;
    }
};

export const getMonthlyGenerationCount = async (userId: string): Promise<number> => {
    try {
        const client = getSupabase();
        if (!client) return 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count, error } = await client
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('feature', 'gemini_generateStudySet')
            .gte('created_at', startOfMonth.toISOString());

        if (error) {
            console.warn('Error counting generations:', error);
            return 0;
        }

        return count || 0;
    } catch (err) {
        console.warn('Error counting generations:', err);
        return 0;
    }
};
