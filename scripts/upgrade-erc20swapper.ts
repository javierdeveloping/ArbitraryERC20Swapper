import { Network } from "ethers";
import { ethers, upgrades } from "hardhat";
import {
  ArbitraryERC20SwapperV2__factory,
  ArbitraryERC20Swapper__factory,
} from "../typechain-types";
import {
  FeeAmount,
  getCoinsAndUniswapData,
  getERC20SwapperByNetwork,
  getNetworkName,
} from "../utils";

// scripts/deploy.js
async function main() {
  const signersRaw = await ethers.getSigners();
  const deployerAddress = signersRaw[0].address;
  console.log({ deployerAddress });

  let provider: Network = await ethers.provider.getNetwork();

  let networkName: string = await getNetworkName(provider);

  const deployedContracts = getERC20SwapperByNetwork(networkName);

  console.log(
    `if forking base network would be (check getNetworkName function): ${networkName}`
  );

  if (!deployedContracts.erc20Swapper) {
    throw new Error("No valid erc20swapper address");
  }

  const erc20SwapFactory: ArbitraryERC20SwapperV2__factory =
    await ethers.getContractFactory("ArbitraryERC20SwapperV2");
  console.log("Deploying ArbitraryERC20SwapperV2...");
  const erc20swap = await upgrades.upgradeProxy(
    deployedContracts.erc20Swapper,
    erc20SwapFactory
  );
  const erc20SwapAddress = await erc20swap.getAddress();

  console.log("ArbitraryERC20SwapperV2 deployed to:", erc20SwapAddress);
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
