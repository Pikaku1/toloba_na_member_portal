import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import { useAdminReadQuery } from "../../hooks/useDbQuery";

/** Blocks `/hub` when the viewer has no visible live collections for their designation. */
const HubGate: React.FC = () => {
  const { member, isLoading } = useAuth();
  const collections = useAdminReadQuery(
    api.hub.listLive,
    member
      ? { designation: member.designation }
      : "skip",
  );

  if (isLoading || (member && collections === undefined)) {
    return null;
  }

  if (!member || !collections || collections.length === 0) {
    return <Navigate to="/announcements" replace />;
  }

  return <Outlet />;
};

export default HubGate;
