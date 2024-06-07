import { Network } from "ethers";
import { coinData, uniswapData, deploymentData } from "./data";
import {
  Coin,
  CoinList,
  DeployedContracts,
  UniswapContracts,
} from "./interfaces/data.interface";
import {
  NetworkJSON,
  Networks,
  isValidNetwork,
} from "./interfaces/network.interface";
import { ChainId } from "@uniswap/sdk-core";

export function getCoinsAndUniswapData(networkName: string): {
  uniswapContracts: UniswapContracts;
  coins: CoinList;
} {
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

  if (!networkName) {
    switch (chainId) {
      case 1:
        return Networks.mainnet;

      case 11155111:
        return Networks.sepolia;

      //if working with forks or locally, sepolia is considered regarding test data
      //such as uniswap and coins data.
      //if a fork is created from mainnet, 31337 (usually hardhat) and 1337 (ganache) cases can be changed to Network.mainnet
      case 1337:
        return Networks.sepolia;
      //return Networks.mainnet;

      case 31337:
        return Networks.sepolia;
      //return Networks.mainnet;

      default:
        return networkName;
    }
  }

  return networkName;
}

export function getERC20SwapperByNetwork(
  networkName: string
): DeployedContracts {
  if (!isValidNetwork(networkName)) {
    throw new Error("No valid network");
  }

  const deployedContracts: DeployedContracts = deploymentData[networkName];

  if (!deployedContracts) {
    throw new Error("No correct deployment data has been found");
  }

  if (!deployedContracts.erc20Swapper) {
    throw new Error("No correct erc20Swapper data has been found");
  }

  return deployedContracts;
}
