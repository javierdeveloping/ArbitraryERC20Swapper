interface UniswapContracts {
  swapRouter?: string;
  swapRouter02: string;
  quoterV2?: string;
  wrappedETH: string;
}

interface UniswapNetworks {
  sepolia?: UniswapContracts;
  mainnet?: UniswapContracts;
  ganache_local?: UniswapContracts;
}

interface UniswapData {
  networks: UniswapNetworks;
}
