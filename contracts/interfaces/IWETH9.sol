// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.6;

/**
 * @title IWETH
 * @dev Interface for Wrapped Ether (WETH) token
 * @author 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses
 */
interface IWETH9 {
    function deposit() external payable;
    function withdraw(uint amount) external;
    function totalSupply() external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function transferFrom(address from, address to, uint amount) external returns (bool);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function balanceOf(address spender) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    event Approval(address indexed owner, address indexed spender, uint amount);
    event Transfer(address indexed from, address indexed to, uint amount);
    event Deposit(address indexed to, uint amount);
    event Withdrawal(address indexed from, uint amount);
}
