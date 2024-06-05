import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { BaseContract, Contract, Network } from "ethers";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZERO_ADDRESS, getCoinsAndUniswapData, getNetworkName } from "../utils";
import { ERC20Abi } from "../utils/abis/ERC20Abi";
import {
  ArbitraryERC20Swapper,
  ArbitraryERC20Swapper__factory,
} from "../typechain-types";
import { ArbitraryERC20SwapperInterface } from "../typechain-types/contracts/ArbitraryERC20Swapper";

let feeTier = 3000;

async function swapRouterFixture() {
  let signers: HardhatEthersSigner[] = await ethers.getSigners();

  let provider: Network = await ethers.provider.getNetwork();
  let networkName = await getNetworkName(provider);
  const { uniswapContracts, coins } = await getCoinsAndUniswapData(networkName);

  // Get the list of signers
  const [signer, ...rest] = await ethers.getSigners();
  /* Deploy the ArbitraryERC20Swapper contract */
  const erc20SwapFactory: ArbitraryERC20Swapper__factory =
    await ethers.getContractFactory("ArbitraryERC20Swapper");

  const arbitraryERC20Swapper = (await upgrades.deployProxy(
    erc20SwapFactory,
    [
      signer.address,
      signer.address,
      signer.address,
      uniswapContracts.swapRouter02,
      feeTier,
      coins.WETH.address,
    ],
    {
      initializer: "initialize",
    }
  )) as unknown as ArbitraryERC20Swapper;

  return {
    provider,
    signer,
    others: rest,
    uniswapContracts,
    coins,
    arbitraryERC20Swapper,
  };
}

describe("Swap feature", async function () {
  it("Swap 0.1 ether to DAI token", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Get a new signer as the user who will do the swap
    const user = others[1];

    // Check the balance of the user
    let balance = ethers.formatUnits(await ethers.provider.getBalance(user));
    console.log({ balance });

    //Show DAI coin data
    console.log(coins.DAI);

    if (!coins.DAI) {
      expect.fail("No info for DAI token");
    }
    const token = coins.DAI;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, user);
    // Check DAI balance of the user
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      user.address
    );
    const tokenBalanceBefore = Number(
      ethers.formatUnits(expandedTokenBalanceBefore, token.decimals)
    );

    console.log({ tokenBalanceBefore });

    const amountIn = ethers.parseEther("0.1");

    //swap 0.1 ETH to DAI
    const swap = await arbitraryERC20Swapper
      .connect(user)
      .swapEtherToToken(
        token.address,
        ethers.parseUnits("100", token.decimals),
        {
          gasLimit: 300000,
          value: amountIn,
        }
      );
    swap.wait();
    // Check DAI balance of the user after swapping
    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      user.address
    );
    const tokenBalanceAfter = Number(
      ethers.formatUnits(expandedTokenBalanceAfter, token.decimals)
    );

    // Test that DAI balance is greater than the initial one
    expect(tokenBalanceAfter).is.greaterThan(tokenBalanceBefore);

    console.log({ tokenBalanceAfter });

    // Get the balance of the user
    balance = ethers.formatUnits(await ethers.provider.getBalance(user));

    console.log({ balance });
  });
  it("Swap 0.1 ether to Tether token", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Get a new signer as the user who will do the swap
    const user = others[1];

    // Check the balance of the user
    let balance = ethers.formatUnits(await ethers.provider.getBalance(user));
    console.log({ balance });

    //Show USDT coin data
    console.log(coins.USDT);

    if (!coins.USDT) {
      expect.fail("No info for USDT token");
    }
    const token = coins.USDT;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, user);
    // Check DAI balance of the user
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      user.address
    );
    const tokenBalanceBefore = Number(
      ethers.formatUnits(expandedTokenBalanceBefore, token.decimals)
    );

    console.log({ tokenBalanceBefore });

    const amountIn = ethers.parseEther("0.1");
    //swap 0.1 ETH to DAI

    const swap = await arbitraryERC20Swapper
      .connect(user)
      .swapEtherToToken(
        token.address,
        ethers.parseUnits("100", token.decimals),
        {
          gasLimit: 300000,
          value: amountIn,
        }
      );
    swap.wait();
    // Check DAI balance of the user after swapping
    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      user.address
    );
    const tokenBalanceAfter = Number(
      ethers.formatUnits(expandedTokenBalanceAfter, token.decimals)
    );

    // Test that DAI balance is greater than the initial one
    expect(tokenBalanceAfter).is.greaterThan(tokenBalanceBefore);

    console.log({ tokenBalanceAfter });

    // Get the balance of the user
    balance = ethers.formatUnits(await ethers.provider.getBalance(user));

    console.log({ balance });
  });
  it("Too little received, 1ETH = almost 4000USDT, not 5000", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Get a new signer as the user who will do the swap
    const user = others[1];

    //Show USDT coin data
    console.log(coins.USDT);

    if (!coins.USDT) {
      expect.fail("No info for USDT token");
    }
    const token = coins.USDT;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, user);
    // Check USDT balance of the signer
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );

    const amountIn = ethers.parseEther("0.1");

    //swap 0.1 ETH to USDT
    //Min amount set to 10.000USDT per ETH
    await expect(
      arbitraryERC20Swapper
        .connect(user)
        .swapEtherToToken(
          token.address,
          ethers.parseUnits("10000", token.decimals),
          {
            gasLimit: 300000,
            value: amountIn,
          }
        )
    ).to.be.revertedWith("Too little received");

    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      signer.address
    );

    expect(expandedTokenBalanceAfter).is.equal(expandedTokenBalanceBefore);
  });
});

describe("Change configuration", async function () {
  it("Change fee tier", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Get a new signer as the user who will do the swap
    const user = others[1];

    let newFeeTier = 50;

    //User does not have admin role
    await expect(arbitraryERC20Swapper.connect(user).changeFeeTier(newFeeTier))
      .to.be.reverted;

    //Deployer changes feeTier
    const tx = await arbitraryERC20Swapper.changeFeeTier(newFeeTier);
    tx.wait();

    const config = await arbitraryERC20Swapper.configuration();

    expect(config[1]).is.equal(newFeeTier);
  });

  it("Change swap router", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Get a new signer as the user who will do the swap
    const user = others[1];

    let newSwapRouterAddress = ZERO_ADDRESS;

    //User does not have admin role
    await expect(
      arbitraryERC20Swapper.connect(user).changeSwapRouter(newSwapRouterAddress)
    ).to.be.reverted;

    //Deployer changes feeTier
    const tx = await arbitraryERC20Swapper.changeSwapRouter(
      newSwapRouterAddress
    );
    tx.wait();

    const config = await arbitraryERC20Swapper.configuration();

    expect(config[0]).is.equal(newSwapRouterAddress);
  });
});

/*   it("Quoter", async () => {
    const token = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const tokenDecimals = 6;
    const ethAmount = "0.1";
    const minOut = "5000";

    const simpleSwapFactory = await ethers.getContractFactory("SimpleSwap");
    const simpleSwap = await simpleSwapFactory.deploy(
      SwapRouterAddress,
      quoterV2Address
    );
    await simpleSwap.deployed();


    let signers = await hre.ethers.getSigners();


    const [signer] = await ethers.getSigners();

    const tx = await simpleSwap.quoteExactInputSingleWETHDai(
      hre.ethers.utils.parseUnits("100", DAI_DECIMALS),
      0,
      {
        gasLimit: 300000,
      }
    );
    const answer = await tx.wait();
    console.log({ tx });
    console.log({ answer });
  }); */
