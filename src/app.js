const { ethers } = require("ethers");
const {
  StakingService,
  SwapService,
  TokenService,
  BeanswapService,
  KuruSwapService, // 新增引用
} = require("./services/Service");
const Utils = require("./core/Utils");
const config = require("../config/config");
const Provider = require("./core/Provider").getInstance;
const GlobalLogger = require("./core/GlobalLogger");

class Application {
  constructor() {
    this.services = {};
    this.transactionHistory = [];
    this.cycleCount = 0;
    this.tokenService = null;
    process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
  }

  handleUnhandledRejection(error) {
    GlobalLogger.log("error", `未处理拒绝: ${error.message}`);
  }

  async initialize() {
    try {
      GlobalLogger.log("info", "正在初始化服务...");
      const provider = Provider();
      this.tokenService = new TokenService();
      await this.tokenService.checkNFTAccess();
      GlobalLogger.log("info", "NFT 访问权限验证成功");

      const walletInfo = await this.tokenService.getWalletInfo();
      GlobalLogger.log("info", `钱包地址: ${walletInfo.address}`);
      GlobalLogger.log("info", `余额: ${walletInfo.balance} MON`);
      GlobalLogger.log("info", `网络: ${walletInfo.network}`);
      GlobalLogger.log("info", `代币余额: ${JSON.stringify(walletInfo.tokens)}`);

      const serviceDefinitions = {
        rubicSwap: { name: "Rubic 交换", service: SwapService },
        izumiSwap: { name: "Izumi 交换", service: SwapService },
        beanSwap: { name: "Bean 交换", service: BeanswapService },
        magmaStaking: { name: "Magma 质押", service: StakingService, address: config.contracts.magma },
        kuruSwap: { name: "Kuru 交换", service: KuruSwapService }, // 新增 KuruSwapService
      };

      for (const [key, info] of Object.entries(serviceDefinitions)) {
        GlobalLogger.log("info", `正在初始化 ${info.name}...`);
        try {
          this.services[key] = info.address ? new info.service(info.address) : new info.service();
          await this.services[key].initialize();
          GlobalLogger.log("info", `${info.name} 初始化成功`);
        } catch (error) {
          GlobalLogger.log("error", `${info.name} 初始化失败: ${error.message}`);
          throw error;
        }
        await Utils.delay(1000);
      }
      GlobalLogger.logDivider();
      return true;
    } catch (error) {
      GlobalLogger.log("error", `初始化错误: ${error.message}`);
      return false;
    }
  }

  async start() {
    try {
      GlobalLogger.showBanner();
      GlobalLogger.log("info", "正在启动 Monad 机器人...");
      GlobalLogger.logDivider();

      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error("服务初始化失败");
      }
      GlobalLogger.log("info", "所有服务初始化完成，开始执行周期...");
      GlobalLogger.logDivider();

      while (true) {
        for (let i = 0; i < config.cycles.default; i++) {
          this.cycleCount++;
          await this.runCycle();
          GlobalLogger.log("info", `当前周期: ${this.cycleCount}/${config.cycles.default}`);
          if (i < config.cycles.default - 1) {
            const delay = Utils.getRandomDelay();
            GlobalLogger.log("info", `下个周期前等待 ${delay / 1000} 秒...`);
            await Utils.delay(delay);
          }
        }
        GlobalLogger.log("info", "开始 12 小时冷却期...");
        GlobalLogger.logDivider();
        await Utils.delay(config.cycles.cooldownTime);
        this.cycleCount = 0;
        GlobalLogger.log("info", "冷却期结束，重置周期计数...");
        GlobalLogger.logDivider();
      }
    } catch (error) {
      GlobalLogger.log("error", `致命错误: ${error.message}`);
      await new Promise(() => {});
    }
  }

  async runCycle() {
    try {
      GlobalLogger.logDivider();
      const amount = Utils.getRandomAmount();
      const formattedAmount = Utils.formatAmount(amount);
      GlobalLogger.log("info", `开始第 ${this.cycleCount} 个周期，使用 ${formattedAmount} MON`);
      this.transactionHistory.push({
        time: new Date().toLocaleTimeString(),
        amount: formattedAmount,
      });
      if (this.transactionHistory.length > 10) {
        this.transactionHistory.shift();
      }
      GlobalLogger.log("info", `交易历史: ${JSON.stringify(this.transactionHistory)}`);
      
      for (const [name, service] of Object.entries(this.services)) {
        try {
          GlobalLogger.log("info", `${name}: 开始执行...`);
          if (service instanceof SwapService) {
            const wrapResult = await service.wrapMON(amount);
            GlobalLogger.log("info", `${name}: 封装 MON - ${wrapResult.status}`);
            await Utils.delay(Utils.getRandomDelay());
            const unwrapResult = await service.unwrapMON(amount);
            GlobalLogger.log("info", `${name}: 解封装 MON - ${unwrapResult.status}`);
          } else if (service instanceof BeanswapService) {
            let tokenAddress = config.contracts.beanswap.usdc;
            let swapResult = await service.swapExactETHForTokens(tokenAddress, amount);
            GlobalLogger.log("info", `${name}: MON 交换为 USDC - ${swapResult.status}`);
            await Utils.delay(Utils.getRandomDelay());
            let backAmount = Utils.getRandomAmount();
            let usdcAmount = ethers.parseUnits(ethers.formatEther(backAmount).slice(0, 8), 6);
            swapResult = await service.swapExactTokensForETH(tokenAddress, usdcAmount);
            GlobalLogger.log("info", `${name}: USDC 交换为 MON - ${swapResult.status}`);
          } else if (service instanceof KuruSwapService) { // 新增 KuruSwapService 逻辑
            const tokens = [
              config.contracts.kuruswap.chog,
              config.contracts.kuruswap.dak,
              config.contracts.kuruswap.yaki,
            ];
            const tokenSymbols = ["CHOG", "DAK", "YAKI"];
            const randomIndex = Math.floor(Math.random() * tokens.length);
            const tokenAddress = tokens[randomIndex];
            const tokenSymbol = tokenSymbols[randomIndex];

            const swapToTokenResult = await service.swapExactMONForTokens(tokenAddress, amount);
            GlobalLogger.log("info", `${name}: MON 交换为 ${tokenSymbol} - ${swapToTokenResult.status}`);
            await Utils.delay(Utils.getRandomDelay());

            const backAmount = ethers.parseUnits("0.01", 18);
            const swapToMonResult = await service.swapExactTokensForMON(tokenAddress, backAmount);
            GlobalLogger.log("info", `${name}: ${tokenSymbol} 交换为 MON - ${swapToMonResult.status}`);
          } else {
            const stakeResult = await service.stake(amount);
            GlobalLogger.log("info", `${name}: 质押 MON - ${stakeResult.status}`);
            await Utils.delay(Utils.getRandomDelay());
            const unstakeResult = await service.unstake(amount);
            GlobalLogger.log("info", `${name}: 解质押 MON - ${unstakeResult.status}`);
          }
        } catch (error) {
          GlobalLogger.log("error", `${name}: 执行出错 - ${error.message}`);
        }
      }
      const walletInfo = await this.tokenService.getWalletInfo();
      GlobalLogger.log(
        "info",
        `更新钱包信息 - 余额: ${walletInfo.balance} MON, 代币: ${JSON.stringify(walletInfo.tokens)}`
      );
      return true;
    } catch (error) {
      GlobalLogger.log("error", `周期错误: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Application;
