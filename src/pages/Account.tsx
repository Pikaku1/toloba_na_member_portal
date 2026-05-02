import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";

const Account: React.FC = () => {
  const { member, logout } = useAuth();

  return (
    <div className="account-page page-transition">
      <PageMasthead 
        title="Account" 
        subtitle="Manage your profile"
        kicker="YOUR MEMBERSHIP"
        variant="navy"
      />

      <div className="container">
        <div className="card-dark pattern-bg member-card">
          <div className="double-rule"></div>
          
          <div className="member-info">
            <span className="accent-font kicker">MEMBER</span>
            <h2 className="display-font member-name">{member?.name}</h2>
            
            <div className="ornament-rule">
              <span style={{ fontSize: '12px' }}>✦</span>
            </div>
            
            <span className="accent-font kicker">ITS NUMBER</span>
            <div className="its-display">{member?.its_number}</div>
          </div>

          <div className="double-rule"></div>
        </div>

        <div className="actions" style={{ marginTop: '40px' }}>
          <button className="btn btn-ghost" onClick={logout}>
            <LogOut size={18} style={{ marginRight: "10px" }} />
            SIGN OUT
          </button>
        </div>
      </div>

      <style>{`
        .account-page {
          background-color: var(--cream);
          min-height: 100vh;
        }

        .member-card {
          margin-top: 24px;
          padding: 28px;
          text-align: center;
          position: relative;
          border-radius: var(--radius-sm);
        }

        .member-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, 
            var(--navy-mid) 20%, 
            transparent 75%
          );
          pointer-events: none;
        }

        .member-info {
          position: relative;
          z-index: 1;
          padding: 20px 0;
        }

        .kicker {
          color: var(--gold);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          display: block;
          margin-bottom: 8px;
        }

        .member-name {
          color: var(--white);
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 0;
        }

        .its-display {
          color: var(--white);
          font-family: var(--font-ui);
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }

        .ornament-rule {
          margin: 16px auto;
          max-width: 200px;
        }
      `}</style>
    </div>
  );
};

export default Account;
