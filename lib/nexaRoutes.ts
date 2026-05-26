export type NexaRoute = {
  id: string;
  shortName: string;
  name: string;
  description: string;
  mapUrl: string;
  distance?: string;
  duration?: string;
};

export const NEXA_ROUTES: NexaRoute[] = [
  {
    id: "route-1",
    shortName: "Route 1",
    name: "Route 1 — NEXA Secret Coves Route",
    description:
      "A beautiful easy route with sea views, secret coves, beaches, viewpoints and perfect stops for photos.",
    mapUrl: "https://maps.app.goo.gl/W57mTK9SapPPS4wm7",
    distance: "Approx. 23–25 km",
    duration: "Approx. 55 min",
  },
  {
    id: "route-2",
    shortName: "Route 2",
    name: "Route 2 — NEXA Palma City Route",
    description:
      "A scenic city route through Palma with beautiful roads, viewpoints and the famous cathedral.",
    mapUrl: "https://maps.app.goo.gl/qfAMYCbP4FprPssf8",
    distance: "Approx. 36–40 km",
    duration: "Approx. 42 min",
  },
  {
    id: "route-3",
    shortName: "Route 3",
    name: "Route 3 — NEXA Sunset Route",
    description:
      "A relaxed route designed for sunset views, photos and a premium rental experience.",
    mapUrl: "https://maps.app.goo.gl/GKdTvU9kQmhe9ELX9",
    distance: "Approx. 23–25 km",
    duration: "Approx. 1.5–2 hours",
  },
];

export function getNexaRouteById(routeId?: string | null) {
  if (!routeId) return null;
  return NEXA_ROUTES.find((route) => route.id === routeId) || null;
}

export function getNexaSpecialRouteById(routeId?: string | null) {
  return getNexaRouteById(routeId);
}