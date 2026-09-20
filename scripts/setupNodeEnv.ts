// Ensure localStorage mock is defined before any modules load
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value.toString(); },
  removeItem(key: string) { delete this.store[key]; },
  clear() { this.store = {}; }
};
(global as any).localStorage = localStorageMock;
