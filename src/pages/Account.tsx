import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";

const Account: React.FC = () => {
  const { member, logout } = useAuth();

  return (
    <div className="account-page">
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
            <span className="accent-font kicker">MEMBER IDENTITY</span>
            
            <div className="signature-section">
              <div className="member-name signature-font">{member?.name}</div>
              <div className="gold-rule" style={{ margin: '4px auto 16px', maxWidth: '240px' }}></div>
            </div>
            
            <div className="ornament-rule" style={{ margin: '24px auto' }}>
              <span style={{ fontSize: '12px' }}>✦</span>
            </div>
            
            <span className="accent-font kicker">ITS NUMBER</span>
            <div className="its-display">{member?.its_number}</div>

            {member?.designation && (
              <>
                <div className="ornament-rule" style={{ margin: '24px auto' }}>
                  <span style={{ fontSize: '12px' }}>✦</span>
                </div>
                <span className="accent-font kicker">DESIGNATION</span>
                <div className="its-display designation-display">{member.designation}</div>
              </>
            )}
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

        .signature-section {
          margin: 12px 0;
        }

        .signature-font {
          font-family: var(--font-signature);
          font-size: 32px;
          font-weight: 600;
          color: var(--white);
          line-height: 1.15;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .kicker {
          color: var(--gold);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          display: block;
          margin-bottom: 8px;
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
