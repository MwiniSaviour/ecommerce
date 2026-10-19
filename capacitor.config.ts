import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.scalmint.shop",
  appName: "Kora Market",
  webDir: "out",
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true, // removable once stable on-device
  },
};

// Live-reload during development: KORA_CAP_LIVE=<devhost>:3001
if (process.env.KORA_CAP_LIVE) {
  config.server = config.server ?? {};
  config.server.url = `http://${process.env.KORA_CAP_LIVE}`;
  config.server.cleartext = true;
}

export default config;
