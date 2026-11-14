import * as stylex from "@stylexjs/stylex";
import { tokens } from "../shared/styles/tokens.stylex";

export const pageStyles = stylex.create({
  page: {
    display: "grid",
    minHeight: "100dvh",
    placeItems: "center",
    padding: "2rem",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: "32rem",
    flexDirection: "column",
    gap: "1rem",
    borderRadius: tokens.radiusCard,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tokens.border,
    backgroundColor: tokens.surface,
    padding: "1.5rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: tokens.fg,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: tokens.muted,
  },
});
