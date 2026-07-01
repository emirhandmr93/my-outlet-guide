export function logStart(message: string): void {
  console.log(`🚀 ${message}`);
}

export function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

export function logSkip(message: string): void {
  console.log(`⏭️ ${message}`);
}

export function logWarning(message: string): void {
  console.warn(`⚠️ ${message}`);
}

export function logError(message: string): void {
  console.error(`❌ ${message}`);
}
