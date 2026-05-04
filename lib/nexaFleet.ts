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