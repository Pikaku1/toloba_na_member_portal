import React, { createContext, useContext, useEffect, useState } from "react";

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
  login: (member: Member) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedMember = localStorage.getItem("tolobana_member");
    if (savedMember) {
      try {
        setMember(JSON.parse(savedMember));
      } catch (e) {
        console.error("Failed to parse saved member", e);
        localStorage.removeItem("tolobana_member");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (memberData: Member) => {
    setMember(memberData);
    localStorage.setItem("tolobana_member", JSON.stringify(memberData));
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem("tolobana_member");
  };

  return (
    <AuthContext.Provider value={{ member, isLoading, login, logout }}>
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
