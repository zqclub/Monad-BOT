const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class StakingContract extends ContractBase {
  constructor(address) {
    const ABI = [
      "function stake() external payable",
      "function unstake(uint256 amount) external",
      "function claimRewards() external",
      "function balanceOf(address account) external view returns (uint256)",
    ];

    super(address, ABI);
  }

  async stake(amount) {
    try {
      Utils.logger(
        "info",
        `正在质押 ${Utils.formatAmount(amount)} MON 到 ${this.address}`
      );

      const tx = {
        to: this.address,
        data: "0xd5575982",
        gasLimit: BigInt(config.gas.stake),
        value: amount,
      };

      Utils.logger(
        "debug",
        `发送交易: ${JSON.stringify(tx, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )}`
      );

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger("info", `质押交易已发送: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "成功" : "失败",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `质押失败: ${error.message}`);
      throw error;
    }
  }

  async unstake(amount) {
    try {
      Utils.logger(
        "info",
        `正在从 ${this.address} 解质押 ${Utils.formatAmount(amount)}`
      );

      const formattedAmount = amount.toString(16).padStart(64, "0");

      const tx = {
        to: this.address,
        data: "0x6fed1ea7" + formattedAmount,
        gasLimit: BigInt(config.gas.unstake),
      };

      Utils.logger(
        "debug",
        `发送解质押交易: ${JSON.stringify(tx, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )}`
      );

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger("info", `解质押交易已发送: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "成功" : "失败",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `解质押失败: ${error.message}`);
      throw error;
    }
  }

  async claimRewards() {
    try {
      Utils.logger("info", `正在从 ${this.address} 领取奖励`);

      const tx = {
        to: this.address,
        data: "0x4e71d92d",
        gasLimit: BigInt(config.gas.claim),
      };

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger("info", `领取奖励交易已发送: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "成功" : "失败",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `领取奖励失败: ${error.message}`);
      throw error;
    }
  }

  async getStakedBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return balance;
    } catch (error) {
      Utils.logger("error", `获取质押余额失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StakingContract;
