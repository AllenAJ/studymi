import DodoPayments from 'dodopayments';

console.log('Attempting to import DodoPayments...');

try {
    console.log('Class:', DodoPayments);
    const client = new DodoPayments({
        bearerToken: 'test_123',
        environment: 'test_mode'
    });
    console.log('Client created successfully');
} catch (err) {
    console.error('CRASH:', err);
}
