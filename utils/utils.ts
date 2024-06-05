import { Network } from "ethers";
import { coinData, uniswapData } from "./data";
import { Coin, CoinList, UniswapContracts } from "./interfaces/data.interface";
import {
  NetworkJSON,
  Networks,
  isValidNetwork,
} from "./interfaces/network.interface";

export async function getCoinsAndUniswapData(networkName: string): Promise<{
  uniswapContracts: UniswapContracts;
  coins: CoinList;
}> {
  if (!isValidNetwork(networkName)) {
    throw new Error("No valid network");
  }

  const uniswapContracts: UniswapContracts = uniswapData[networkName];

  if (!uniswapContracts || !uniswapContracts.swapRouter02) {
    throw new Error("No correct uniswap data has been found");
  }
  const coins: CoinList = coinData[networkName];

  if (!coins) {
    throw new Error("No correct coin list has been found");
  }

  if (!coins.WETH) {
    throw new Error("No correct wrapped ETH data has been found");
  }

  return { uniswapContracts, coins };
}

export async function getNetworkName(provider: Network): Promise<string> {
  const chainId = Number(provider.chainId);
  console.log("Network chain id= ", chainId);

  const providerData: NetworkJSON = provider.toJSON().name;
  let networkName: string = providerData.name;

  console.log(networkName);

  if (!networkName) {
    switch (chainId) {
      case 1:
        return Networks.mainnet;

      case 11155111:
        return Networks.sepolia;

      case 31337:
        return Networks.local;

      default:
        return networkName;
    }
  }

  return networkName;
}
