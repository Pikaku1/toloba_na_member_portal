import React from "react";
import { geoAlbers } from "d3-geo";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const US_GEOGRAPHY = "/geo/states-10m.json";
const CANADA_GEOGRAPHY = "/geo/canada.json";

/** Hawaii and offshore territories sit outside this US–Canada frame. */
const HIDDEN_STATE_IDS = new Set(["15", "60", "66", "69", "72", "78"]);

const projection = geoAlbers().scale(568.9).translate([495.7, 482.7]);

export type MapCity = {
  key: string;
  label: string;
  count: number;
  coordinates: [number, number];
  country: "US" | "CA";
};

type UsJamaatMapProps = {
  cities: MapCity[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

function dotRadius(count: number): number {
  return Math.min(13, 3.4 + Math.sqrt(count) * 1.05);
}

function showState(id: unknown): boolean {
  return !HIDDEN_STATE_IDS.has(String(id ?? "").padStart(2, "0"));
}

const landStyle = {
  fill: "#E7F2EB",
  stroke: "#FFFFFF",
  strokeWidth: 0.8,
  pointerEvents: "none" as const,
  tabIndex: -1,
};

const UsJamaatMap: React.FC<UsJamaatMapProps> = ({ cities, selectedKey, onSelect }) => {
  const ordered = [...cities].sort((a, b) => b.count - a.count);

  return (
    <div className="us-map">
      <ComposableMap
        projection={projection}
        width={800}
        height={700}
        viewBox="240 248 560 392"
        aria-label="Map of member cities in the United States and Canada"
      >
        <Geographies geography={US_GEOGRAPHY} parseGeographies={(features) => features.filter((feature) => showState(feature.id))}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} {...landStyle} />
            ))
          }
        </Geographies>
        <Geographies geography={CANADA_GEOGRAPHY}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} {...landStyle} />
            ))
          }
        </Geographies>
        {ordered.map((city) => {
          const selected = city.key === selectedKey;
          const radius = dotRadius(city.count);
          return (
            <Marker key={city.key} coordinates={city.coordinates}>
              <g
                role="button"
                tabIndex={0}
                aria-label={`${city.label}, ${city.count === 1 ? "1 member" : `${city.count} members`}`}
                aria-pressed={selected}
                onClick={() => onSelect(city.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(city.key);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <circle r={Math.max(radius + 6, 12)} fill="transparent" />
                <circle
                  r={radius + (selected ? 7 : 3.5)}
                  fill={selected ? "rgba(27, 67, 50, 0.16)" : "none"}
                  stroke="#1B4332"
                  strokeWidth={selected ? 2 : 1.25}
                />
                <circle
                  r={radius}
                  fill={selected ? "#16382A" : "#1B4332"}
                  stroke="#FFFFFF"
                  strokeWidth={selected ? 1.5 : 1}
                />
              </g>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};

export default UsJamaatMap;
