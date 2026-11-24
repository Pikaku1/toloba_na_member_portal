/** Secretary and Joint Secretary share the chapter-pledge action. */
export function isSecretaryRole(designation?: string | null): boolean {
  const key = designation?.trim().toLowerCase();
  return key === "secretary" || key === "joint secretary";
}
