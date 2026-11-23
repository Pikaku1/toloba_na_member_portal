import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SideNav from "./SideNav";
import BottomNav from "./BottomNav";

const ProtectedLayout: React.FC = () => {
  const { member, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg)',
        color: 'var(--brand)'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <SideNav />
      <main className="main-content">
        <div key={location.pathname} className="route-outlet-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />

      <style>{`
        .app-layout {
          min-height: 100vh;
          min-height: 100dvh;
          background-color: var(--bg);
        }

        .main-content {
          margin-left: var(--nav-width);
          min-height: 100vh;
          min-height: 100dvh;
        }
      `}</style>
    </div>
  );
};

export default ProtectedLayout;
