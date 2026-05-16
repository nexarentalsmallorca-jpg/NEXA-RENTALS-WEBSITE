export type NexaFleetGroup =
  | "piaggio_liberty_125"
  | "sym_symphony_125"
  | "e_bike"
  | "scooter"
  | "unknown";

export type NexaVehicle = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl?: string;
  ano: string;
  bastidor: string;
  combustible: "Gasolina" | "Eléctrico" | "Diésel";
  tipo: "Scooter 125cc" | "E-Bike";
  fleetGroup: NexaFleetGroup;
  websiteVehicleId?: string;
  websiteVehicleName?: string;
};

export const nexaFleet: NexaVehicle[] = [
  {
    codigo: "N1",
    matricula: "9582LXF",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2022",
    bastidor: "RP8MD4100NV120500",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N2",
    matricula: "5773MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100PV141603",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N3",
    matricula: "5697MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100PV141563",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N4",
    matricula: "5682MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100PV141574",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N5",
    matricula: "7179LYM",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100NV122269",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N6",
    matricula: "6538MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100PV141580",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N7",
    matricula: "5502MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    imageUrl: "/images/liberty125.png",
    ano: "2023",
    bastidor: "RP8MD4100PV141533",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "piaggio_liberty_125",
    websiteVehicleId: "s2",
    websiteVehicleName: "Piaggio Liberty 125",
  },
  {
    codigo: "N8",
    matricula: "8739LYV",
    marca: "SYM",
    modelo: "Symphony 125",
    imageUrl: "/images/sym1.png",
    ano: "2022",
    bastidor: "LXMXLB302NXB36427",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
    fleetGroup: "sym_symphony_125",
    websiteVehicleId: "s3",
    websiteVehicleName: "SYM Symphony 125",
  },
];

export function normalizeVehicleText(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeVehicleCode(value?: string | null) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function getScooterFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "Scooter 125cc");
}

export function getPiaggioFleet() {
  return nexaFleet.filter(
    (vehicle) => vehicle.fleetGroup === "piaggio_liberty_125"
  );
}

export function getSymFleet() {
  return nexaFleet.filter(
    (vehicle) => vehicle.fleetGroup === "sym_symphony_125"
  );
}

export function getEBikeFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "E-Bike");
}

export function getFleetByGroup(group?: string | null) {
  const cleanGroup = normalizeVehicleText(group);

  if (cleanGroup === "piaggio_liberty_125") return getPiaggioFleet();
  if (cleanGroup === "sym_symphony_125") return getSymFleet();
  if (cleanGroup === "e_bike") return getEBikeFleet();
  if (cleanGroup === "scooter") return getScooterFleet();

  return [];
}

export function getFleetGroupDisplayName(group?: string | null) {
  const cleanGroup = normalizeVehicleText(group);

  if (cleanGroup === "piaggio_liberty_125") return "Piaggio Liberty 125";
  if (cleanGroup === "sym_symphony_125") return "SYM Symphony 125";
  if (cleanGroup === "e_bike") return "E-Bike";
  if (cleanGroup === "scooter") return "Scooter";

  return "Vehicle";
}

export function findVehicleByCodigo(codigo?: string | null) {
  const cleanCodigo = normalizeVehicleCode(codigo);

  if (!cleanCodigo) return null;

  return (
    nexaFleet.find(
      (vehicle) => normalizeVehicleCode(vehicle.codigo) === cleanCodigo
    ) || null
  );
}

export function extractVehicleCodeFromText(value?: string | null) {
  if (!value) return "";

  const match = String(value).match(/\bN\d+\b/i);

  return match?.[0]?.toUpperCase() || "";
}

export function resolveFleetGroupFromVehicleCode(
  codigo?: string | null
): NexaFleetGroup {
  const vehicle = findVehicleByCodigo(codigo);

  return vehicle?.fleetGroup || "unknown";
}

export function resolveFleetGroupKeyFromWebsiteVehicle({
  vehicleId,
  vehicleName,
  fleetGroup,
}: {
  vehicleId?: string | null;
  vehicleName?: string | null;
  fleetGroup?: string | null;
}): NexaFleetGroup {
  const cleanFleetGroup = normalizeVehicleText(fleetGroup);
  const cleanId = normalizeVehicleText(vehicleId);
  const cleanName = normalizeVehicleText(vehicleName);

  if (cleanFleetGroup === "piaggio_liberty_125") return "piaggio_liberty_125";
  if (cleanFleetGroup === "sym_symphony_125") return "sym_symphony_125";
  if (cleanFleetGroup === "e_bike") return "e_bike";
  if (cleanFleetGroup === "scooter") return "scooter";

  const exactCode =
    extractVehicleCodeFromText(vehicleId) || extractVehicleCodeFromText(vehicleName);

  const exactVehicle = findVehicleByCodigo(exactCode);

  if (exactVehicle) return exactVehicle.fleetGroup;

  const isEBike =
    cleanId.startsWith("e") ||
    cleanName.includes("e-bike") ||
    cleanName.includes("ebike") ||
    cleanName.includes("electric bike") ||
    cleanName.includes("engwe") ||
    cleanName.includes("p275");

  if (isEBike) return "e_bike";

  const isSym =
    cleanId === "s3" ||
    cleanName.includes("sym") ||
    cleanName.includes("symphony");

  if (isSym) return "sym_symphony_125";

  const isPiaggio =
    cleanId === "s2" ||
    cleanName.includes("piaggio") ||
    cleanName.includes("liberty");

  if (isPiaggio) return "piaggio_liberty_125";

  return "scooter";
}

export function resolveFleetGroupFromWebsiteVehicle({
  vehicleId,
  vehicleName,
  fleetGroup,
}: {
  vehicleId?: string | null;
  vehicleName?: string | null;
  fleetGroup?: string | null;
}) {
  const groupKey = resolveFleetGroupKeyFromWebsiteVehicle({
    vehicleId,
    vehicleName,
    fleetGroup,
  });

  return {
    group: getFleetGroupDisplayName(groupKey),
    groupKey,
    fleetGroup: groupKey,
    vehicles: getFleetByGroup(groupKey),
  };
}

export function resolveSpecificVehicleFromWebsiteVehicle({
  vehicleId,
  vehicleName,
}: {
  vehicleId?: string | null;
  vehicleName?: string | null;
}) {
  const codeFromId = extractVehicleCodeFromText(vehicleId);
  const codeFromName = extractVehicleCodeFromText(vehicleName);

  const exactCode = codeFromId || codeFromName;

  if (!exactCode) return null;

  return findVehicleByCodigo(exactCode);
}

export function vehicleDisplayName(vehicle: NexaVehicle) {
  return `${vehicle.codigo} · ${vehicle.matricula} · ${vehicle.marca} ${vehicle.modelo}`;
}

export function vehicleShortName(vehicle: NexaVehicle) {
  return `${vehicle.codigo} · ${vehicle.marca} ${vehicle.modelo}`;
}

export function getVehiclePublicName(vehicle: NexaVehicle) {
  return `${vehicle.marca} ${vehicle.modelo}`;
}

export function getVehicleCodesByFleetGroup(group?: string | null) {
  return getFleetByGroup(group).map((vehicle) => vehicle.codigo);
}

export function isPiaggioFleetGroup(group?: string | null) {
  return normalizeVehicleText(group) === "piaggio_liberty_125";
}

export function isSymFleetGroup(group?: string | null) {
  return normalizeVehicleText(group) === "sym_symphony_125";
}
