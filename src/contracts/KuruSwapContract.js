const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");
const {
  ROUTER_ABIS,
  KURU_UTILS_ABIS,
  MON_ADDRESS,
} = require("../../config/KuruSwapABI");
const axios = require("axios");

class KuruSwapContract extends ContractBase {
  constructor() {
    super(config.contracts.kuruswap.router, ROUTER_ABIS);
    this.utilsAddress = config.contracts.kuruswap.utils;
    this.monAddress = MON_ADDRESS;

    const provider = this.provider;
    this.utilsContract = new ethers.Contract(
      this.utilsAddress,
      KURU_UTILS_ABIS,
      this.wallet
    );
  }

  async getTokenDecimals(tokenAddress) {
    try {
      if (tokenAddress === this.monAddress) {
        return 18;
      }

      const tokenABI = ["function decimals() external view returns (uint8)"];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        this.provider
      );
      return await tokenContract.decimals();
    } catch (error) {
      Utils.logger("error", `获取代币小数位时出错: ${error.message}`);
      return 18;
    }
  }

  async approveTokenIfNeeded(tokenAddress, amount) {
    try {
      const tokenABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        this.wallet
      );
      const allowance = await tokenContract.allowance(
        this.wallet.address,
        this.address
      );

      if (BigInt(allowance.toString()) < BigInt(amount.toString())) {
        Utils.logger("info", `正在为 KuruSwap 授权代币`);
        const tx = await tokenContract.approve(this.address, ethers.MaxUint256);
        await tx.wait();
        Utils.logger("info", `代币已为 KuruSwap 授权`);
      }
    } catch (error) {
      Utils.logger("error", `授权代币时出错: ${error.message}`);
      throw error;
    }
  }

  async findPool(sourceToken, targetToken) {
    try {
      const response = await axios.post(
        "https://api.testnet.kuru.io/api/v1/markets/filtered",
        {
          pairs: [
            {
              baseToken: sourceToken,
              quoteToken: targetToken,
            },
          ],
        },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        return response.data.data[0].market;
      }

      const invertedResponse = await axios.post(
        "https://api.testnet.kuru.io/api/v1/markets/filtered",
        {
          pairs: [
            {
              baseToken: targetToken,
              quoteToken: sourceToken,
            },
          ],
        },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
          },
        }
      );

      if (
        invertedResponse.data &&
        invertedResponse.data.data &&
        invertedResponse.data.data.length > 0
      ) {
        return invertedResponse.data.data[0].market;
      }

      throw new Error(`未找到该代币对的池子`);
    } catch (error) {
      Utils.logger("error", `查找池子时出错: ${error.message}`);
      throw error;
    }
  }

  async swapExactMONForTokens(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `正在准备在 KuruSwap 上将 MON 兑换为代币`);

      const poolAddress = await this.findPool(this.monAddress, tokenAddress);
      Utils.logger("info", `使用池子: ${poolAddress}`);

      const utilsIsBuy = [false];

      const priceForOne = await this.utilsContract.calculatePriceOverRoute(
        [poolAddress],
        utilsIsBuy
      );

      const ONE = ethers.WeiPerEther;
      let expectedOut =
        (BigInt(amountIn.toString()) * BigInt(priceForOne.toString())) /
        BigInt(ONE.toString());

      const slippageFactor = 85n;
      const slippageDivisor = 100n;
      const expectedOutWithSlippage =
        (expectedOut * slippageFactor) / slippageDivisor;

      Utils.logger(
        "info",
        `预期输出: ${expectedOutWithSlippage.toString()}`
      );

      const isBuy = [true];
      const nativeSend = [true];
      const debitToken = this.monAddress;
      const creditToken = tokenAddress;

      const randomGasLimit =
        Math.floor(Math.random() * (280000 - 180000 + 1)) + 180000;
      const gasLimit = BigInt(randomGasLimit);

      const tx = await this.call(
        "anyToAnySwap",
        [
          [poolAddress],
          isBuy,
          nativeSend,
          debitToken,
          creditToken,
          amountIn,
          expectedOutWithSlippage,
        ],
        {
          value: amountIn,
          gasLimit: gasLimit,
        }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `KuruSwap MON 兑换代币出错: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForMON(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `正在准备在 KuruSwap 上将代币兑换为 MON`);

      await this.approveTokenIfNeeded(tokenAddress, amountIn);

      const poolAddress = await this.findPool(tokenAddress, this.monAddress);
      Utils.logger("info", `使用池子: ${poolAddress}`);

      const utilsIsBuy = [true];

      const priceForOne = await this.utilsContract.calculatePriceOverRoute(
        [poolAddress],
        utilsIsBuy
      );

      const ONE = ethers.WeiPerEther;
      let expectedOut =
        (BigInt(amountIn.toString()) * BigInt(priceForOne.toString())) /
        BigInt(ONE.toString());

      const slippageFactor = 85n;
      const slippageDivisor = 100n;
      const expectedOutWithSlippage =
        (expectedOut * slippageFactor) / slippageDivisor;

      Utils.logger(
        "info",
        `预期输出: ${expectedOutWithSlippage.toString()}`
      );

      const isBuy = [false];
      const nativeSend = [false];
      const debitToken = tokenAddress;
      const creditToken = this.monAddress;

      const randomGasLimit =
        Math.floor(Math.random() * (280000 - 180000 + 1)) + 180000;
      const gasLimit = BigInt(randomGasLimit);

      const tx = await this.call(
        "anyToAnySwap",
        [
          [poolAddress],
          isBuy,
          nativeSend,
          debitToken,
          creditToken,
          amountIn,
          expectedOutWithSlippage,
        ],
        { gasLimit: gasLimit }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `KuruSwap 代币兑换 MON 出错: ${error.message}`);
      throw error;
    }
  }
}

module.exports = KuruSwapContract;
