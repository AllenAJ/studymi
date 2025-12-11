type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const store: RateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (now - value.lastReset > 60000) { // If entry is older than 1 min
            store.delete(key);
        }
    }
}, 300000);

export const rateLimit = (ip: string, limit: number = 10, windowMs: number = 60000) => {
    const now = Date.now();
    const record = store.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > windowMs) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count++;
    store.set(ip, record);

    return record.count <= limit;
};
