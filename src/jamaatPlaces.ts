export type JamaatCountry = "US" | "CA";

export type JamaatPlace = {
  label: string;
  /** Longitude, latitude. */
  coordinates: [number, number];
  country: JamaatCountry;
};

/** Roster jamaat string, uppercased, mapped to a city on the map. */
const PLACES: Record<string, JamaatPlace> = {
  "ATLANTA GA": { label: "Atlanta", coordinates: [-84.388, 33.749], country: "US" },
  "BOSTON MA": { label: "Boston", coordinates: [-71.0589, 42.3601], country: "US" },
  "CALGARY AB": { label: "Calgary", coordinates: [-114.0719, 51.0447], country: "CA" },
  "CHICAGO IL": { label: "Chicago", coordinates: [-87.6298, 41.8781], country: "US" },
  CONNECTICUT: { label: "Connecticut", coordinates: [-72.7554, 41.6032], country: "US" },
  "DALLAS TX": { label: "Dallas", coordinates: [-96.797, 32.7767], country: "US" },
  "DETROIT MI": { label: "Detroit", coordinates: [-83.0458, 42.3314], country: "US" },
  "EDMONTON AB": { label: "Edmonton", coordinates: [-113.4938, 53.5461], country: "CA" },
  FREMONT: { label: "Fremont", coordinates: [-121.9886, 37.5485], country: "US" },
  "HOUSTON TX": { label: "Houston", coordinates: [-95.3698, 29.7604], country: "US" },
  "LOS ANGELES CA": { label: "Los Angeles", coordinates: [-118.2437, 34.0522], country: "US" },
  "MINNEAPOLIS MN": { label: "Minneapolis", coordinates: [-93.265, 44.9778], country: "US" },
  "MISSISSAUGA ON": { label: "Mississauga", coordinates: [-79.6441, 43.589], country: "CA" },
  "NEW JERSEY NJ": { label: "New Jersey", coordinates: [-74.4057, 40.0583], country: "US" },
  "NEW YORKNY": { label: "New York", coordinates: [-74.006, 40.7128], country: "US" },
  "NORTH CHICAGO IL": { label: "North Chicago", coordinates: [-87.8412, 42.3256], country: "US" },
  "ORANGE COUNTY CA": { label: "Orange County", coordinates: [-117.8311, 33.7175], country: "US" },
  PHILADELPHIA: { label: "Philadelphia", coordinates: [-75.1652, 39.9526], country: "US" },
  "PLANO TX": { label: "Plano", coordinates: [-96.6989, 33.0198], country: "US" },
  "SAN ANTONIO TX": { label: "San Antonio", coordinates: [-98.4936, 29.4241], country: "US" },
  "SAN DIEGO CA": { label: "San Diego", coordinates: [-117.1611, 32.7157], country: "US" },
  "SAN JOSE CA": { label: "San Jose", coordinates: [-121.8863, 37.3382], country: "US" },
  "SEATTLE WA": { label: "Seattle", coordinates: [-122.3321, 47.6062], country: "US" },
  "TAMPA FL": { label: "Tampa", coordinates: [-82.4572, 27.9506], country: "US" },
  "TORONTO ON": { label: "Toronto", coordinates: [-79.3832, 43.6532], country: "CA" },
  "VANCOVER BC": { label: "Vancouver", coordinates: [-123.1207, 49.2827], country: "CA" },
  "WASHINGTON DC": { label: "Washington", coordinates: [-77.0369, 38.9072], country: "US" },
  "WOODLAND TX": { label: "The Woodlands", coordinates: [-95.4613, 30.1658], country: "US" },
};

export function jamaatKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ");
}

export function placeForJamaat(raw: string): JamaatPlace | null {
  return PLACES[jamaatKey(raw)] ?? null;
}
