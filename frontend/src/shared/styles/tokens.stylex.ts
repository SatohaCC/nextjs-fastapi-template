import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";

export const tokens = stylex.defineVars({
  bg: {
    default: "#fafafa",
    [DARK]: "#0b0f17",
  },
  surface: {
    default: "#ffffff",
    [DARK]: "#111827",
  },
  fg: {
    default: "#111827",
    [DARK]: "#f3f4f6",
  },
  muted: {
    default: "#6b7280",
    [DARK]: "#9ca3af",
  },
  border: {
    default: "#e5e7eb",
    [DARK]: "#1f2937",
  },
  accent: {
    default: "#2563eb",
    [DARK]: "#3b82f6",
  },
  accentFg: "#ffffff",
  ok: {
    default: "#16a34a",
    [DARK]: "#22c55e",
  },
  okBg: {
    default: "#dcfce7",
    [DARK]: "#052e16",
  },
  err: {
    default: "#dc2626",
    [DARK]: "#ef4444",
  },
  errBg: {
    default: "#fee2e2",
    [DARK]: "#450a0a",
  },
  radiusCard: "0.75rem",
  radiusControl: "0.5rem",
});
