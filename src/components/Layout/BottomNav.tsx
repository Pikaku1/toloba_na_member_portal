import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, ClipboardList, Heart, User } from "lucide-react";

const BottomNav: React.FC = () => {
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
          transition: all var(--transition-fast);
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

        .nav-item.active svg {
          /* Could use filled icons if lucide-react supports them easily, or just keep stroke */
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
