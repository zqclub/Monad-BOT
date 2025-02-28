const Provider = require("../core/Provider").getInstance;
const Utils = require("../core/Utils");
const ExplorerApi = require("../api/ExplorerApi");
const config = require("../../config/config");

class BaseService {
  constructor() {
    try {
      const providerInstance = Provider();
      this.provider = providerInstance.getProvider();
      this.wallet = providerInstance.getWallet();
      this.utils = Utils;
      this.explorerApi = new ExplorerApi();
    } catch (error) {
      Utils.logger("error", `基础服务初始化失败: ${error.message}`);
      throw error;
    }
  }

  async initialize() {
    try {
      await this.provider.getNetwork();
      return true;
    } catch (error) {
      Utils.logger("error", `服务初始化失败: ${error.message}`);
      return false;
    }
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();
      Utils.logger(
        "info",
        `正在通过 Beanswap 封装 ${Utils.formatAmount(amount)} MON 到 WMON`
      );
      const result = await this.beanswapContract.swapExactETHForTokens(
        this.beanswapContract.WMON_ADDRESS,
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
        this.beanswapContract.WMON_ADDRESS,
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

  async handleTransaction(tx) {
    try {
      const response = await tx.wait();
      return {
        status: response.status === 1 ? "成功" : "失败",
        txHash: response.hash,
        url: Utils.logTransaction(response.hash),
      };
    } catch (error) {
      Utils.logger("error", `交易处理失败: ${error.message}`);
      throw error;
    }
  }

  async checkGasPrice() {
    const gasPrice = await this.explorerApi.getGasPrice();
    if (gasPrice && gasPrice.gweiPrice > config.gas.maxGwei) {
      throw new Error(`燃气价格过高: ${gasPrice.gweiPrice} gwei`);
    }
    return gasPrice;
  }

  getWalletAddress() {
    return this.wallet.address;
  }
}

module.exports = BaseService;
