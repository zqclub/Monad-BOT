const fs = require("fs");
const { ethers } = require("ethers");
const GlobalLogger = require("./GlobalLogger");
const config = require("../../config/config");

class Utils {
  static getPrivateKey() {
    try {
      return fs.readFileSync(config.privateKeyPath, "utf8").trim();
    } catch (error) {
      throw new Error(`读取私钥失败: ${error.message}`);
    }
  }

  static getRandomAmount() {
    const { min, max } = config.cycles.amounts;
    const amount = Math.random() * (max - min) + min;
    return ethers.parseEther(amount.toFixed(4)); // v6 直接使用
  }

  static getRandomDelay() {
    const { min, max } = config.cycles.delays;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static formatAmount(amount) {
    return parseFloat(ethers.formatEther(amount)).toFixed(4); // v6 直接使用
  }

  static logTransaction(hash) {
    return `${config.network.explorer}${hash}`;
  }

  static logger(type, message) {
    return GlobalLogger.log(type, message);
  }
}

module.exports = Utils;
