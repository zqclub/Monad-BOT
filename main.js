const Application = require("./src/app");
const Utils = require("./src/core/Utils");

async function main() {
  try {
    console.log("开始加载模块...");
    console.log("进入 main 函数...");
    console.log("准备启动 Monad BOT 应用程序...");
    console.log("创建 Application 实例...");
    const app = new Application();
    console.log("开始执行 app.start()...");
    await app.start();
  } catch (error) {
    console.error("启动失败:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
