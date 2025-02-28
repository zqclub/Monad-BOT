const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const WMonContract = require("../contracts/WMonContract");
const Utils = require("../core/Utils");
const config = require("../../config/config");

class SwapService extends BaseService {
  constructor() {
    super();
    this.wmonContract = new WMonContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger("info", `正在封装 ${Utils.formatAmount(amount)} MON 到 WMON`);
      const receipt = await this.wmonContract.deposit(amount);
      return {
        status: receipt.status === 1 ? "成功" : "失败",
        txHash: receipt.hash,
        url: Utils.logTransaction(receipt.hash),
      };
    } catch (error) {
      Utils.logger("error", `封装 MON 失败: ${error.message}`);
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger("info", `正在解封装 ${Utils.formatAmount(amount)} WMON 到 MON`);
      const receipt = await this.wmonContract.withdraw(amount);
      return {
        status: receipt.status === 1 ? "成功" : "失败",
        txHash: receipt.hash,
        url: Utils.logTransaction(receipt.hash),
      };
    } catch (error) {
      Utils.logger("error", `解封装 WMON 失败: ${error.message}`);
      throw error;
    }
  }

  async getWMonBalance() {
    try {
      const walletAddress = this.getWalletAddress();
      const balance = await this.wmonContract.getBalance(walletAddress);
      return balance;
    } catch (error) {
      Utils.logger("error", `获取 WMON 余额失败: ${error.message}`);
      throw error;
    }
  }

  async estimateWrapGas(amount) {
    try {
      const gasEstimate = await this.wmonContract.estimateGas("deposit", [], { value: amount });
      return gasEstimate;
    } catch (error) {
      Utils.logger("error", `估算封装燃气费用失败: ${error.message}`);
      throw error;
    }
  }

  async estimateUnwrapGas(amount) {
    try {
      const gasEstimate = await this.wmonContract.estimateGas("withdraw", [amount]);
      return gasEstimate;
    } catch (error) {
      Utils.logger("error", `估算解封装燃气费用失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SwapService;
