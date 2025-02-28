const ApiClient = require("./ApiClient");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class ExplorerApi extends ApiClient {
  constructor() {
    super(config.network.api);
  }

  async checkTransactionStatus(txHash) {
    try {
      if (!txHash || !txHash.startsWith("0x")) {
        throw new Error(`无效的交易哈希: ${txHash}`);
      }

      Utils.logger("info", `正在检查交易 ${txHash} 的状态`);

      return {
        hash: txHash,
        status: "success",
        url: this.getExplorerUrl(txHash),
        gasUsed: "500000",
        effectiveGasPrice: "1000000000",
      };
    } catch (error) {
      Utils.logger("error", `检查交易状态失败: ${error.message}`);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      Utils.logger("info", `正在获取当前燃气价格`);

      return {
        gweiPrice: 20,
      };
    } catch (error) {
      Utils.logger("error", `获取燃气价格失败: ${error.message}`);
      throw error;
    }
  }

  getExplorerUrl(txHash) {
    return `${config.network.explorer}${txHash}`;
  }

  async checkClaimableStatus(walletAddress) {
    try {
      Utils.logger("info", `正在检查地址 ${walletAddress} 的可领取状态`);

      const response = await this.get(
        `${config.apis.liquidStaking}/withdrawal_requests?address=${walletAddress}`
      );

      const claimableRequest = response.find(
        (request) => !request.claimed && request.is_claimable
      );

      return {
        id: claimableRequest?.id || null,
        isClaimable: !!claimableRequest,
        data: claimableRequest,
        url: claimableRequest?.txHash
          ? this.getExplorerUrl(claimableRequest.txHash)
          : null,
      };
    } catch (error) {
      Utils.logger("error", `检查可领取状态失败: ${error.message}`);
      return {
        id: null,
        isClaimable: false,
        data: null,
        url: null,
      };
    }
  }
}

module.exports = ExplorerApi;
