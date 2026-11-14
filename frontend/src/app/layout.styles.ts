import * as stylex from "@stylexjs/stylex";
import { tokens } from "../shared/styles/tokens.stylex";

export const layoutStyles = stylex.create({
  body: { backgroundColor: tokens.surface, color: tokens.onSurface },
});
