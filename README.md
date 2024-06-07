# Arbitray ERC20 Swapper

## :warning: Disclaimer :warning:

:bangbang: Author CAN NOT guarantee the safety of the repository, referring to links to external webpages from files in this repository, the repository files themselves and all the primary and subsequent installed packages using installation commands.

:bangbang: The author of this repository is not responsible for the use of the repository and the security issues working with it could produce.

## Description

This project involves the development of an ERC20 Swapper based on Uniswap protocol. This swapper allows users to swap Ether to an arbitrary ERC-20 token.

This ERC20 swapper has been developed based on Uniswap V3 protocol.

<br>
There are three parameters that are set up when deploying this swapper:
<br><br>

_wrappedETH_: official wrapped Ethereum address

_feeTier_: fee user will have to pay to swap Ether to another token inside a Uniswap pool (ex: 3000 -> 0.3%)

_swapRouter_: address of Uniswap router used to swap Ether to desired arbitrary token
<br><br>

Uniswap SwapRouter02 supports swaps in both V2 and V3 pools. It is an upgraded version of SwapRouter contract within Uniswap v3 protocol and is mainly designed to be multicall.

There must be enough liquidity inside Uniswap pools in order to be able to swap Eth to desired token successfully.

ERC20 tokens such as USDT or DAI have been used to test the contract.

Current deployment:

    Sepolia:    0xA247Ca6eaaD3d8798F885cd03f3dd8EE98dB1FE5

https://sepolia.etherscan.io/address/0xa247ca6eaad3d8798f885cd03f3dd8ee98db1fe5

## Environment

1. First of all, install all dependencies executing:

   ```
   yarn
   ```

2. Make a copy of .env.template and rename it to .env

3. Set at least the following variables inside .env

   IMPORTANTE NOTE: Leaving PRODUCTION_KEY variable empty TEST_PRIVATE_KEY value will be used for production networks.

   ```
   SEPOLIA_RPC_URL=
   MAINNET_RPC_URL=
   TEST_PRIVATE_KEY=
   ```

## Test

The proposed testing process will load Uniswap and coins data related to Sepolia network by default when forking networks or using hardhat, local or localhost as network parameter.

1.  Testing deployment

    ```
    yarn run deploy-erc20swapper hardhat|localhost|local
    ```

2.  Forking Sepolia, deploying a new ERC20 Swapper, testing features and executing a swap

    2.1 Fork sepolia

    ```
    npx hardhat node --fork "paste your seporia rpc url"
    ```

    2.2 Deploying a new ERC20 Swapper, and testing features and executing a swap inside the forked network

    ```
    yarn run test-swap-erc20swapper localhost
    ```

3.  Two tasks have been developed to get quotes and execute swaps. Supposing that previous forked network is still alive, execute the following command to get the minimum amount that user will receive for a specific ETH amount.

    3.1 Get quote

    Example: Get the minimum amount of token at address 0x68194a729C2450ad26072b3D33ADaCbcef39D574 that a user would receive if they swap 0.001 ETH.

    That address corresponds to DAI token in Sepolia.

    ```
    npx hardhat quote
    --token 0x68194a729C2450ad26072b3D33ADaCbcef39D574
    --fee 3100 --eth 0.001 --network local
    ```

    This will produce a command that can be copied and executed to perform the swap.

    3.2 Executing swaps

    Copy the command produce by the get quote task or configure your own command for this task.

    ```
    npx hardhat swap --eth 0.001 --token 0x68194a729C2450ad26072b3D33ADaCbcef39D574 --minamount 2.913982 --network local
    ```

4.  **Always be aware of connecting your wallet to trusted, safe and official services**. Contract has been verified and swapEtherToken can be called from Etherscan.

    https://sepolia.etherscan.io/address/0xa247ca6eaad3d8798f885cd03f3dd8ee98db1fe5#writeProxyContract

    Example: swap 0.001 Ether to receive at least 2 DAI
    https://sepolia.etherscan.io/tx/0xb0831af70bf27ee6bbd89b2ea104a64215895cf3e2c73dea1967ffab5adf636b

        payableAmount (ether): 0.001

        _token (address): 0x68194a729C2450ad26072b3D33ADaCbcef39D574

        _minAmount (uint256): 2000000000000000000

## Executing swaps in Mainnet or Sepolia

1. Execute quote task

   ```
   npx hardhat quote --token (token address) --fee (pool fee that will be used, ex: 500,3000,10000) --eth (ETH amount, ex: 0.001, 1) --network mainnet|sepolia
   ```

   Examples:

   ```
   npx hardhat quote --token 0x6B175474E89094C44Da98b954EedeAC495271d0F --fee 3800 --eth 0.001 --network mainnet
   ```

   ```
    npx hardhat quote --token 0x68194a729C2450ad26072b3D33ADaCbcef39D574 --fee 3100 --eth 0.001 --network sepolia
   ```

2. Execute the command produced by quote task or create your own command:

   ```
   npx hardhat swap  --eth (ETH amount, ex: 0.001, 1) --token (token address)  --minamount (minium amount to receive, ex: 2.913982) --network sepolia|mainnet
   ```

   Examples:

   ```
   npx hardhat swap --eth 0.001 --token 0x6B175474E89094C44Da98b954EedeAC495271d0F --minamount 3.79969 --network mainnet
   ```

   ```
   npx hardhat swap --eth 0.001 --token 0x68194a729C2450ad26072b3D33ADaCbcef39D574 --minamount 2.913982 --network sepolia
   ```
