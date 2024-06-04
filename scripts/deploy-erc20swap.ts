import { ethers, upgrades } from "hardhat";
import { uniswapData } from "../utils/data";
import { Network } from "ethers";

const feeTier = 3000;

// scripts/deploy.js
async function main() {
  const signersRaw = await ethers.getSigners();
  const deployerAddress = signersRaw[0].address;
  console.log({ deployerAddress });

  let provider: Network = await ethers.provider.getNetwork();
  const chainId = Number(provider.chainId);
  console.log("Network chain id= ", chainId);

  const providerData: NetworkJSON = provider.toJSON();

  if (!providerData.name) {
    throw new Error("No network name has been found");
  }

  const data: UniswapContracts = uniswapData.networks[providerData.name];

  if (!data || !data.swapRouter02 || !data.wrappedETH) {
    throw new Error("No correct uniswap data has been found");
  }

  console.log({ data });

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
      data.wrappedETH,
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
