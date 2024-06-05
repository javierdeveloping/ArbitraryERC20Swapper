import { Networks } from "./network.interface";

export type UniswapData = {
  [key in keyof typeof Networks]: UniswapContracts;
};

export interface UniswapContracts {
  swapRouter?: string;
  swapRouter02: string;
  quoterV2?: string;
}

///

export type CoinData = {
  [key in keyof typeof Networks]: CoinList;
};

export interface CoinList {
  DAI?: Coin;
  USDT?: Coin;
  WETH: Coin;
}

export interface Coin {
  name: string;
  decimals: number;
  address: string;
}
