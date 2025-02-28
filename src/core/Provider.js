const { ethers } = require("ethers");
const config = require("../../config/config");
const Utils = require("./Utils");

class Provider {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.initialize();
  }

  initialize() {
    try {
      this.provider = new ethers.JsonRpcProvider(config.network.rpc); // v6 正确用法
      const privateKey = Utils.getPrivateKey();
      if (!privateKey) {
        throw new Error("未找到私钥");
      }
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } catch (error) {
      throw new Error(`提供者初始化失败: ${error.message}`);
    }
  }

  getProvider() {
    if (!this.provider) {
      throw new Error("提供者未初始化");
    }
    return this.provider;
  }

  getWallet() {
    if (!this.wallet) {
      throw new Error("钱包未初始化");
    }
    return this.wallet;
  }

  async ensureConnection() {
    try {
      const network = await this.provider.getNetwork();
      return true;
    } catch (error) {
      Utils.logger("error", `网络连接失败: ${error.message}`);
      return false;
    }
  }
}

let providerInstance = null;

module.exports = {
  getInstance: () => {
    if (!providerInstance) {
      providerInstance = new Provider();
    }
    return providerInstance;
  },
};
