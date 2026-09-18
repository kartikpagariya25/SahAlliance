export interface Persona {
  name: string;
  address: string;
  role: string;
}

// Stand-ins for the three demo members (implementation plan §4.2). Addresses
// are placeholder identifiers for the mock phase; in the live phase these map
// to the assisted-signing accounts the workshop provides.
export const PERSONAS: Persona[] = [
  { name: "Radha", address: "0xRadha000000000000000000000000000000001", role: "Tailoring stall" },
  { name: "Meena", address: "0xMeena000000000000000000000000000000002", role: "Vegetables" },
  { name: "Sunita", address: "0xSunita00000000000000000000000000000003", role: "Tailoring supplies" },
];

export function personaByAddress(address: string): Persona | undefined {
  return PERSONAS.find((p) => p.address.toLowerCase() === address.toLowerCase());
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
