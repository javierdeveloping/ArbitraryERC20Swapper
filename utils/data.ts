export const uniswapData: UniswapData = {
  networks: {
    mainnet: {
      swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      wrappedETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    sepolia: {
      swapRouter02: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
      quoterV2: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
      wrappedETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    },
    //mock addresses
    ganache_local: {
      swapRouter02: "0x52d837F81B00cC149d399C838E657A50AAe97eCF",
      quoterV2: "0x52d837F81B00cC149d399C838E657A50AAe97eCF",
      wrappedETH: "0x52d837F81B00cC149d399C838E657A50AAe97eCF",
    },
  },
};
