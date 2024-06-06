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
  getCoinsAndUniswapData,
  ZERO_ADDRESS,
  getNetworkName,
} from "../utils";
import { ArbitraryERC20Swapper__factory } from "../typechain-types";

const feeTier = 3000;

// scripts/deploy.js
async function main() {
  const signersRaw = await ethers.getSigners();
  const deployerAddress = signersRaw[0].address;
  console.log({ deployerAddress });

  let provider: Network = await ethers.provider.getNetwork();

  let networkName: string = await getNetworkName(provider);

  const { uniswapContracts, coins } = getCoinsAndUniswapData(networkName);

  console.log({ networkName });
  console.log({ uniswapContracts });
  console.log({ coins });

  const erc20SwapFactory: ArbitraryERC20Swapper__factory =
    await ethers.getContractFactory("ArbitraryERC20Swapper");
  console.log("Deploying ArbitraryERC20Swapper...");
  const erc20swap = await upgrades.deployProxy(
    erc20SwapFactory,
    [
      deployerAddress,
      deployerAddress,
      deployerAddress,
      uniswapContracts.swapRouter02,
      feeTier,
      coins.WETH.address,
    ],
    {
      initializer: "initialize",
    }
  );
  const erc20SwapAddress = await erc20swap.getAddress();

  console.log("ArbitraryERC20Swapper deployed to:", erc20SwapAddress);
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    erc20SwapAddress
  );
  console.log({ implementationAddress });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
