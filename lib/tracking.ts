// lib/tracking.ts
export function generateTrackingId(prefix = "EDM") {
  // Human-friendly short token: 6 chars base36 (letters+digits)
  // Example: EDM-MHZ0QV5W
  const token = Math.random()
    .toString(36)
    .substring(2, 9)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  return `${prefix}-${token}`;
}
