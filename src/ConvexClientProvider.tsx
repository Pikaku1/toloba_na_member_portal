import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { ReactNode } from "react";
import { memberConvex } from "./convexClients";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={memberConvex} shouldHandleCode={false}>
      {children}
    </ConvexAuthProvider>
  );
}
