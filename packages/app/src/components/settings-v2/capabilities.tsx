import { Icon } from "@opencode-ai/ui/icon"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Tag } from "@opencode-ai/ui/v2/badge-v2"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { createMemo, createResource, createSignal, For, Show, type Accessor, type Component, type JSX } from "solid-js"
import { getSessionContext } from "@/components/session/session-context-metrics"
import { DialogConnectProvider, useProviderConnectController } from "@/components/dialog-connect-provider"
import { useLanguage } from "@/context/language"
import { useServerSDK } from "@/context/server-sdk"
import { useServerSync } from "@/context/server-sync"
import { loadCommands } from "@/context/global-sync/bootstrap"
import { useProviders } from "@/hooks/use-providers"
import { showToast } from "@/utils/toast"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import "./settings-v2.css"

type ScopedProps = {
  directory: Accessor<string | undefined>
}

const mcpStatusLabels = {
  connected: "mcp.status.connected",
  failed: "mcp.status.failed",
  needs_auth: "mcp.status.needs_auth",
  needs_client_registration: "mcp.status.needs_client_registration",
  disabled: "mcp.status.disabled",
} as const

export const SettingsProviderBrowser: Component<ScopedProps> = (props) => {
  const dialog = useDialog()
  const language = useLanguage()
  const controller = useProviderConnectController()
  const providers = useProviders(props.directory)
  const open = () => {
    controller.select()
    dialog.push(
      () => <DialogConnectProvider directory={props.directory} controller={controller} />,
      () => controller.select(),
    )
  }

  return (
    <SettingsCapabilityPanel
      title={language.t("provider.connect.method.browser")}
      description={language.t("settings.navigation.browserDescription")}
    >
      <div class="settings-v2-capability-actions">
        <ButtonV2 variant="contrast" icon="plus" onClick={open}>
          {language.t("settings.navigation.browserAction")}
        </ButtonV2>
      </div>

      <SettingsListV2>
        <Show
          when={providers.connected().length > 0}
          fallback={<SettingsEmptyState>{language.t("settings.providers.connected.empty")}</SettingsEmptyState>}
        >
          <For each={providers.connected()}>
            {(provider) => (
              <div class="settings-v2-capability-row">
                <div class="settings-v2-capability-row-main">
                  <span class="settings-v2-capability-icon">
                    <Icon name="providers" size="small" />
                  </span>
                  <span class="settings-v2-capability-name">{provider.name}</span>
                </div>
                <Tag>{language.t("settings.navigation.connected")}</Tag>
              </div>
            )}
          </For>
        </Show>
      </SettingsListV2>
    </SettingsCapabilityPanel>
  )
}

export const SettingsPlugins: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const server = useServerSDK()
  const [plugins] = createResource(
    () => {
      const directory = props.directory()
      if (!directory) return
      return { directory, sdk: server() }
    },
    (input) =>
      input.sdk.client.config
        .get({ directory: input.directory })
        .then((result) => (result.data?.plugin ?? []).map((item) => (typeof item === "string" ? item : item[0]))),
    { initialValue: [] },
  )

  return (
    <SettingsCapabilityPanel
      title={language.t("status.popover.tab.plugins")}
      description={language.t("settings.navigation.pluginsDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={!plugins.loading}
            fallback={<SettingsEmptyState>{language.t("common.loading")}</SettingsEmptyState>}
          >
            <Show
              when={!plugins.error}
              fallback={<SettingsEmptyState>{language.t("common.requestFailed")}</SettingsEmptyState>}
            >
              <Show
                when={plugins().length > 0}
                fallback={<SettingsEmptyState>{language.t("settings.navigation.noItems")}</SettingsEmptyState>}
              >
                <For each={plugins()}>
                  {(plugin) => (
                    <div class="settings-v2-capability-row">
                      <div class="settings-v2-capability-row-main">
                        <span class="settings-v2-capability-icon">
                          <Icon name="puzzle" size="small" />
                        </span>
                        <span class="settings-v2-capability-name">{plugin}</span>
                      </div>
                      <Tag>{language.t("settings.navigation.configured")}</Tag>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsSkills: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const server = useServerSDK()
  const [skills] = createResource(
    () => {
      const directory = props.directory()
      if (!directory) return
      return { directory, sdk: server() }
    },
    async (input) => {
      if ((await input.sdk.protocol) === "v1") {
        return input.sdk.client.app.skills({ directory: input.directory }).then((result) => result.data ?? [])
      }
      return input.sdk.api.skill.list({ location: { directory: input.directory } }).then((result) => result.data)
    },
    { initialValue: [] },
  )

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.permissions.tool.skill.title")}
      description={language.t("settings.navigation.skillsDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={!skills.loading}
            fallback={<SettingsEmptyState>{language.t("common.loading")}</SettingsEmptyState>}
          >
            <Show
              when={!skills.error}
              fallback={<SettingsEmptyState>{language.t("common.requestFailed")}</SettingsEmptyState>}
            >
              <Show
                when={skills().length > 0}
                fallback={<SettingsEmptyState>{language.t("settings.navigation.noItems")}</SettingsEmptyState>}
              >
                <For each={skills()}>
                  {(skill) => (
                    <div class="settings-v2-capability-row settings-v2-capability-row--stacked">
                      <div class="settings-v2-capability-row-main">
                        <span class="settings-v2-capability-icon">
                          <Icon name="wand" size="small" />
                        </span>
                        <span class="settings-v2-capability-name">{skill.name}</span>
                      </div>
                      <Show when={skill.description}>
                        <span class="settings-v2-capability-description">{skill.description}</span>
                      </Show>
                      <span class="settings-v2-capability-path">{skill.location}</span>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsAgents: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const scoped = useScopedState(props.directory)
  const agents = createMemo(
    () => scoped.child()?.[0].agent.filter((agent) => agent.mode !== "primary" && !agent.hidden) ?? [],
  )

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.navigation.subagents")}
      description={language.t("settings.navigation.agentsDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={agents().length > 0}
            fallback={<SettingsEmptyState>{language.t("settings.navigation.noItems")}</SettingsEmptyState>}
          >
            <For each={agents()}>
              {(agent) => (
                <div class="settings-v2-capability-row settings-v2-capability-row--stacked">
                  <div class="settings-v2-capability-row-main">
                    <span class="settings-v2-capability-icon">
                      <Icon name="subagent" size="small" />
                    </span>
                    <span class="settings-v2-capability-name">{agent.name}</span>
                    <Show when={agent.native}>
                      <Tag>{language.t("settings.navigation.builtIn")}</Tag>
                    </Show>
                  </div>
                  <Show when={agent.description}>
                    <span class="settings-v2-capability-description">{agent.description}</span>
                  </Show>
                </div>
              )}
            </For>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsMcp: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const sync = useServerSync()
  const scoped = createMemo(() => {
    const directory = props.directory()
    if (!directory) return
    return sync().ensureDirSyncContext(directory)
  })
  const [pending, setPending] = createSignal<string>()
  const items = createMemo(() => Object.entries(scoped()?.data.mcp ?? {}).sort(([a], [b]) => a.localeCompare(b)))

  const toggle = (name: string) => {
    const directory = props.directory()
    if (!directory || pending()) return
    setPending(name)
    void sync()
      .mcp.toggle(directory, name)
      .catch((error: unknown) => {
        showToast({
          title: language.t("common.requestFailed"),
          description: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => setPending())
  }

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.mcp.title")}
      description={language.t("settings.navigation.mcpDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={scoped()?.data.mcp_ready}
            fallback={<SettingsEmptyState>{language.t("common.loading")}</SettingsEmptyState>}
          >
            <Show
              when={items().length > 0}
              fallback={<SettingsEmptyState>{language.t("dialog.mcp.empty")}</SettingsEmptyState>}
            >
              <For each={items()}>
                {([name, status]) => {
                  const statusKey = mcpStatusKey(status.status)
                  return (
                    <div class="settings-v2-capability-row settings-v2-capability-row--mcp">
                      <div class="settings-v2-capability-row-main">
                        <span
                          class="settings-v2-mcp-status"
                          classList={{
                            "settings-v2-mcp-status--success": status.status === "connected",
                            "settings-v2-mcp-status--warning":
                              status.status === "needs_auth" || status.status === "needs_client_registration",
                            "settings-v2-mcp-status--error": status.status === "failed",
                          }}
                        />
                        <span class="settings-v2-capability-name">{name}</span>
                        <Show
                          when={statusKey}
                          fallback={
                            <span class="settings-v2-capability-description">{language.t("common.loading")}</span>
                          }
                        >
                          {(key) => <span class="settings-v2-capability-description">{language.t(key())}</span>}
                        </Show>
                      </div>
                      <Switch
                        aria-label={name}
                        checked={status.status === "connected"}
                        disabled={pending() !== undefined}
                        onChange={() => toggle(name)}
                      />
                    </div>
                  )
                }}
              </For>
            </Show>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsCommands: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const server = useServerSDK()
  const [commands] = createResource(
    () => {
      const directory = props.directory()
      if (!directory) return
      return { directory, sdk: server() }
    },
    (input) =>
      loadCommands(
        input.directory,
        input.sdk.api.command,
        input.sdk.createClient({ directory: input.directory, throwOnError: true }),
        input.sdk.protocol,
      ),
    { initialValue: [] },
  )

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.commands.title")}
      description={language.t("settings.navigation.commandsDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={!commands.loading}
            fallback={<SettingsEmptyState>{language.t("common.loading")}</SettingsEmptyState>}
          >
            <Show
              when={!commands.error}
              fallback={<SettingsEmptyState>{language.t("common.requestFailed")}</SettingsEmptyState>}
            >
              <Show
                when={commands().length > 0}
                fallback={<SettingsEmptyState>{language.t("settings.navigation.noItems")}</SettingsEmptyState>}
              >
                <For each={commands()}>
                  {(command) => (
                    <div class="settings-v2-capability-row settings-v2-capability-row--stacked">
                      <div class="settings-v2-capability-row-main">
                        <span class="settings-v2-capability-icon">
                          <Icon name="console" size="small" />
                        </span>
                        <span class="settings-v2-capability-name">/{command.name}</span>
                        <Show when={command.subtask}>
                          <Tag>{language.t("settings.navigation.subtask")}</Tag>
                        </Show>
                      </div>
                      <Show when={command.description}>
                        <span class="settings-v2-capability-description">{command.description}</span>
                      </Show>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsIndex: Component<ScopedProps> = (props) => {
  const language = useLanguage()
  const scoped = useScopedState(props.directory)
  const references = createMemo(() => scoped.child()?.[0].reference.filter((reference) => !reference.hidden) ?? [])

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.navigation.index")}
      description={language.t("settings.navigation.indexDescription")}
    >
      <Show when={props.directory()} fallback={<SettingsScopeNotice />}>
        <SettingsListV2>
          <Show
            when={references().length > 0}
            fallback={<SettingsEmptyState>{language.t("settings.navigation.noItems")}</SettingsEmptyState>}
          >
            <For each={references()}>
              {(reference) => (
                <div class="settings-v2-capability-row settings-v2-capability-row--stacked">
                  <div class="settings-v2-capability-row-main">
                    <span class="settings-v2-capability-icon">
                      <Icon name="file-tree" size="small" />
                    </span>
                    <span class="settings-v2-capability-name">{reference.name}</span>
                    <Tag>
                      {language.t(
                        reference.source.type === "local" ? "settings.navigation.local" : "settings.navigation.git",
                      )}
                    </Tag>
                  </div>
                  <Show when={reference.description}>
                    <span class="settings-v2-capability-description">{reference.description}</span>
                  </Show>
                  <span class="settings-v2-capability-path">{reference.path}</span>
                </div>
              )}
            </For>
          </Show>
        </SettingsListV2>
      </Show>
    </SettingsCapabilityPanel>
  )
}

export const SettingsHooks: Component = () => {
  const language = useLanguage()
  return (
    <SettingsCapabilityPanel
      title={language.t("settings.navigation.hooks")}
      description={language.t("settings.navigation.hooksDescription")}
    >
      <SettingsReadOnlyState icon="anchor">{language.t("settings.navigation.noItems")}</SettingsReadOnlyState>
    </SettingsCapabilityPanel>
  )
}

export const SettingsUsage: Component<{ directory: Accessor<string | undefined>; sessionID?: string }> = (props) => {
  const language = useLanguage()
  const sync = useServerSync()
  const providers = useProviders(props.directory)
  const messages = createMemo(() => (props.sessionID ? (sync().session.data.message[props.sessionID] ?? []) : []))
  const info = createMemo(() => (props.sessionID ? sync().session.get(props.sessionID) : undefined))
  const context = createMemo(() => getSessionContext(messages(), [...providers.all().values()]))
  const currency = createMemo(() => new Intl.NumberFormat(language.intl(), { style: "currency", currency: "USD" }))
  const value = (item: string | number | undefined) => (item === undefined ? "—" : String(item))

  return (
    <SettingsCapabilityPanel
      title={language.t("settings.navigation.usage")}
      description={language.t("settings.navigation.usageDescription")}
    >
      <Show
        when={props.sessionID}
        fallback={
          <SettingsReadOnlyState icon="code-lines">
            {language.t("settings.navigation.sessionRequired")}
          </SettingsReadOnlyState>
        }
      >
        <Show
          when={context()}
          fallback={
            <SettingsReadOnlyState icon="code-lines">{language.t("settings.navigation.noItems")}</SettingsReadOnlyState>
          }
        >
          {(current) => (
            <SettingsListV2>
              <SettingsMetric
                label={language.t("context.stats.session")}
                value={info()?.title ?? props.sessionID ?? "—"}
              />
              <SettingsMetric label={language.t("context.stats.provider")} value={current().providerLabel} />
              <SettingsMetric label={language.t("context.stats.model")} value={current().modelLabel} />
              <SettingsMetric
                label={language.t("context.stats.totalTokens")}
                value={current().total.toLocaleString(language.intl())}
              />
              <SettingsMetric
                label={language.t("context.stats.limit")}
                value={value(current().limit?.toLocaleString(language.intl()))}
              />
              <SettingsMetric
                label={language.t("context.stats.usage")}
                value={current().usage === null ? "—" : `${current().usage}%`}
              />
              <SettingsMetric
                label={language.t("context.stats.totalCost")}
                value={currency().format(info()?.cost ?? 0)}
              />
            </SettingsListV2>
          )}
        </Show>
      </Show>
    </SettingsCapabilityPanel>
  )
}

function useScopedState(directory: Accessor<string | undefined>, mcp = false) {
  const sync = useServerSync()
  const child = createMemo(() => {
    const value = directory()
    if (!value) return
    return sync().child(value, { mcp })
  })
  return { sync, child }
}

function mcpStatusKey(status: keyof typeof mcpStatusLabels | "pending") {
  if (status === "pending") return
  return mcpStatusLabels[status]
}

const SettingsCapabilityPanel: Component<{ title: string; description: string; children: JSX.Element }> = (props) => (
  <div class="settings-v2-capability-panel">
    <div class="settings-v2-tab-header">
      <h2 class="settings-v2-tab-title">{props.title}</h2>
    </div>
    <div class="settings-v2-tab-body settings-v2-capability-body">
      <p class="settings-v2-capability-intro">{props.description}</p>
      {props.children}
    </div>
  </div>
)

const SettingsEmptyState: Component<{ children: JSX.Element }> = (props) => (
  <div class="settings-v2-capability-empty">{props.children}</div>
)

const SettingsScopeNotice: Component = () => {
  const language = useLanguage()
  return (
    <SettingsReadOnlyState icon="folder">{language.t("settings.navigation.projectRequired")}</SettingsReadOnlyState>
  )
}

const SettingsReadOnlyState: Component<{ icon: "anchor" | "code-lines" | "folder"; children: JSX.Element }> = (
  props,
) => (
  <div class="settings-v2-capability-state">
    <Icon name={props.icon} size="large" />
    <span>{props.children}</span>
  </div>
)

const SettingsMetric: Component<{ label: string; value: string }> = (props) => (
  <SettingsRowV2 title={props.label} description="">
    <span class="settings-v2-capability-metric">{props.value}</span>
  </SettingsRowV2>
)
