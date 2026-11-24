import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import React, { createContext, useContext, useEffect } from "react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";

export interface Member {
  _id: string;
  name: string;
  its_number: string;
  email?: string;
  designation?: string;
  jamaat?: string;
  coordinator?: string;
  /** True when designation is leadership (for leadership-only campaigns). */
  can_access_hub?: boolean;
  /** True for Designation=Coordinator — sees POC jamaat niyyat section. */
  is_poc?: boolean;
}

interface AuthContextType {
  member: Member | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(
    api.members.me,
    authLoading || !isAuthenticated ? "skip" : {},
  );

  useEffect(() => {
    localStorage.removeItem("tolobana_member");
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || me !== null) return;
    void signOut();
  }, [authLoading, isAuthenticated, me, signOut]);

  const isLoading = authLoading || (isAuthenticated && me === undefined);
  const member = me ?? null;

  return (
    <AuthContext.Provider value={{ member, isLoading, logout: () => void signOut() }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
