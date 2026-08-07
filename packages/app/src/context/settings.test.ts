import { describe, expect, test } from "bun:test"
import { initialAgentVisibility } from "./settings"

describe("agent visibility", () => {
  test("shows the picker for existing profiles and hides it for first-time installs", () => {
    expect(initialAgentVisibility(undefined, true)).toBe(true)
    expect(initialAgentVisibility(undefined, false)).toBe(false)
  })

  test("shows the picker when updating from a recent release", () => {
    expect(initialAgentVisibility(undefined, false, "1.18.8")).toBe(true)
  })

  test("preserves the preference after initialization", () => {
    expect(initialAgentVisibility(true, true, "1.18.8")).toBeUndefined()
    expect(initialAgentVisibility(true, false)).toBeUndefined()
  })
})
