const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class WMonContract extends ContractBase {
  constructor() {
    const ABI = [
      "function deposit() public payable",
      "function withdraw(uint256 amount) public",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    super(config.contracts.wmon, ABI);
  }

  async deposit(amount) {
    try {
      Utils.logger(
        "info",
        `正在存入 ${Utils.formatAmount(amount)} MON 到 WMON`
      );

      const tx = await this.call("deposit", [], {
        value: amount,
        gasLimit: BigInt(config.gas.stake),
      });

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `WMON 存入失败: ${error.message}`);
      throw error;
    }
  }

  async withdraw(amount) {
    try {
      Utils.logger(
        "info",
        `正在提取 ${Utils.formatAmount(amount)} WMON 到 MON`
      );

      try {
        const tx = await this.contract.withdraw(amount, {
          gasLimit: BigInt(config.gas.stake),
        });

        return await tx.wait();
      } catch (error) {
        if (error.message.includes("response body is not valid JSON")) {
          Utils.logger("error", `RPC 节点错误: ${error.message}`);
          throw new Error("RPC 节点返回无效响应，请稍后再试。");
        }
        throw error;
      }
    } catch (error) {
      Utils.logger("error", `WMON 提取失败: ${error.message}`);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return balance;
    } catch (error) {
      Utils.logger("error", `获取 WMON 余额失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = WMonContract;
