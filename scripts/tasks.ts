import { ChainId, Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  FeeAmount,
  getCoinsAndUniswapData,
  getERC20SwapperByNetwork,
  getNetworkName,
} from "../utils";
import { ERC20Abi } from "../utils/abis/ERC20Abi";
import { quoterV2Abi } from "../utils/abis/QuoterV2Abi";
import { QuoterV2 } from "../utils/interfaces/QuoterV2";

//Task to execute a swap, exchanging Ethereum for a specific token, receiving at least a minimum amount of tokens
task("swap", "Swap ether to token'")
  .addParam("eth", "The amount in Ether to sent (ex: 0.001 , 0.1 , 1)")
  .addParam("token", "The address of the token to receive")
  .addParam(
    "minamount",
    "The minimum amount of token user is willing to receive (ex. 2 DAI, 100 USDT)"
  )
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const amountETH: string = taskArgs.eth;
    const tokenAddress: string = taskArgs.token;
    const minAmount: string = taskArgs.minamount;

    console.log(
      `Swapping ${amountETH} Ether to token ${tokenAddress} for a minimum amount of ${minAmount}`
    );

    const { ethers } = hre; // Access ethers from HRE

    // Get signer
    const [signer, ...rest] = await ethers.getSigners();

    const signerAddress = signer.address;
    console.log({ signerAddress });

    //Get network data
    let provider = await ethers.provider.getNetwork();
    let networkName: string = await getNetworkName(provider);
    console.log({ networkName });

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

    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Not valid token address");
    }

    //Creating token contract instance

    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

    const tokenDecimals = await tokenContract.decimals();

    //Checking signer token balance before swap

    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );

    const tokenBalanceBefore = ethers.formatUnits(
      expandedTokenBalanceBefore,
      tokenDecimals
    );
    console.log({ tokenBalanceBefore });
    const amountIn = ethers.parseEther(amountETH);
    const minimumAmountOut = ethers.parseUnits(minAmount, tokenDecimals);

    const swap = await arbitraryERC20Swapper.swapEtherToToken(
      tokenAddress,
      minimumAmountOut,
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
    const tokenBalanceAfter = ethers.formatUnits(
      expandedTokenBalanceAfter,
      tokenDecimals
    );
    console.log({ tokenBalanceAfter });
  });

//Get pool information for WETH/token to receive and expected token amount to receive
task(
  "quote",
  "Get pool information for WETH/token to receive and expected token amount to receive"
)
  .addParam("fee", "Fee of the pool, 3000 is initially set in the erc20Swapper")
  .addParam("eth", "The amount in Ether to sent (ex: 0.001 , 0.1 , 1)")
  .addParam("token", "The address of the token to receive")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const amountETH: string = taskArgs.eth;
    const minAmount: string = taskArgs.minamount;

    let feeTier = Number(taskArgs.fee);

    if (Object.values(FeeAmount).includes(feeTier)) {
      feeTier = feeTier as FeeAmount;
    } else {
      feeTier = FeeAmount.MEDIUM;
    }

    const tokenAddress: string = taskArgs.token;

    console.log(
      `Getting a quote for a swap pool address for token pair WETH/${tokenAddress} and fee ${feeTier}`
    );

    const { ethers } = hre; // Access ethers from HRE

    // Get signer
    const [signer, ...rest] = await ethers.getSigners();

    const signerAddress = signer.address;
    console.log({ signerAddress });

    //Get network data
    let provider = await ethers.provider.getNetwork();
    let networkName: string = await getNetworkName(provider);

    console.log({ networkName });
    //Instantiating ERC20Swapper for selected network
    const { uniswapContracts, coins } = await getCoinsAndUniswapData(
      networkName
    );

    if (!uniswapContracts.factory) {
      throw new Error("Factory address is not defined");
    }

    if (!coins.WETH?.address) {
      throw new Error("WETH address is not defined");
    }

    let chainId = Number(provider.chainId);

    //if working with forks, considered network is sepolia.
    //change

    if (chainId == 31337 || chainId == 1337) {
      chainId = ChainId.SEPOLIA;
    }
    // Create token instances: WETH and given token
    const WETH_TOKEN = new Token(
      chainId,
      coins.WETH.address,
      18,
      "WETH",
      "Wrapped Ether"
    );

    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

    const tokenDecimals = Number(await tokenContract.decimals());

    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();

    const poolToken = new Token(
      chainId,
      tokenAddress,
      tokenDecimals,
      tokenName,
      tokenSymbol
    );

    console.log({ poolToken });

    //Estimate pool address using uniswap sdk
    const currentPoolAddress = computePoolAddress({
      factoryAddress: uniswapContracts.factory,
      tokenA: WETH_TOKEN,
      tokenB: poolToken,
      fee: feeTier,
    });

    console.log({ currentPoolAddress });

    if (!ethers.isAddress(currentPoolAddress)) {
      throw new Error("Not a valid Pool address");
    }

    // Instantiate pool

    const poolContract = new ethers.Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      signer
    );

    const [token0, token1, fee, liquidity, slot0] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

    /*   console.log([token0, token1, fee, liquidity, slot0]);
     */
    // Get quote

    if (!uniswapContracts.quoterV2) {
      throw new Error("QuoterV2 address is not defined");
    }

    console.log({ quoterV2: uniswapContracts.quoterV2 });

    const voidSigner = new ethers.VoidSigner(signer.address, signer.provider);

    const quoterContract = new ethers.Contract(
      uniswapContracts.quoterV2,
      quoterV2Abi,
      voidSigner
    ) as unknown as QuoterV2;

    const factory = await quoterContract.factory();

    // given an amount to swap,  quoteExactInput method returns a quote for the amount out for a swap over multiple pools
    //if we want to trader two tokens that do not share a pool with each other, swapping over multiple pools is requires.

    /*    console.log({
      tokenIn: WETH_TOKEN.address,
      tokenOut: tokenAddress,
      amountIn: ethers.parseEther(amountETH),
      fee,
      sqrtPriceLimitX96: 0,
    }); */

    const { amountOut } = await quoterContract
      .connect(voidSigner)
      .quoteExactInputSingle.staticCall({
        tokenIn: WETH_TOKEN.address,
        tokenOut: tokenAddress,
        amountIn: ethers.parseEther(amountETH),
        fee: BigInt(feeTier),
        sqrtPriceLimitX96: 0,
      });

    const amountOutNumber = Number(
      ethers.formatUnits(amountOut, tokenDecimals)
    );

    console.log(
      `\nIf swap is done right now, the expected token amount to receive is ${amountOutNumber} ${tokenSymbol}`
    );

    const factorDecimals = Math.pow(10, 6); //six decimals is enough to give our minamount
    const recommendedAmount =
      Math.floor(amountOutNumber * factorDecimals) / factorDecimals;

    console.log(`Maximum minamount should be: ${recommendedAmount}`);

    console.log(`\nExecute the following command to execute the swap:`);

    console.log(
      `\nnpx hardhat swap --eth ${amountETH} --token ${tokenAddress} --minamount ${recommendedAmount} --network ${networkName}`
    );
  });
