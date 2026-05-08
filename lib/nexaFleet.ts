export type NexaVehicle = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  ano: string;
  bastidor: string;
  combustible: "Gasolina" | "Eléctrico" | "Diésel";
  tipo: "Scooter 125cc" | "E-Bike";
};

export const nexaFleet: NexaVehicle[] = [
  {
    codigo: "N1",
    matricula: "9582LXF",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2022",
    bastidor: "RP8MD4100NV120500",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N2",
    matricula: "5773MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100PV141603",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N3",
    matricula: "5697MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100PV141563",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N4",
    matricula: "5682MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100PV141574",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N5",
    matricula: "7179LYM",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100NV122269",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N6",
    matricula: "6538MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100PV141580",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N7",
    matricula: "5502MGY",
    marca: "Piaggio",
    modelo: "Liberty 125",
    ano: "2023",
    bastidor: "RP8MD4100PV141533",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
  {
    codigo: "N8",
    matricula: "8739LYV",
    marca: "SYM",
    modelo: "Symphony 125",
    ano: "2022",
    bastidor: "LXMXLB302NXB36427",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
  },
];

export function normalizeVehicleText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getScooterFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "Scooter 125cc");
}

export function getPiaggioFleet() {
  return getScooterFleet().filter(
    (vehicle) => normalizeVehicleText(vehicle.marca) === "piaggio"
  );
}

export function getSymFleet() {
  return getScooterFleet().filter(
    (vehicle) => normalizeVehicleText(vehicle.marca) === "sym"
  );
}

export function getEBikeFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "E-Bike");
}

export function findVehicleByCodigo(codigo?: string | null) {
  if (!codigo) return null;

  const cleanCodigo = normalizeVehicleText(codigo);

  return (
    nexaFleet.find(
      (vehicle) => normalizeVehicleText(vehicle.codigo) === cleanCodigo
    ) || null
  );
}

export function extractVehicleCodeFromText(value?: string | null) {
  if (!value) return "";

  const match = value.match(/\bN\d+\b/i);

  return match?.[0]?.toUpperCase() || "";
}

export function resolveFleetGroupFromWebsiteVehicle({
  vehicleId,
  vehicleName,
}: {
  vehicleId?: string | null;
  vehicleName?: string | null;
}) {
  const cleanId = normalizeVehicleText(vehicleId || "");
  const cleanName = normalizeVehicleText(vehicleName || "");

  const exactCode =
    extractVehicleCodeFromText(vehicleId) || extractVehicleCodeFromText(vehicleName);

  const exactVehicle = findVehicleByCodigo(exactCode);

  if (exactVehicle) {
    return {
      group: exactVehicle.marca === "SYM" ? "SYM Symphony 125" : "Piaggio Liberty 125",
      vehicles: [exactVehicle],
    };
  }

  const isEBike =
    cleanId.startsWith("e") ||
    cleanName.includes("e-bike") ||
    cleanName.includes("ebike") ||
    cleanName.includes("engwe") ||
    cleanName.includes("p275");

  if (isEBike) {
    return {
      group: "E-Bike",
      vehicles: getEBikeFleet(),
    };
  }

  const isSym =
    cleanId === "s3" ||
    cleanName.includes("sym") ||
    cleanName.includes("symphony");

  if (isSym) {
    return {
      group: "SYM Symphony 125",
      vehicles: getSymFleet(),
    };
  }

  const isPiaggio =
    cleanId === "s2" ||
    cleanName.includes("piaggio") ||
    cleanName.includes("liberty");

  if (isPiaggio) {
    return {
      group: "Piaggio Liberty 125",
      vehicles: getPiaggioFleet(),
    };
  }

  return {
    group: "Scooter",
    vehicles: getScooterFleet(),
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