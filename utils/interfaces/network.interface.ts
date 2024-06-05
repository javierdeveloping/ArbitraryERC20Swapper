import { Network } from "ethers";

export interface NetworkJSON {
  name: string;
  chainId: string;
}

export enum Networks {
  mainnet = "mainnet",
  sepolia = "sepolia",
  local = "local",
}

export function isValidNetwork<T>(value: any): value is T[keyof T] {
  return Object.keys(Networks).includes(value);
}
