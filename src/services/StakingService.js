const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const StakingContract = require("../contracts/StakingContract");
const Utils = require("../core/Utils");
const config = require("../../config/config");

class StakingService extends BaseService {
  constructor(contractAddress) {
    super();
    this.contractAddress = contractAddress;
    this.stakingContract = new StakingContract(contractAddress);
  }

  async stake(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在质押 ${Utils.formatAmount(amount)} MON 到 ${this.contractAddress}`
      );
      const result = await this.stakingContract.stake(amount);
      return result;
    } catch (error) {
      Utils.logger("error", `质押失败: ${error.message}`);
      throw error;
    }
  }

  async unstake(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在从 ${this.contractAddress} 解质押 ${Utils.formatAmount(amount)}`
      );
      const result = await this.stakingContract.unstake(amount);
      return result;
    } catch (error) {
      Utils.logger("error", `解质押失败: ${error.message}`);
      throw error;
    }
  }

  async getStakedBalance() {
    const walletAddress = this.getWalletAddress();
    return await this.stakingContract.getStakedBalance(walletAddress);
  }
}

module.exports = StakingService;
