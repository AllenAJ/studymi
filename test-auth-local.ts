process.env.VITE_SUPABASE_URL = '';
process.env.VITE_SUPABASE_ANON_KEY = '';

try {
    console.log('Importing auth...');
    const auth = await import('./api/_utils/auth');
    console.log('Auth imported:', auth);
} catch (err) {
    console.error('AUTH CRASH:', err);
}
