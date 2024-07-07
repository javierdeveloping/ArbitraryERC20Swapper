const { ethers, upgrades } = require("hardhat");

async function validateUpgrade() {
  const ArbitraryERC20Swapper = await ethers.getContractFactory(
    "ArbitraryERC20Swapper"
  );
  const ArbitraryERC20SwapperV2 = await ethers.getContractFactory(
    "ArbitraryERC20SwapperV2"
  );
  await upgrades.validateUpgrade(
    ArbitraryERC20Swapper,
    ArbitraryERC20SwapperV2
  );
}

validateUpgrade()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
