import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export const logUsage = async (
    userId: string,
    feature: string,
    inputTokens: number,
    outputTokens: number,
    details: any = {}
) => {
    try {
        const { error } = await supabase
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
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('usage_logs')
            .select('input_tokens, output_tokens')
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (error) {
            console.warn('Error checking usage limit:', error);
            return true; // Fail open to avoid blocking legitimate users on error
        }

        const totalTokens = data.reduce((sum, log) => sum + (log.input_tokens || 0) + (log.output_tokens || 0), 0);
        return totalTokens < limit;

    } catch (err) {
        console.warn('Error checking usage limit:', err);
        return true; // Fail open
    }
};

export const getProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    } catch {
        return null;
    }
};
```
