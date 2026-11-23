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
        setError("ITS number not recognised. Contact your administrator.");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card page-transition">
        <div className="login-brand">
          <span className="login-mark" aria-hidden="true">T</span>
          <div>
            <p className="login-org">Toloba NA</p>
            <p className="login-product">Member portal</p>
          </div>
        </div>

        <h1>Sign in</h1>
        <p className="login-lead">Enter your ITS number to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="its_number">ITS number</label>
            <input
              id="its_number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter ITS number"
              value={itsNumber}
              onChange={(e) => setItsNumber(e.target.value.replace(/\D/g, ""))}
              autoFocus
              disabled={isSubmitting}
              autoComplete="username"
            />
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-navy"
            disabled={isSubmitting || !itsNumber}
          >
            {isSubmitting ? <div className="loading-spinner" /> : "Sign in"}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding:
            max(24px, env(safe-area-inset-top, 0px))
            max(20px, env(safe-area-inset-right, 0px))
            max(24px, env(safe-area-inset-bottom, 0px))
            max(20px, env(safe-area-inset-left, 0px));
          background: var(--bg);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          padding: 28px 24px 24px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .login-mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--brand);
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 16px;
        }

        .login-org {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.2;
        }

        .login-product {
          font-size: 13px;
          color: var(--ink-muted);
        }

        .login-card h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .login-lead {
          color: var(--ink-muted);
          font-size: 15px;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default Login;
