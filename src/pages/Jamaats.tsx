import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import PageMasthead from "../components/Layout/PageMasthead";
import ListPageSkeleton from "../components/ListPageSkeleton";
import UsJamaatMap, { type MapCity } from "../components/Jamaats/UsJamaatMap";
import { useAuth } from "../context/AuthContext";
import { jamaatKey, placeForJamaat } from "../jamaatPlaces";

const jamaatCityCounts = makeFunctionReference<
  "query",
  Record<string, never>,
  { jamaat: string; count: number }[] | null
>("members:jamaatCityCounts");

const Jamaats: React.FC = () => {
  const { member } = useAuth();
  const counts = useQuery(jamaatCityCounts, {});

  if (counts === undefined) {
    return (
      <div className="jamaats-page">
        <PageMasthead title="Jamaats" subtitle="Cities our members are from" />
        <ListPageSkeleton rows={4} />
      </div>
    );
  }

  return <JamaatDirectory counts={counts ?? []} homeJamaat={member?.jamaat} />;
};

const JamaatDirectory: React.FC<{
  counts: { jamaat: string; count: number }[];
  homeJamaat?: string;
}> = ({ counts, homeJamaat }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const homeKey = homeJamaat ? jamaatKey(homeJamaat) : null;

  const cities: MapCity[] = counts.flatMap((row) => {
    const place = placeForJamaat(row.jamaat);
    if (!place) return [];
    return [
      {
        key: jamaatKey(row.jamaat),
        label: place.label,
        count: row.count,
        coordinates: place.coordinates,
        country: place.country,
      },
    ];
  });

  const activeKey =
    selectedKey ??
    (homeKey && cities.some((city) => city.key === homeKey) ? homeKey : null);

  const trimmedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!trimmedQuery) return [];
    return cities
      .filter((city) => city.label.toLowerCase().includes(trimmedQuery))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [cities, trimmedQuery]);

  const choose = (key: string) => {
    setSelectedKey(key);
    setQuery("");
  };

  const active = cities.find((city) => city.key === activeKey) ?? null;
  const totalMembers = counts.reduce((sum, row) => sum + row.count, 0);
  const share =
    active && totalMembers > 0 ? Math.round((active.count / totalMembers) * 100) : 0;

  return (
    <div className="jamaats-page">
      <PageMasthead title="Jamaats" subtitle="Cities our members are from" />

      <div className="container jamaats-wrap">
        <section className="card map-card">
          <div className="jamaat-search">
            <label className="search-label" htmlFor="jamaat-search">
              Search jamaats
            </label>
            <input
              id="jamaat-search"
              type="search"
              placeholder="Search jamaats"
              value={query}
              autoComplete="off"
              role="combobox"
              aria-expanded={trimmedQuery.length > 0}
              aria-controls="jamaat-search-results"
              aria-activedescendant={
                matches[highlight]
                  ? `jamaat-option-${matches[highlight].key.replace(/\s+/g, "-")}`
                  : undefined
              }
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlight(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && matches.length > 0) {
                  event.preventDefault();
                  setHighlight((index) => (index + 1) % matches.length);
                }
                if (event.key === "ArrowUp" && matches.length > 0) {
                  event.preventDefault();
                  setHighlight((index) => (index - 1 + matches.length) % matches.length);
                }
                if (event.key === "Enter" && matches[highlight]) {
                  event.preventDefault();
                  choose(matches[highlight].key);
                  setHighlight(0);
                }
                if (event.key === "Escape") setQuery("");
              }}
            />
            {trimmedQuery && (
              <ul id="jamaat-search-results" className="jamaat-matches" role="listbox">
                {matches.length === 0 ? (
                  <li className="jamaat-empty">No jamaat matches</li>
                ) : (
                  matches.map((city, index) => (
                    <li key={city.key}>
                      <button
                        id={`jamaat-option-${city.key.replace(/\s+/g, "-")}`}
                        type="button"
                        role="option"
                        aria-selected={index === highlight}
                        className={index === highlight ? "active" : undefined}
                        onMouseEnter={() => setHighlight(index)}
                        onClick={() => choose(city.key)}
                      >
                        {city.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <UsJamaatMap cities={cities} selectedKey={activeKey} onSelect={choose} />
        </section>

        <section className="card city-detail" aria-live="polite">
          {active ? (
            <>
              <p className="city-place">
                {active.country === "CA" ? "Canada" : "United States"}
                {active.key === homeKey ? " · Your jamaat" : ""}
              </p>
              <h2>{active.label}</h2>
              <div className="detail-row">
                <span>Toloba strength</span>
                <strong>
                  {active.count} {active.count === 1 ? "member" : "members"}
                </strong>
              </div>
              <div className="detail-row">
                <span>Share of Toloba NA</span>
                <strong>{share}%</strong>
              </div>
            </>
          ) : (
            <p className="city-empty">Select a city to see its Toloba strength.</p>
          )}
        </section>
      </div>

      <style>{`
        .jamaats-page .masthead-inner,
        .jamaats-page .jamaats-wrap {
          max-width: 880px;
        }

        .map-card {
          padding: 12px;
        }

        .jamaat-search {
          position: relative;
          margin-bottom: 8px;
        }

        .search-label {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .jamaat-search input {
          height: 44px;
        }

        .jamaat-matches {
          position: absolute;
          z-index: 5;
          left: 0;
          right: 0;
          top: 48px;
          margin: 0;
          padding: 4px;
          list-style: none;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadow);
        }

        .jamaat-matches button {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 0;
          border-radius: 6px;
          padding: 10px 12px;
          font: inherit;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
        }

        .jamaat-matches button:hover,
        .jamaat-matches button:focus-visible,
        .jamaat-matches button.active {
          background: var(--brand-soft);
        }

        .jamaat-empty {
          padding: 10px 12px;
          font-size: 14px;
          color: var(--ink-muted);
        }

        .us-map svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .city-detail {
          margin-top: 16px;
          padding: 4px 16px;
        }

        .city-place {
          margin: 12px 0 0;
          font-size: 13px;
          color: var(--ink-muted);
        }

        .city-detail h2 {
          margin: 2px 0 4px;
          font-size: 22px;
          font-weight: 600;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
        }

        .detail-row span {
          font-size: 13px;
          color: var(--ink-muted);
        }

        .detail-row strong {
          font-size: 15px;
          font-weight: 600;
        }

        .city-empty {
          margin: 0;
          padding: 16px 0;
          font-size: 14px;
          color: var(--ink-muted);
        }
      `}</style>
    </div>
  );
};

export default Jamaats;
