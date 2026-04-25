import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

const Account: React.FC = () => {
  const { member, logout } = useAuth();

  return (
    <div className="account-page">
      <header className="page-header">
        <h1>Account</h1>
      </header>

      <div className="profile-section card">
        <div className="avatar">
          <User size={32} color="var(--text-muted)" />
        </div>
        <div className="info">
          <h2>{member?.name}</h2>
          <p className="meta">ITS: {member?.its_number}</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={logout}>
          <LogOut size={18} style={{ marginRight: "8px" }} />
          Sign out
        </button>
      </div>

      <style>{`
        .page-header {
          padding: 20px 0;
          margin-bottom: 8px;
        }
        .profile-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .avatar {
          width: 64px;
          height: 64px;
          background: var(--surface);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info h2 {
          margin-bottom: 2px;
        }
        .actions {
          margin-top: auto;
        }
      `}</style>
    </div>
  );
};

export default Account;
