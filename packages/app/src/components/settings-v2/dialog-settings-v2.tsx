import { Component, createMemo, createSignal, Show, startTransition } from "solid-js"
import { Dialog } from "@opencode-ai/ui/v2/dialog-v2"
import { TabsV2 } from "@opencode-ai/ui/v2/tabs-v2"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useServer } from "@/context/server"
import { SettingsGeneralV2 } from "./general"
import { SettingsKeybinds } from "../settings-keybinds"
import { SettingsProvidersV2 } from "./providers"
import { SettingsModelsV2 } from "./models"
import "./settings-v2.css"
import { SettingsServersV2 } from "./servers"
import {
  SettingsAgents,
  SettingsCommands,
  SettingsHooks,
  SettingsIndex,
  SettingsMcp,
  SettingsPlugins,
  SettingsProviderBrowser,
  SettingsSkills,
  SettingsUsage,
} from "./capabilities"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLayout } from "@/context/layout"
import { useTabs } from "@/context/tabs"
import { useServerSync } from "@/context/server-sync"

export const DialogSettings: Component<{
  sessionID?: string
  defaultValue?: string
}> = (props) => {
  const language = useLanguage()
  const platform = usePlatform()
  const server = useServer()
  const dialog = useDialog()
  const layout = useLayout()
  const tabs = useTabs()
  const serverSync = useServerSync()
  const [tab, setTab] = createSignal(props.defaultValue ?? "general")
  const accountName = createMemo(() => server.current?.http.username || server.name || language.t("app.name.desktop"))
  const accountInitial = createMemo(() => accountName().trim().slice(0, 1).toUpperCase() || "O")
  const directory = createMemo(() => {
    const route = layout.route()
    if (route.type === "dir-new-sesssion") return route.dir
    if (route.type === "draft") {
      const draft = tabs.store.find((item) => item.type === "draft" && item.draftID === route.draftID)
      return draft?.type === "draft" ? draft.directory : undefined
    }
    if (route.type === "session") return serverSync().session.get(route.sessionId)?.directory
    return undefined
  })

  const backToWorkspace = () => dialog.close()

  const openGuide = () => platform.openExternal("https://opencode.ai/docs")

  return (
    <Dialog size="x-large" variant="settings" class="settings-v2-dialog">
      <TabsV2
        orientation="vertical"
        variant="settings"
        value={tab()}
        onChange={(value) => void startTransition(() => setTab(value))}
        class="settings-v2"
      >
        <TabsV2.List>
          <div class="settings-v2-nav-shell">
            <div class="settings-v2-nav-scroll">
              <div class="settings-v2-window-controls" aria-hidden="true">
                <Show when={platform.platform !== "desktop" || platform.os !== "macos"}>
                  <span class="settings-v2-window-control settings-v2-window-control--close" />
                  <span class="settings-v2-window-control settings-v2-window-control--minimize" />
                  <span class="settings-v2-window-control settings-v2-window-control--maximize" />
                </Show>
              </div>

              <button type="button" class="settings-v2-back" onClick={backToWorkspace}>
                <Icon name="arrow-left" size="small" />
                <span>{language.t("settings.navigation.backToWorkspace")}</span>
              </button>

              <div class="settings-v2-nav-group">
                <TabsV2.SectionTitle>{language.t("settings.navigation.section.basic")}</TabsV2.SectionTitle>
                <div class="settings-v2-nav-items">
                  <TabsV2.Trigger value="general">
                    <Icon name="sliders" size="small" />
                    {language.t("settings.tab.general")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="appearance">
                    <Icon name="palette" size="small" />
                    {language.t("settings.general.section.appearance")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="models">
                    <Icon name="models" size="small" />
                    {language.t("settings.navigation.modelSettings")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="browser">
                    <Icon name="globe" size="small" />
                    {language.t("provider.connect.method.browser")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="shortcuts">
                    <Icon name="keyboard" size="small" />
                    {language.t("settings.tab.shortcuts")}
                  </TabsV2.Trigger>
                </div>
              </div>

              <div class="settings-v2-nav-group">
                <TabsV2.SectionTitle>{language.t("settings.navigation.section.agent")}</TabsV2.SectionTitle>
                <div class="settings-v2-nav-items">
                  <TabsV2.Trigger value="plugins">
                    <Icon name="puzzle" size="small" />
                    {language.t("status.popover.tab.plugins")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="skills">
                    <Icon name="wand" size="small" />
                    {language.t("settings.permissions.tool.skill.title")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="agents">
                    <Icon name="subagent" size="small" />
                    {language.t("settings.navigation.subagents")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="mcp">
                    <Icon name="mcp" size="small" />
                    {language.t("settings.mcp.title")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="commands">
                    <Icon name="console" size="small" />
                    {language.t("settings.commands.title")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="hooks">
                    <Icon name="anchor" size="small" />
                    {language.t("settings.navigation.hooks")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="providers">
                    <Icon name="providers" size="small" />
                    {language.t("settings.providers.title")}
                  </TabsV2.Trigger>
                </div>
              </div>

              <div class="settings-v2-nav-group settings-v2-nav-group--data">
                <TabsV2.SectionTitle>{language.t("settings.navigation.section.data")}</TabsV2.SectionTitle>
                <div class="settings-v2-nav-items">
                  <TabsV2.Trigger value="index">
                    <Icon name="file-tree" size="small" />
                    {language.t("settings.navigation.index")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="usage">
                    <Icon name="code-lines" size="small" />
                    {language.t("settings.navigation.usage")}
                  </TabsV2.Trigger>
                  <TabsV2.Trigger value="servers">
                    <Icon name="server" size="small" />
                    {language.t("status.popover.tab.servers")}
                  </TabsV2.Trigger>
                </div>
              </div>

              <button type="button" class="settings-v2-guide" onClick={openGuide}>
                <Icon name="rocket" size="small" />
                <span>{language.t("settings.navigation.guide")}</span>
              </button>
            </div>

            <div class="settings-v2-account">
              <button type="button" class="settings-v2-account-profile" onClick={() => setTab("general")}>
                <span class="settings-v2-account-avatar" aria-hidden="true">
                  {accountInitial()}
                </span>
                <span class="settings-v2-account-name">{accountName()}</span>
                <span class="settings-v2-account-plan">{language.t("settings.navigation.account.plan")}</span>
              </button>
              <button
                type="button"
                class="settings-v2-account-settings"
                aria-label={language.t("settings.navigation.account.settings")}
                onClick={() => setTab("general")}
              >
                <Icon name="settings-gear" size="small" />
              </button>
            </div>
          </div>
        </TabsV2.List>
        <TabsV2.Content value="general" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} />
        </TabsV2.Content>
        <TabsV2.Content value="appearance" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} view="appearance" />
        </TabsV2.Content>
        <TabsV2.Content value="browser" class="settings-v2-panel">
          <SettingsProviderBrowser directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="plugins" class="settings-v2-panel">
          <SettingsPlugins directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="skills" class="settings-v2-panel">
          <SettingsSkills directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="agents" class="settings-v2-panel">
          <SettingsAgents directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="mcp" class="settings-v2-panel">
          <SettingsMcp directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="commands" class="settings-v2-panel">
          <SettingsCommands directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="hooks" class="settings-v2-panel">
          <SettingsHooks />
        </TabsV2.Content>
        <TabsV2.Content value="index" class="settings-v2-panel">
          <SettingsIndex directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="usage" class="settings-v2-panel">
          <SettingsUsage directory={directory} sessionID={props.sessionID} />
        </TabsV2.Content>
        <TabsV2.Content value="shortcuts" class="settings-v2-panel">
          <SettingsKeybinds v2 />
        </TabsV2.Content>
        <TabsV2.Content value="servers" class="settings-v2-panel">
          <SettingsServersV2 />
        </TabsV2.Content>
        <TabsV2.Content value="providers" class="settings-v2-panel">
          <SettingsProvidersV2 directory={directory} />
        </TabsV2.Content>
        <TabsV2.Content value="models" class="settings-v2-panel">
          <SettingsModelsV2 />
        </TabsV2.Content>
      </TabsV2>
    </Dialog>
  )
}
