import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bell, ClipboardList, Heart, MapPin, User } from "lucide-react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import { useAdminReadQuery } from "../../hooks/useDbQuery";

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { member } = useAuth();
  const collections = useAdminReadQuery(
    api.hub.listLive,
    member ? { designation: member.designation } : "skip",
  );
  const showHub = (collections?.length ?? 0) > 0;

  const isHubDetailPage = pathname.startsWith("/hub/") && pathname !== "/hub";
  const isSurveyDetailPage = pathname.startsWith("/surveys/");

  if (isHubDetailPage || isSurveyDetailPage) return null;

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <NavLink
        to="/announcements"
        className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
      >
        <Bell size={18} strokeWidth={1.75} />
        <span>Updates</span>
      </NavLink>
      <NavLink
        to="/surveys"
        className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
      >
        <ClipboardList size={18} strokeWidth={1.75} />
        <span>Surveys</span>
      </NavLink>
      <NavLink
        to="/jamaats"
        className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
      >
        <MapPin size={18} strokeWidth={1.75} />
        <span>Map</span>
      </NavLink>
      {showHub && (
        <NavLink
          to="/hub"
          className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
        >
          <Heart size={18} strokeWidth={1.75} />
          <span>Hub</span>
        </NavLink>
      )}
      <NavLink
        to="/account"
        className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
      >
        <User size={18} strokeWidth={1.75} />
        <span>Account</span>
      </NavLink>

      <style>{`
        .bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 120;
          display: flex;
          align-items: stretch;
          height: var(--tabbar-height);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: rgba(243, 244, 241, 0.84);
          border-top: 1px solid rgba(18, 26, 22, 0.08);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
        }

        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }

        .tab-item {
          flex: 1;
          min-height: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-decoration: none;
          color: var(--ink-muted);
        }

        .tab-item span {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .tab-item.active {
          color: var(--brand);
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
