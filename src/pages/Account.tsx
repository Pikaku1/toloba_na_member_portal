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

            {/* Identity Badges Section */}
            <div className="badge-vault">
              <div className="engraved-badge" title="Verified Member">
                <div className="badge-inner">
                  <span className="accent-font">ITS</span>
                </div>
                <span className="badge-label">VERIFIED</span>
              </div>
              
              <div className="engraved-badge" title="Early Supporter">
                <div className="badge-inner">
                  <span className="accent-font">P</span>
                </div>
                <span className="badge-label">PIONEER</span>
              </div>

              <div className="engraved-badge locked" title="Make a contribution to unlock">
                <div className="badge-inner">
                  <span className="accent-font">C</span>
                </div>
                <span className="badge-label">PATRON</span>
              </div>
            </div>
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
          font-family: 'Great Vibes', cursive;
          font-size: 42px;
          color: var(--white);
          line-height: 1;
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
          margin-bottom: 32px;
        }

        .badge-vault {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 16px;
        }

        .engraved-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .badge-inner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid var(--gold);
          background: radial-gradient(circle at center, var(--gold-dark), var(--navy));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        }

        .badge-inner .accent-font {
          font-size: 10px;
          color: var(--gold);
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .badge-label {
          font-family: var(--font-accent);
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--gold-pale);
          opacity: 0.8;
        }

        .locked {
          opacity: 0.3;
          filter: grayscale(1);
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
