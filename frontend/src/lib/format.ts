import { formatEther, parseEther } from "ethers";

export function formatMon(wei: bigint): string {
  const value = Number(formatEther(wei));
  const decimals = value !== 0 && value < 1 ? 4 : 2;
  return `${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} MON`;
}

export function monToWei(amount: string): bigint {
  return parseEther(amount || "0");
}

export function formatEtherNumber(wei: bigint): number {
  return Number(formatEther(wei));
}

export function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
