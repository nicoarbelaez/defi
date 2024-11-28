function debounce(key: string, callback: Function, delay: number) {
  return function (...args: any[]) {
    const cache = CacheService.getScriptCache();
    const now = Date.now();
    cache.put(key, now.toString(), (delay * 2) / 1000);

    Utilities.sleep(delay);

    const lastExecution = cache.get(key);
    
    if (now === Number(lastExecution)) {
      callback(...args);
    }
  };
}
