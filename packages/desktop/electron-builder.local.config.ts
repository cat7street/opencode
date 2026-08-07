import baseConfig from "./electron-builder.config.ts"

// 本地未签名打包配置(无苹果开发者证书时使用)
// 关闭公证与硬运行时,禁用签名,仅用于本地测试运行
const localConfig = {
  ...baseConfig,
  mac: {
    ...(baseConfig.mac as object),
    hardenedRuntime: false,
    notarize: false,
    sign: false,
    identity: null,
    gatekeeperAssess: false,
  },
  dmg: {
    ...(baseConfig.dmg as object),
    sign: false,
  },
}

export default localConfig
