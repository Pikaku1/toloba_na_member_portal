import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import PageMasthead from "../components/Layout/PageMasthead";
import NotificationSection from "../components/Account/NotificationSection";
import PocNiyyatSection from "../components/Account/PocNiyyatSection";

const Account: React.FC = () => {
  const { member, logout } = useAuth();

  const rows = [
    { label: "Name", value: member?.name },
    { label: "ITS number", value: member?.its_number },
    member?.designation ? { label: "Designation", value: member.designation } : null,
    member?.jamaat ? { label: "Jamaat", value: member.jamaat } : null,
    member?.email ? { label: "Email", value: member.email } : null,
  ].filter(Boolean) as { label: string; value?: string }[];

  return (
    <div className="account-page">
      <PageMasthead title="Account" subtitle="Your membership" />

      <div className="container" style={{ paddingTop: 20 }}>
        <section className="card profile-card">
          {rows.map((row) => (
            <div key={row.label} className="profile-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </section>

        <PocNiyyatSection />

        <NotificationSection />

        <button className="btn btn-ghost sign-out" onClick={logout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      <style>{`
        .account-page { min-height: 100vh; }

        .profile-card {
          padding: 4px 16px;
        }

        .profile-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }

        .profile-row:last-child {
          border-bottom: none;
        }

        .profile-row span {
          font-size: 13px;
          color: var(--ink-muted);
        }

        .profile-row strong {
          font-size: 15px;
          font-weight: 600;
          text-align: right;
        }

        .sign-out {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Account;
