import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, ClipboardList, Heart, MapPin, User } from "lucide-react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import { useAdminReadQuery } from "../../hooks/useDbQuery";

const items = [
  { to: "/announcements", label: "Updates", icon: Bell },
  { to: "/surveys", label: "Surveys", icon: ClipboardList },
  { to: "/jamaats", label: "Map", icon: MapPin },
  { to: "/hub", label: "Hub", icon: Heart, hub: true },
] as const;

const accountItem = { to: "/account", label: "Account" };

const SideNav: React.FC = () => {
  const { member } = useAuth();
  const collections = useAdminReadQuery(
    api.hub.listLive,
    member ? { designation: member.designation } : "skip",
  );
  const showHub = (collections?.length ?? 0) > 0;

  return (
    <aside className="side-nav">
      <div className="side-brand">
        <span className="brand-mark" aria-hidden="true">T</span>
        <span className="wordmark">Toloba NA</span>
      </div>

      <nav className="side-links" aria-label="Primary">
        {items.map((item) => {
          if ("hub" in item && item.hub && !showHub) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <nav className="side-account" aria-label="Account">
        <NavLink
          to={accountItem.to}
          className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
        >
          <User size={16} strokeWidth={1.75} />
          <span>{accountItem.label}</span>
        </NavLink>
      </nav>

      <style>{`
        .side-nav {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--nav-width);
          background: transparent;
          z-index: 120;
          display: flex;
          flex-direction: column;
          padding: 22px 12px 16px;
        }

        .side-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 10px 22px;
        }

        .brand-mark {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--brand);
          color: white;
          display: grid;
          place-items: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .wordmark {
          color: var(--ink);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.03em;
        }

        .side-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .side-account {
          margin-top: auto;
        }

        .side-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--ink-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 10px;
          border-radius: 10px;
        }

        .side-link svg {
          flex-shrink: 0;
        }

        .side-link:hover {
          background: rgba(18, 26, 22, 0.04);
          color: var(--ink);
        }

        .side-link.active {
          background: var(--surface);
          color: var(--ink);
          font-weight: 600;
          box-shadow: 0 0 0 1px rgba(18, 26, 22, 0.06);
        }

        .side-link.active svg {
          color: var(--brand);
        }

        @media (max-width: 767px) {
          .side-nav {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default SideNav;
