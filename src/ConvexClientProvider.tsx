import { ConvexProvider } from "convex/react";
import type { ReactNode } from "react";
import { memberConvex } from "./convexClients";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={memberConvex}>{children}</ConvexProvider>;
}
