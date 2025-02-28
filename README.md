# Monad BOT

## 概述
Monad BOT 是一个基于 Node.js 开发的自动交易机器人，专门为 Monad 测试网（Testnet）设计，用于执行自动化交易操作（如封装/解封装 MON、质押/解质押、通过 Beanswap 进行代币交换等）。该项目利用 `ethers.js` 与区块链交互，并通过 API（如 Blockvision 和 Monad Explorer）获取数据。

## 功能特性
- **自动化交易**：支持 MON 到 WMON 的封装/解封装、质押/解质押、Beanswap 代币交换。
- **NFT 访问验证**：需要地址持有指定NFT!~~~铸造链接:https://epic-n2m-zq.testnet.nfts2.me/
- **周期运行**：按配置执行多个交易周期，并支持冷却期。
- **Gas 价格检查**：确保燃气价格在可接受范围内。

## 安装与运行

### 克隆项目：
```bash
git clone https://github.com/ziqing888/Monad-BOT.git
cd Monad-BOT
```
### 安装依赖：
```bash
npm install
```
### 运行项目：
```bash
npm start
```

