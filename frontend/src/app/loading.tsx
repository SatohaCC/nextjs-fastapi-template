import * as stylex from "@stylexjs/stylex";
import { statusPageStyles as s } from "./status-page.styles";

/** ルート遷移時に表示する標準ローディング UI。 */
export default function Loading() {
  return (
    <main {...stylex.props(s.page)}>
      <div role="status" aria-live="polite" aria-busy="true" {...stylex.props(s.loadingBox)}>
        <span aria-hidden="true" {...stylex.props(s.spinner)} />
        <span>読み込み中...</span>
      </div>
    </main>
  );
}
