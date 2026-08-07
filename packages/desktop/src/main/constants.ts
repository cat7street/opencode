import { app } from "electron"

type Channel = "dev" | "beta" | "prod"
const raw = import.meta.env.OPENCODE_CHANNEL
export const CHANNEL: Channel = raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const SETTINGS_STORE = "opencode.settings"
export const DEFAULT_SERVER_URL_KEY = "defaultServerUrl"
export const WSL_ENABLED_KEY = "wslEnabled"
// Local/unsigned builds set OPENCODE_DISABLE_UPDATER to opt out of the
// official electron-updater feed (which would replace this build with the
// upstream release and discard local changes).
export const UPDATER_ENABLED = app.isPackaged && CHANNEL !== "dev" && !import.meta.env.OPENCODE_DISABLE_UPDATER
