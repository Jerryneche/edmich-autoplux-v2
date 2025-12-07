export function extractFirstNameFromEmail(email: string | null | undefined) {
  if (!email) return "";

  const beforeAt = email.split("@")[0];

  // Split on common separators
  const parts = beforeAt.split(/[\.\_\-]/);

  // Filter out numeric-only parts and short fragments
  const nameParts = parts.filter(
    (part) => isNaN(Number(part)) && part.length > 1
  );

  if (nameParts.length === 0) return "";

  // Prefer the first part that starts with a capital letter or looks like a name
  const likelyFirst =
    nameParts.find(
      (part) => /^[A-Z]/.test(part) || /^[a-z]{3,}$/i.test(part)
    ) || nameParts[0];

  // Capitalize
  return (
    likelyFirst.charAt(0).toUpperCase() + likelyFirst.slice(1).toLowerCase()
  );
}
