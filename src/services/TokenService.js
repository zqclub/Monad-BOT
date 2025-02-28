const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const NftContract = require("../contracts/NftContract");
const BlockvisionApi = require("../api/BlockvisionApi");
const Utils = require("../core/Utils");
const config = require("../../config/config");

class TokenService extends BaseService {
  constructor() {
    super();
    this.nftContract = new NftContract(config.contracts.nft);
    this.blockvisionApi = new BlockvisionApi();
  }

  async checkNFTAccess() {
    try {
      const walletAddress = this.getWalletAddress();
      Utils.logger("info", `正在检查地址 ${walletAddress} 的 NFT 余额`);
      const balance = await this.nftContract.balanceOf(walletAddress);
      if (parseInt(balance) === 0) {
        throw new Error("钱包未持有所需 NFT");
      }
      Utils.logger("info", `已验证 ${walletAddress} 的 NFT 访问权限`);
    } catch (error) {
      Utils.logger("error", `NFT 访问权限验证失败: ${error.message}`);
      throw error;
    }
  }

  async getWalletInfo() {
    const walletAddress = this.getWalletAddress();
    const balance = await this.provider.getBalance(walletAddress);
    const formattedBalance = Utils.formatAmount(balance); // 已适配 v6
    const network = await this.provider.getNetwork();
    const networkName = `Monad ${network.name}`;
    const tokens = []; // 临时跳过代币余额，返回空数组
    return {
      address: walletAddress,
      balance: formattedBalance,
      network: networkName,
      tokens,
    };
  }
}

module.exports = TokenService;
