// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// if a smaller size contract is desired, for swap purposes only IV3SwapRouter is required
/// In expenses of future upgradeability, compatibility with V2 and V3 pools is considered using swapRouter02 contract
/// Applying multicall
import "./interfaces/ISwapRouter02.sol";
import "./interfaces/IERC20Swapper.sol";
import "./interfaces/IWETH9.sol";

contract ArbitraryERC20Swapper is Initializable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable, ERC20Swapper {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");    
    //for upgradeability reasons   
    bytes32 public constant SPECIAL_ROLE = keccak256("SPECIAL_ROLE");

    /// @dev address of Uniswap router used to swap Ether to desired arbitrary token 
    /// SwapRouter02 supports swaps in both V2 and V3 pools
    /// It is an upgraded version of SwapRouter contract within Uniswap v3 protocol
    /// SwapRouter02 is mainly designed to be multicall
    /// Address is just saved as a state variable. In the future if this swap needs to be updated to a new interface,
    /// type casting this address inside the functions when needed is an easy way to work
    address private swapRouter;

    /// @dev The fee tier of the pool, used to determine the correct pool contract in which to execute the swap
    /// 0.3% fee pools (feeTier = 3000) are the rule in Uniswap v2, but V3 introduces multiple fee tiers
    /// The parameter can be set by an admin within this contract.
    uint24 private feeTier;
    
    address private wrappedETH;

    ///Two basic events when an admin makes modifications. 
    //No events for user actions in order to save gas.
   event ChangeFeeTier(uint24 feeTier);
   event ChangeSwapRouter(address swapRouter);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _defaultAdmin, address _admin, address _swapRouter,uint24 _feeTier, address _wrappedETH)
        initializer public
    {
        __Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(ADMIN_ROLE, _defaultAdmin);

        if(_admin != _defaultAdmin){
            _grantRole(ADMIN_ROLE, _admin);
        }

        swapRouter = _swapRouter;
        feeTier = _feeTier;
        wrappedETH = _wrappedETH;
    }

    /// @dev function to change
  
    function changeFeeTier(uint24 _feeTier) external onlyRole(ADMIN_ROLE){
        require(_feeTier != feeTier, "same feeTier has been given");
        feeTier = _feeTier;
        emit ChangeFeeTier(_feeTier);
    }

    function changeSwapRouter(address _swapRouter) external onlyRole(ADMIN_ROLE){

        require(_swapRouter != swapRouter, "same swap router address has been given");
        swapRouter = _swapRouter;
        emit ChangeSwapRouter(_swapRouter);
    }
   
    function swapEtherToToken(address _token, uint _minAmount) external payable whenNotPaused nonReentrant returns (uint256) {
      
        // Create the params that will be used to execute the swap
        // sqrtPriceLimitX96 sets slippage limits, omitting for simplicity
        IV3SwapRouter.ExactInputSingleParams memory params =
            IV3SwapRouter.ExactInputSingleParams({
                tokenIn: wrappedETH,
                tokenOut: _token,
                fee: feeTier,
                recipient: msg.sender,
                amountIn: msg.value,
                amountOutMinimum: _minAmount,
                sqrtPriceLimitX96: 0
            });
        // Call to exactInputSingle to executes the swap.
        // type casting swap router address
        return ISwapRouter02(swapRouter).exactInputSingle{value:msg.value}(params);

        //Note: if deadline parameter wants to be included but working with swapRouter02 is desired,
        //multicall method should be implemented with a specific deadline (UNIX timestamp)
        //function multicall(uint256 deadline, bytes[] calldata data) external payable returns (bytes[] memory results);

    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    //Non state changing functions

    function configuration() external view returns(address uniswapRouter, uint fee, address weth) {
        return (swapRouter,feeTier,wrappedETH);

    }

}

    

