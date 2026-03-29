export function debounceMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}