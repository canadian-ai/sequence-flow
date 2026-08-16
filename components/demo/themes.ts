export type ColorMode = "light" | "dark"

export interface ThemeColors {
  accent: string
  activation: string
  lifeline: string
  background: string
}

export interface Theme {
  id: string
  label: string
  light: ThemeColors
  dark: ThemeColors
}

/** Preset color themes for the sequence diagram editor. Each ships a light and dark variant. */
export const THEMES: Theme[] = [
  {
    id: "default",
    label: "Default",
    light: { accent: "#2563eb", activation: "#ffffff", lifeline: "#dc2626", background: "#ffffff" },
    dark: { accent: "#60a5fa", activation: "#18181b", lifeline: "#f87171", background: "#0a0a0a" },
  },
  {
    id: "maple",
    label: "Maple",
    light: { accent: "#c1440e", activation: "#f0dcd2", lifeline: "#b3b3b3", background: "#ffffff" },
    dark: { accent: "#e2794a", activation: "#3a2a22", lifeline: "#525252", background: "#0a0a0a" },
  },
  {
    id: "forest",
    label: "Forest",
    light: { accent: "#15803d", activation: "#dcfce7", lifeline: "#a3a3a3", background: "#ffffff" },
    dark: { accent: "#4ade80", activation: "#14532d", lifeline: "#525252", background: "#0a0a0a" },
  },
  {
    id: "grape",
    label: "Grape",
    light: { accent: "#7c3aed", activation: "#ede9fe", lifeline: "#a3a3a3", background: "#ffffff" },
    dark: { accent: "#a78bfa", activation: "#2e1065", lifeline: "#525252", background: "#0a0a0a" },
  },
  {
    id: "mono",
    label: "Mono",
    light: { accent: "#171717", activation: "#f5f5f5", lifeline: "#a3a3a3", background: "#ffffff" },
    dark: { accent: "#f5f5f5", activation: "#262626", lifeline: "#737373", background: "#0a0a0a" },
  },
]

export const DEFAULT_THEME: Theme = THEMES[0]

/** Special id used when the user is hand-picking individual colors. */
export const CUSTOM_THEME_ID = "custom"
