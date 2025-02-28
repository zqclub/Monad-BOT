const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const Utils = require("../core/Utils");
const BeanswapContract = require("../contracts/BeanswapContract");
const config = require("../../config/config");

class BeanswapService extends BaseService {
  constructor() {
    super();
    this.beanswapContract = new BeanswapContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在通过 Beanswap 封装 ${Utils.formatAmount(amount)} MON 到 WMON`
      );
      const result = await this.beanswapContract.swapExactETHForTokens(
        require("../../config/BeanswapABI").WMON_CONTRACT,
        amount,
        this.wallet.address
      );
      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `封装 MON 失败: ${error.message}`);
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在通过 Beanswap 解封装 ${Utils.formatAmount(amount)} WMON 到 MON`
      );
      const result = await this.beanswapContract.swapExactTokensForETH(
        require("../../config/BeanswapABI").WMON_CONTRACT,
        amount,
        this.wallet.address
      );
      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `解封装 WMON 失败: ${error.message}`);
      throw error;
    }
  }

  async swapExactETHForTokens(tokenAddress, amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在用 ${Utils.formatAmount(amount)} MON 交换代币`
      );
      const result = await this.beanswapContract.swapExactETHForTokens(
        tokenAddress,
        amount,
        this.wallet.address
      );
      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `MON 到代币交换失败: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForETH(tokenAddress, amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在用代币交换 ${Utils.formatAmount(amount)} MON`
      );
      const result = await this.beanswapContract.swapExactTokensForETH(
        tokenAddress,
        amount,
        this.wallet.address
      );
      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `代币到 MON 交换失败: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForTokens(tokenAddressIn, tokenAddressOut, amount) {
    try {
      await this.checkGasPrice();
      Utils.logger("info", `正在进行代币到代币的交换`);
      const result = await this.beanswapContract.swapExactTokensForTokens(
        tokenAddressIn,
        tokenAddressOut,
        amount,
        this.wallet.address
      );
      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `代币到代币交换失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BeanswapService;
