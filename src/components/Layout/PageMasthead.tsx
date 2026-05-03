import React from "react";

interface PageMastheadProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  variant?: "navy" | "green";
}

const PageMasthead: React.FC<PageMastheadProps> = ({
  title,
  subtitle,
  kicker,
  variant = "navy",
}) => {
  const bgColor = variant === "navy" ? "var(--navy)" : "var(--green)";

  return (
    <header className="masthead pattern-bg" style={{ backgroundColor: bgColor }}>
      <div className="container" style={{ paddingBottom: 0 }}>
        <div className="masthead-content">
          <div className="double-rule" style={{ marginBottom: "20px" }}></div>
          
          {kicker && (
            <div className="accent-font" style={{ 
              color: "var(--gold)", 
              fontSize: "10px", 
              fontWeight: 600, 
              letterSpacing: "0.18em",
              marginBottom: "8px"
            }}>
              {kicker}
            </div>
          )}
          
          <h1 style={{ 
            color: "var(--white)", 
            fontSize: "36px", 
            fontWeight: 700,
            marginBottom: subtitle ? "4px" : "0"
          }}>
            {title}
          </h1>
          
          {subtitle && (
            <p style={{ 
              color: "rgba(255,255,255,0.65)", 
              fontSize: "14px",
              fontWeight: 400
            }}>
              {subtitle}
            </p>
          )}
          
          <div className="double-rule" style={{ marginTop: "20px" }}></div>
        </div>
      </div>

      <style>{`
        .masthead {
          padding: 36px 0 32px;
          position: relative;
          overflow: hidden;
        }

        .masthead::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 80% at 50% 50%, 
            ${bgColor} 20%, transparent 75%);
          pointer-events: none;
        }

        .masthead-content {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </header>
  );
};

export default PageMasthead;
