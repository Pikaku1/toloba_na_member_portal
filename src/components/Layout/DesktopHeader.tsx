import React from "react";
import { NavLink } from "react-router-dom";

const DesktopHeader: React.FC = () => {
  return (
    <header className="desktop-header pattern-bg">
      <div className="header-container">
        <div className="double-rule top-rule"></div>
        
        <div className="header-content">
          <div className="brand-section">
            <div className="accent-font org-name">DAERAT TOLOBA</div>
            <div className="display-font wordmark">Toloba NA</div>
          </div>
          
          <nav className="desktop-nav">
            <NavLink to="/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              UPDATES
            </NavLink>
            <NavLink to="/surveys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              SURVEYS
            </NavLink>
            <NavLink to="/hub" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              HUB
            </NavLink>
            <NavLink to="/account" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              ME
            </NavLink>
          </nav>
        </div>
        
        <div className="double-rule bottom-rule"></div>
      </div>

      <style>{`
        .desktop-header {
          display: none;
          background: var(--navy);
          height: 100px;
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0 20px;
        }

        @media (min-width: 768px) {
          .desktop-header {
            display: flex;
            align-items: center;
          }
        }

        .header-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .org-name {
          color: var(--gold);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          margin-bottom: -4px;
        }

        .wordmark {
          color: var(--white);
          font-size: 24px;
          font-weight: 800;
          font-style: italic;
        }

        .desktop-nav {
          display: flex;
          gap: 24px;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.65);
          text-decoration: none;
          font-family: var(--font-accent);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          transition:
            color var(--transition-fast),
            border-bottom-color var(--transition-fast),
            transform var(--transition-fast);
          padding-bottom: 4px;
          border-bottom: 2px solid transparent;
          display: inline-block;
        }

        .nav-link:hover {
          color: var(--white);
        }

        .nav-link.active {
          color: var(--white);
          border-bottom-color: var(--gold);
        }

        .nav-link:active {
          transform: scale(0.96);
        }

        .top-rule, .bottom-rule {
          margin: 0 !important;
        }
      `}</style>
    </header>
  );
};

export default DesktopHeader;
