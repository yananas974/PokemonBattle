export function createCache(fn: () => Promise<any>, duration: number) {
    let cachedData: any = null;
    let lastFetchTime = 0;

    return async () => {
        const currentTime = Date.now();
        if(cachedData && currentTime - lastFetchTime < duration) {
            return cachedData;
        }
        cachedData = await fn();
        lastFetchTime = currentTime;
        return cachedData;
    }
}