import { CoinData, UniswapData } from "./interfaces/data.interface";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const uniswapData: UniswapData = {
  mainnet: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  },
  sepolia: {
    swapRouter02: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
    quoterV2: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
  },
  //mock addresses
  local: {
    swapRouter02: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
    quoterV2: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
  },
};

export const coinData: CoinData = {
  mainnet: {
    DAI: {
      name: "DAI",
      decimals: 18,
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    USDT: {
      name: "Tether USDT Stablecoin",
      decimals: 6,
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
    WETH: {
      name: "Wrapped ETH",
      decimals: 18,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
  },
  sepolia: {
    DAI: {
      name: "DAI",
      decimals: 18,
      address: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
    },
    USDT: {
      name: "Tether USDT Stablecoin",
      decimals: 6,
      address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    },
    WETH: {
      name: "Wrapped ETH",
      decimals: 18,
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    },
  },
  local: {
    DAI: {
      name: "DAI",
      decimals: 18,
      address: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
    },
    USDT: {
      name: "Tether USDT Stablecoin",
      decimals: 6,
      address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    },
    WETH: {
      name: "Wrapped ETH",
      decimals: 18,
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    },
  },
};
