import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
    <div className="login-page">
      <div className="login-card">
        <div className="logo">Tolobana</div>
        <h1>Welcome</h1>
        <p className="subtitle">Enter your ITS number to continue</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="ITS number"
              value={itsNumber}
              onChange={(e) => setItsNumber(e.target.value.replace(/\D/g, ""))}
              autoFocus
              disabled={isSubmitting}
            />
            {error && <p className="error-text">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || !itsNumber}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--background);
        }
        .login-card {
          width: 100%;
          max-width: 360px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 40px;
          letter-spacing: -0.5px;
        }
        h1 {
          margin-bottom: 8px;
        }
        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }
        .input-group {
          margin-bottom: 16px;
          text-align: left;
        }
        .error-text {
          color: var(--error);
          font-size: 13px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default Login;
