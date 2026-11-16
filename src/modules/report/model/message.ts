export const SMS_LIMIT = 100;
export const REFERENCE_MARKER = "{référence}";

export function editablePattern(pattern: string): string {
  return pattern.replace("%s", REFERENCE_MARKER);
}

export function storedPattern(pattern: string): string {
  return pattern.replaceAll(REFERENCE_MARKER, "%s");
}

export function previewMessage(pattern: string, referenceLength: number): string {
  const reference = `SIG-${"0".repeat(Math.max(0, referenceLength - 4))}`;
  return storedPattern(pattern).replaceAll("%s", reference);
}
