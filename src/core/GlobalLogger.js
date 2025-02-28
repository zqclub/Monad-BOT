const chalk = require("chalk");
const figlet = require("figlet");
const gradient = require("gradient-string");

chalk.enabled = true;
process.env.FORCE_COLOR = "1"; 


const STYLES = {
  DIVIDER: chalk.hex("#2A2A2A")("━".repeat(50)),
  SMALL_DIVIDER: chalk.grey("─".repeat(50)),
  ICONS: {
    SUCCESS: chalk.green("✅"),
    WARN: chalk.yellow("⚠️"),
    ERROR: chalk.red("❌"),
    PROGRESS: chalk.cyan("⏳"),
  },
  COLORS: {
    TIMESTAMP: chalk.grey,      
    LEVEL: chalk.blue,         
    MESSAGE: chalk.green,    
    SERVICE: chalk.cyan,      
    ADDRESS: chalk.hex("#7ED8F8"),
    VALUE: chalk.hex("#FFD700"),
    EMPHASIS: chalk.hex("#00FF88"),
    MINOR: chalk.grey,
  },
};

// 定义日志级别
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || "info"] || 1;

class GlobalLogger {
  static #bannerCache = null;

  static showBanner() {
    if (!this.#bannerCache) {
      const title = figlet.textSync("Monad BOT", {
        font: "Slant",
        horizontalLayout: "default",
        verticalLayout: "default",
      });
      this.#bannerCache = gradient(["#00FF88", "#00D8FF", "#0066FF"])(title);
    }
    console.log(this.#bannerCache);
    console.log(
      chalk
        .bgHex("#1A1A2A")
        .hex("#00FF88")(" 加入我们：电报频道：https://t.me/ksqxszq ") +
        STYLES.COLORS.VALUE("  v1.0.0") +
        "\n" +
        STYLES.DIVIDER +
        "\n" +
        STYLES.COLORS.EMPHASIS("关注推特：@qklxsqf获得更多资讯") +
        "\n" +
        STYLES.DIVIDER
    );
    console.log(
      STYLES.COLORS.TIMESTAMP(
        `启动于 ${new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`
      )
    );
    console.log(STYLES.DIVIDER + "\n");
  }

  static log(type, message) {
    const level = LOG_LEVELS[type.toLowerCase()] || 1;
    if (level < LOG_LEVEL) return;

    const timestamp = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    const logEntry = `${STYLES.COLORS.TIMESTAMP(`[${timestamp}]`)} ${STYLES.COLORS.LEVEL(`[${type.toUpperCase()}]`)} ${STYLES.COLORS.MESSAGE(message)}`;
    switch (type.toLowerCase()) {
      case "info":
        console.log(STYLES.ICONS.SUCCESS + " " + logEntry);
        break;
      case "error":
        console.error(STYLES.ICONS.ERROR + " " + logEntry);
        break;
      case "warn":
        console.warn(STYLES.ICONS.WARN + " " + logEntry);
        break;
      case "debug":
        console.log(STYLES.ICONS.PROGRESS + " " + logEntry);
        break;
      default:
        console.log(logEntry);
    }
    return logEntry;
  }

  static logDivider() {
    console.log(STYLES.SMALL_DIVIDER);
  }

 
  }


module.exports = GlobalLogger;
