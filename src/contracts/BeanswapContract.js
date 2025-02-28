const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class BeanswapContract extends ContractBase {
  constructor() {
    const ABI = require("../../config/BeanswapABI").ABI;
    const routerAddress = require("../../config/BeanswapABI").ROUTER_CONTRACT;
    super(routerAddress, ABI);
    this.WMON_ADDRESS = require("../../config/BeanswapABI").WMON_CONTRACT;
  }

  async swapExactETHForTokens(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `正在准备 ETH 到代币的交换`);
      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;
      const path = [this.WMON_ADDRESS, tokenAddress];
      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];
      const gasLimit = BigInt(500000);
      const tx = await this.call(
        "swapExactETHForTokens",
        [expectedOut, path, receiverAddress, deadline],
        { value: amountIn, gasLimit }
      );
      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap ETH 到代币交换失败: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForETH(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `正在准备代币到 ETH 的交换`);
      await this.approveTokenIfNeeded(tokenAddress, amountIn, receiverAddress);
      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;
      const path = [tokenAddress, this.WMON_ADDRESS];
      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];
      const gasLimit = BigInt(500000);
      const tx = await this.call(
        "swapExactTokensForETH",
        [amountIn, expectedOut, path, receiverAddress, deadline],
        { gasLimit }
      );
      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap 代币到 ETH 交换失败: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForTokens(tokenAddressIn, tokenAddressOut, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `正在准备代币到代币的交换`);
      await this.approveTokenIfNeeded(tokenAddressIn, amountIn, receiverAddress);
      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;
      const path = [tokenAddressIn, this.WMON_ADDRESS, tokenAddressOut];
      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];
      const gasLimit = BigInt(500000);
      const tx = await this.call(
        "swapExactTokensForTokens",
        [amountIn, expectedOut, path, receiverAddress, deadline],
        { gasLimit }
      );
      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap 代币到代币交换失败: ${error.message}`);
      throw error;
    }
  }

  async approveTokenIfNeeded(tokenAddress, amount, owner) {
    const erc20ABI = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
    ];
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, this.wallet);
    const allowance = await tokenContract.allowance(owner, this.address);
    if (BigInt(allowance.toString()) < BigInt(amount.toString())) {
      Utils.logger("info", `正在为 Beanswap 批准代币`);
      const tx = await tokenContract.approve(this.address, ethers.constants.MaxUint256); // v6 使用 constants.MaxUint256
      await tx.wait();
      Utils.logger("info", `代币已为 Beanswap 批准`);
    }
  }
}

module.exports = BeanswapContract;
