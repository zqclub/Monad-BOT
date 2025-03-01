const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const Utils = require("../core/Utils");
const KuruSwapContract = require("../contracts/KuruSwapContract");
const config = require("../../config/config");

class KuruSwapService extends BaseService {
  constructor() {
    super();
    this.kuruSwapContract = new KuruSwapContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `正在通过 KuruSwap 将 ${Utils.formatAmount(amount)} MON 兑换为 CHOG`
      );

      const result = await this.kuruSwapContract.swapExactMONForTokens(
        config.contracts.kuruswap.chog,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `MON 兑换 CHOG 时出错: ${error.message}`);
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger("info", `正在通过 KuruSwap 将 CHOG 兑换为 MON`);

      const chogAmount = ethers.utils.parseUnits("0.01", 18);

      const result = await this.kuruSwapContract.swapExactTokensForMON(
        config.contracts.kuruswap.chog,
        chogAmount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "成功" : "失败",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `CHOG 兑换 MON 时出错: ${error.message}`);
      throw error;
    }
  }

  async swapExactMONForTokens(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `正在通过 KuruSwap 将 ${Utils.formatAmount(amount)} MON 兑换为代币`
      );

      const result = await this.kuruSwapContract.swapExactMONForTokens(
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
      Utils.logger("error", `MON 兑换代币时出错: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForMON(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger("info", `正在通过 KuruSwap 将代币兑换为 MON`);

      const result = await this.kuruSwapContract.swapExactTokensForMON(
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
      Utils.logger("error", `代币兑换 MON 时出错: ${error.message}`);
      throw error;
    }
  }
}

module.exports = KuruSwapService;
