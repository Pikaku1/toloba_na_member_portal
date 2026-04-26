import { ConvexReactClient } from "convex/react";

export type DbSource = "member" | "admin";

const memberUrl = (import.meta.env.VITE_CONVEX_URL_MEMBER ??
  import.meta.env.VITE_CONVEX_URL) as string | undefined;
const adminUrl = import.meta.env.VITE_CONVEX_URL_ADMIN as string | undefined;

if (!memberUrl) {
  throw new Error(
    "Missing Convex URL. Set VITE_CONVEX_URL_MEMBER (or VITE_CONVEX_URL).",
  );
}

export const memberConvex = new ConvexReactClient(memberUrl);
export const adminConvex = adminUrl ? new ConvexReactClient(adminUrl) : null;

export function getConvexClient(source: DbSource): ConvexReactClient {
  if (source === "member") {
    return memberConvex;
  }
  if (!adminConvex) {
    throw new Error(
      "Missing VITE_CONVEX_URL_ADMIN. Admin reads require an admin Convex deployment URL.",
    );
  }
  return adminConvex;
}
