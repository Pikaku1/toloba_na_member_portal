import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../context/AuthContext";

function messageFrom(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    typeof err.data === "string"
  ) {
    return err.data;
  }
  if (err instanceof Error) {
    const match = err.message.match(/Uncaught (?:Convex)?Error: ([^\n]+)/);
    if (match?.[1]) return match[1];
  }
  return "Something went wrong. Please try again.";
}

const Login: React.FC = () => {
  const [itsNumber, setItsNumber] = useState("");
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestCode = useAction(api.memberSignInAction.requestSignInCode);
  const { signIn } = useAuthActions();
  const { member } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (member) {
      navigate("/announcements");
    }
  }, [member, navigate]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itsNumber) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await requestCode({ its_number: itsNumber });
      setMaskedEmail(result.masked_email);
      setDevCode(result.dev_code ?? null);
      setCode("");
    } catch (err) {
      console.error("Sign-in code error", err);
      setError(messageFrom(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await signIn("its", { its_number: itsNumber, code });
    } catch (err) {
      console.error("Sign-in error", err);
      setError(messageFrom(err));
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
        {maskedEmail ? (
          <p className="login-lead">Enter the code sent to {maskedEmail}.</p>
        ) : (
          <p className="login-lead">Enter your ITS number. We email a code to the address on file.</p>
        )}

        {maskedEmail ? (
          <form onSubmit={handleSubmitCode}>
            <div className="input-group">
              <label htmlFor="code">Code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                disabled={isSubmitting}
              />
              {devCode && (
                <p className="login-dev-code">Development code: {devCode}</p>
              )}
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-navy"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? <div className="loading-spinner" /> : "Sign in"}
            </button>
            <button
              type="button"
              className="btn btn-ghost login-back"
              disabled={isSubmitting}
              onClick={() => {
                setMaskedEmail(null);
                setDevCode(null);
                setCode("");
                setError(null);
              }}
            >
              Use a different ITS number
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestCode}>
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
              {isSubmitting ? <div className="loading-spinner" /> : "Email me a code"}
            </button>
          </form>
        )}
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
          border-radius: 20px;
          box-shadow: var(--shadow-pop);
          padding: 32px 28px 28px;
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
          border-radius: 10px;
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
          font-size: 28px;
          margin-bottom: 6px;
        }

        .login-lead {
          color: var(--ink-muted);
          font-size: 15px;
          margin-bottom: 24px;
        }

        .login-dev-code {
          margin-top: 8px;
          font-size: 13px;
          color: var(--ink-muted);
        }

        .login-back {
          margin-top: 8px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Login;
