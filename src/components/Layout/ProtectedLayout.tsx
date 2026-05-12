import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BottomNav from "./BottomNav";
import DesktopHeader from "./DesktopHeader";

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
        backgroundColor: 'var(--navy)',
        color: 'var(--white)'
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
      <DesktopHeader />
      <main className="main-content">
        <div key={location.pathname} className="route-outlet-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--cream);
        }

        .main-content {
          flex: 1;
        }

        @media (min-width: 768px) {
          .main-content {
            /* Desktop adjustments if needed */
          }
        }
      `}</style>
    </div>
  );
};

export default ProtectedLayout;
