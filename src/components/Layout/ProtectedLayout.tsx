import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BottomNav from "./BottomNav";

const ProtectedLayout: React.FC = () => {
  const { member, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!member) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <main className="container">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
};

export default ProtectedLayout;
