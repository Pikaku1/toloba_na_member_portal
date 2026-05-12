import React from "react";
import { NavLink, useLocation } from "react-router-dom"; // Added useLocation
import { Bell, ClipboardList, Heart, User } from "lucide-react";

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  // Logic: Hide if we are on a detail page (e.g., /hub/my-collection)
  // but keep it if we are on the main list page (/hub)
  const isHubDetailPage = pathname.startsWith("/hub/") && pathname !== "/hub";

  if (isHubDetailPage) return null;

  return (
    <nav className="bottom-nav">
      <NavLink
        to="/announcements"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Bell size={22} />
        <span className="accent-font">Updates</span>
      </NavLink>
      <NavLink
        to="/surveys"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <ClipboardList size={22} />
        <span className="accent-font">Surveys</span>
      </NavLink>
      <NavLink
        to="/hub"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Heart size={22} />
        <span className="accent-font">Hub</span>
      </NavLink>
      <NavLink
        to="/account"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <User size={22} />
        <span className="accent-font">Account</span>
      </NavLink>

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--navy);
          border-top: 2px solid var(--gold);
          height: 64px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 100;
        }

        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.35);
          gap: 4px;
          transition:
            color var(--transition-fast),
            transform var(--transition-fast);
        }

        .nav-item:active {
          transform: scale(0.96);
        }

        .nav-item.active {
          color: var(--white);
        }

        .nav-item span {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .nav-item svg {
          stroke-width: 2px;
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;