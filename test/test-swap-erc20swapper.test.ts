import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Network } from "ethers";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { getCoinsAndUniswapData, getNetworkName } from "../utils";
import { ERC20Abi } from "../utils/abis/ERC20Abi";

let feeTier = 3000;

describe("ArbitraryERC20Swap", async function () {
  async function swapRouterFixture() {
    let signers: HardhatEthersSigner[] = await ethers.getSigners();

    let provider: Network = await ethers.provider.getNetwork();
    let networkName = await getNetworkName(provider);
    const { uniswapContracts, coins } = await getCoinsAndUniswapData(
      networkName
    );

    // Get the list of signers
    const [signer, ...rest] = await ethers.getSigners();
    /* Deploy the ArbitraryERC20Swapper contract */
    const erc20SwapFactory = await ethers.getContractFactory(
      "ArbitraryERC20Swapper"
    );
    const arbitraryERC20Swapper = await upgrades.deployProxy(
      erc20SwapFactory,
      [
        signer.address,
        signer.address,
        uniswapContracts.swapRouter02,
        feeTier,
        coins.WETH.address,
      ],
      {
        initializer: "initialize",
      }
    );

    return {
      provider,
      signer,
      others: rest,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    };
  }

  it("Swap 0.1 ether to DAI token", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    // Check the balance of the signer
    let balance = ethers.formatUnits(await ethers.provider.getBalance(signer));
    console.log({ balance });

    //Show USDT coin data
    console.log(coins.USDT);

    if (!coins.USDT) {
      expect.fail("This test fails automatically");
    }
    const token = coins.USDT;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, signer);
    // Check DAI balance of the signer
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );
    const tokenBalanceBefore = Number(
      ethers.formatUnits(expandedTokenBalanceBefore, token.decimals)
    );

    console.log({ tokenBalanceBefore });

    const amountIn = ethers.parseEther("0.1");
    //swap 0.1 ETH to DAI
    const swap = await arbitraryERC20Swapper.swapEtherToToken(
      token.address,
      ethers.parseUnits("100", token.decimals),
      {
        gasLimit: 300000,
        value: amountIn,
      }
    );
    swap.wait();
    // Check DAI balance of the signer after swapping
    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      signer.address
    );
    const tokenBalanceAfter = Number(
      ethers.formatUnits(expandedTokenBalanceAfter, token.decimals)
    );

    // Test that DAI balance is greater than the initial one
    expect(tokenBalanceAfter).is.greaterThan(tokenBalanceBefore);

    console.log({ tokenBalanceAfter });

    // Get the balance of the first signer
    balance = ethers.formatUnits(await ethers.provider.getBalance(signer));

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

    // Check the balance of the signer
    let balance = ethers.formatUnits(await ethers.provider.getBalance(signer));
    console.log({ balance });

    //Show USDT coin data
    console.log(coins.USDT);

    if (!coins.USDT) {
      expect.fail("This test fails automatically");
    }

    const token = coins.USDT;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, signer);
    // Check USDT balance of the signer
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );
    const tokenBalanceBefore = Number(
      ethers.formatUnits(expandedTokenBalanceBefore, token.decimals)
    );

    console.log({ tokenBalanceBefore });

    const amountIn = ethers.parseEther("0.1");
    //swap 0.1 ETH to USDT
    const swap = await arbitraryERC20Swapper.swapEtherToToken(
      token.address,
      ethers.parseUnits("100", token.decimals),
      {
        gasLimit: 300000,
        value: amountIn,
      }
    );
    swap.wait();
    // Check USDT balance of the signer after swapping
    const expandedTokenBalanceAfter = await tokenContract.balanceOf(
      signer.address
    );
    const tokenBalanceAfter = Number(
      ethers.formatUnits(expandedTokenBalanceAfter, token.decimals)
    );

    // Test that USDT balance is greater than the initial one
    expect(tokenBalanceAfter).is.greaterThan(tokenBalanceBefore);

    console.log({ tokenBalanceAfter });

    // Get the balance of the first signer
    balance = ethers.formatUnits(await ethers.provider.getBalance(signer));

    console.log({ balance });
  });
  it("Too little too received, 1ETH = almost 4000USDT, not 5000", async function () {
    const {
      signer,
      others,
      provider,
      uniswapContracts,
      coins,
      arbitraryERC20Swapper,
    } = await loadFixture(swapRouterFixture);

    //Show USDT coin data
    console.log(coins.USDT);

    if (!coins.USDT) {
      expect.fail("This test fails automatically");
    }
    const token = coins.USDT;
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, signer);
    // Check USDT balance of the signer
    const expandedTokenBalanceBefore = await tokenContract.balanceOf(
      signer.address
    );

    const amountIn = ethers.parseEther("0.1");

    //swap 0.1 ETH to USDT
    //Min amount set to 10.000USDT per ETH
    await expect(
      arbitraryERC20Swapper.swapEtherToToken(
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
