import { ethers, upgrades } from "hardhat";
import { Network } from "ethers";
import {
  CoinList,
  UniswapContracts,
  NetworkJSON,
  uniswapData,
  coinData,
  isValidNetwork,
  Networks,
} from "../utils";

const feeTier = 3000;

// scripts/deploy.js
async function main() {
  const signersRaw = await ethers.getSigners();
  const deployerAddress = signersRaw[0].address;
  console.log({ deployerAddress });

  let provider: Network = await ethers.provider.getNetwork();
  const chainId = Number(provider.chainId);
  console.log("Network chain id= ", chainId);

  const providerData: NetworkJSON = provider.toJSON().name;
  let networkName: string = providerData.name;

  console.log({ networkName });

  if (!networkName) {
    if (chainId == 31337) {
      console.log("let's consider it as a local blockchain");
      networkName = Networks.local;
    }
  }

  if (!isValidNetwork(networkName)) {
    throw new Error("No valid network");
  }

  const data: UniswapContracts = uniswapData[networkName];

  console.log({ data });
  if (!data || !data.swapRouter02) {
    throw new Error("No correct uniswap data has been found");
  }
  const coins: CoinList = coinData[networkName];

  if (!coins) {
    throw new Error("No correct coin list has been found");
  }

  if (!coins.WETH) {
    throw new Error("No correct wrapped ETH data has been found");
  }

  console.log({ data });
  console.log({ coins });

  const erc20SwapFactory = await ethers.getContractFactory(
    "ArbitraryERC20Swapper"
  );
  console.log("Deploying ArbitraryERC20Swapper...");
  const erc20swap = await upgrades.deployProxy(
    erc20SwapFactory,
    [
      deployerAddress,
      deployerAddress,
      data.swapRouter02,
      feeTier,
      coins.WETH.address,
    ],
    {
      initializer: "initialize",
    }
  );
  const erc20SwapAddress = await erc20swap.getAddress();

  console.log("ArbitraryERC20Swapper deployed to:", erc20SwapAddress);
  const proxyAdminAddress = await upgrades.erc1967.getImplementationAddress(
    erc20SwapAddress
  );
  console.log({ proxyAdminAddress });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
