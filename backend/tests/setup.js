// Test setup - reset modules between tests
import { vi, afterEach } from "vitest";

// resetAllMocks vide aussi les files mockResolvedValueOnce non consommées
afterEach(() => {
  vi.resetAllMocks();
});
