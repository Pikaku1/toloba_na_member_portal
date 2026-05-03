import React from "react";

interface FeaturedQuoteProps {
  quote: string;
  source?: string;
}

const FeaturedQuote: React.FC<FeaturedQuoteProps> = ({ quote, source }) => {
  const firstLetter = quote.charAt(0);
  const restOfQuote = quote.slice(1);

  return (
    <div className="illuminated-quote">
      <div className="ornament tl">✦</div>
      <div className="ornament tr">✦</div>
      <div className="ornament bl">✦</div>
      <div className="ornament br">✦</div>
      
      <blockquote className="display-font">
        <span className="drop-cap accent-font">{firstLetter}</span>
        {restOfQuote}
      </blockquote>
      
      {source && (
        <cite className="accent-font">— {source}</cite>
      )}

      <style>{`
        .illuminated-quote {
          padding: 40px 32px;
          background: var(--white);
          border: 1px solid var(--parchment);
          position: relative;
          margin-bottom: 32px;
          text-align: center;
        }

        .ornament {
          position: absolute;
          color: var(--gold);
          font-size: 10px;
          line-height: 1;
        }

        .tl { top: 8px; left: 10px; }
        .tr { top: 8px; right: 10px; }
        .bl { bottom: 8px; left: 10px; }
        .br { bottom: 8px; right: 10px; }

        blockquote {
          font-size: 20px;
          line-height: 1.5;
          font-style: italic;
          color: var(--ink-secondary);
          margin-bottom: 16px;
        }

        .drop-cap {
          float: left;
          font-size: 52px;
          line-height: 0.8;
          padding: 8px 12px 4px 0;
          color: var(--gold-dark);
          font-weight: 600;
        }

        cite {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--gold-dark);
        }
      `}</style>
    </div>
  );
};

export default FeaturedQuote;
