import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, ClipboardList, Heart, User } from "lucide-react";

const BottomNav: React.FC = () => {
  return (
    <nav className="sticky-bottom" style={{ padding: "0", height: "64px", display: "flex" }}>
      <NavLink
        to="/announcements"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Bell size={24} />
        <span>Updates</span>
      </NavLink>
      <NavLink
        to="/surveys"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <ClipboardList size={24} />
        <span>Surveys</span>
      </NavLink>
      <NavLink
        to="/hub"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Heart size={24} />
        <span>Hub</span>
      </NavLink>
      <NavLink
        to="/account"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <User size={24} />
        <span>Account</span>
      </NavLink>

      <style>{`
        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--text-muted);
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          border-top: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-item.active {
          color: var(--accent);
          border-top-color: var(--accent);
        }
        .nav-item span {
          margin-top: 2px;
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
