import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { getERC20SwapperByNetwork, getNetworkName } from "../utils";
import { ERC20Abi } from "../utils/abis/ERC20Abi";

task("swap", "Swap ether to token'")
  .addParam("eth", "The amount in Ether to sent (ex: 0.001 , 0.1 , 1)")
  .addParam("token", "The address of the token to receive")
  .addParam(
    "minamount",
    "The minimum amount of token user is willing to receive (ex. 2 DAI, 100 USDT)"
  )
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const amountETH: string = taskArgs.eth;
    const token: string = taskArgs.token;
    const minAmount: string = taskArgs.minamount;

    console.log(
      `Swapping ${amountETH} Ether to token ${token} for a minimum amount of ${minAmount}`
    );

    const { ethers } = hre; // Access ethers from HRE

    // Get signer
    const [signer, ...rest] = await ethers.getSigners();

    const signerAddress = signer.address;
    console.log({ signerAddress });

    //Get network data
    let provider = await ethers.provider.getNetwork();
    let networkName: string = await getNetworkName(provider);

    //Instantiating ERC20Swapper for selected network
    const deployedContracts = await getERC20SwapperByNetwork(networkName);

    console.log({ deployedContracts });

    const erc20SwapperAddress = deployedContracts.erc20Swapper;
    if (!erc20SwapperAddress) {
      throw new Error(`Non existing data for erc20Swapper in ${networkName}`);
    }

    const erc20swapperArtifact = await hre.artifacts.readArtifact(
      "ArbitraryERC20Swapper"
    );

    const arbitraryERC20Swapper = new ethers.Contract(
      erc20SwapperAddress,
      erc20swapperArtifact.abi,
      signer
    );

    if (!ethers.isAddress(token)) {
      throw new Error("Not valid token address");
    }

    //Creating token contract instance

    const tokenContract = new ethers.Contract(token, ERC20Abi, signer);

    const tokenDecimals = await tokenContract.decimals();

    //Checking signer token balance before swap

    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );

    const tokenBalanceBefore = Number(
      ethers.formatUnits(expandedTokenBalanceBefore, tokenDecimals)
    );

    console.log({ tokenBalanceBefore });
    const amountIn = ethers.parseEther(amountETH);
    const minimumAmountOut = ethers.parseUnits(minAmount, tokenDecimals);

    const swap = await arbitraryERC20Swapper.swapEtherToToken(
      token,
      minAmount,
      {
        gasLimit: 300000,
        value: amountIn,
      }
    );

    const tx = await swap.wait();

    console.log("Transaction hash", tx?.hash);

    console.log("Gas used for swap: ", tx?.gasUsed.toString());

    // Check token balance of the user after swapping
    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      signer.address
    );
    const tokenBalanceAfter = Number(
      ethers.formatUnits(expandedTokenBalanceAfter, tokenDecimals)
    );

    console.log({ tokenBalanceAfter });
  });
