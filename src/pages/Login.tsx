import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [itsNumber, setItsNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loginMutation = useMutation(api.members.login);
  const { login, member } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (member) {
      navigate("/announcements");
    }
  }, [member, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itsNumber) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginMutation({ its_number: itsNumber });
      if (result) {
        login(result);
        navigate("/announcements");
      } else {
        setError("ITS number not recognised — contact your administrator.");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page pattern-bg">
      <div className="login-container page-transition">
        <div className="double-rule"></div>
        
        <div className="login-header">
          <div className="accent-font org-name">DAERAT TOLOBA</div>
          <h1 className="display-font wordmark">Toloba NA</h1>
          
          <div className="gold-dash"></div>
          
          <h2 className="display-font welcome-title">Welcome, Member</h2>
          <p className="subtitle">Enter your ITS number to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="its_number" style={{ color: 'var(--gold)' }}>ITS NUMBER</label>
            <input
              id="its_number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="ITS number"
              className="login-input"
              value={itsNumber}
              onChange={(e) => setItsNumber(e.target.value.replace(/\D/g, ""))}
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="field-error" role="alert">
                <span aria-hidden="true">⚠</span>
                {error}
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-white" 
            disabled={isSubmitting || !itsNumber}
          >
            {isSubmitting ? (
              <div className="loading-spinner"></div>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>

        <div className="double-rule"></div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--navy);
          position: relative;
        }

        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, 
            var(--navy) 0%, 
            var(--navy) 30%, 
            transparent 75%
          );
          pointer-events: none;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .login-header {
          padding: 36px 0;
        }

        .org-name {
          color: var(--gold);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          margin-bottom: 4px;
        }

        .wordmark {
          color: var(--white);
          font-size: 34px;
          font-weight: 800;
          font-style: italic;
          margin-bottom: 16px;
        }

        .gold-dash {
          width: 80px;
          height: 1px;
          background: var(--gold);
          margin: 0 auto 16px;
        }

        .welcome-title {
          color: var(--white);
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.60);
          font-size: 14px;
          font-weight: 400;
        }

        .login-form {
          margin: 36px 0;
          text-align: left;
        }

        .login-input {
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(201, 168, 76, 0.30);
          border-bottom: 2px solid var(--gold);
          color: var(--white);
        }

        .login-input:focus {
          border-bottom-color: var(--gold-light);
          background: rgba(255, 255, 255, 0.14);
        }

        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .field-error {
          color: var(--error);
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
          display: flex;
          gap: 6px;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Login;
