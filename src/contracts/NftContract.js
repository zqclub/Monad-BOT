const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class NftContract extends ContractBase {
  constructor() {
    const ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)",
    ];
    super(config.contracts.nft, ABI);
  }

  async balanceOf(address) {
    return this.getBalance(address);
  }

  async getBalance(address) {
    try {
      Utils.logger("info", `正在检查地址 ${address} 的 NFT 余额`);
      const balance = await this.contract.balanceOf(address);
      return Number(balance); // v6 返回 BigInt，直接转为 Number
    } catch (error) {
      Utils.logger("error", `检查 NFT 余额失败: ${error.message}`);
      return 0;
    }
  }

  async getTokenIds(address) {
    try {
      const balance = await this.getBalance(address);
      const tokenIds = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
        tokenIds.push(Number(tokenId)); // v6 返回 BigInt，直接转为 Number
      }
      return tokenIds;
    } catch (error) {
      Utils.logger("error", `获取 NFT tokenId 失败: ${error.message}`);
      return [];
    }
  }

  async getTokenDetails(tokenId) {
    try {
      const tokenURI = await this.contract.tokenURI(tokenId);
      return {
        tokenId: Number(tokenId), // v6 返回 BigInt，直接转为 Number
        tokenURI,
      };
    } catch (error) {
      Utils.logger("error", `获取 NFT 详情失败: ${error.message}`);
      return null;
    }
  }
}

module.exports = NftContract;
