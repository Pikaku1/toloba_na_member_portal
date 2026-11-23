import React from "react";

interface PageMastheadProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  variant?: "navy" | "green";
}

const PageMasthead: React.FC<PageMastheadProps> = ({ title, subtitle }) => {
  return (
    <header className="page-masthead">
      <div className="masthead-inner">
        <div className="page-header">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default PageMasthead;
