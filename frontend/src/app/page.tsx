import * as stylex from "@stylexjs/stylex";
import { HealthStatusContainer } from "@/features/health/HealthStatusContainer";
import { pageStyles } from "./page.styles";

export default function HomePage() {
  return (
    <main {...stylex.props(pageStyles.page)}>
      <section {...stylex.props(pageStyles.card)}>
        <div>
          <h1 {...stylex.props(pageStyles.title)}>Realtime Voice</h1>
          <p {...stylex.props(pageStyles.subtitle)}>Next.js + FastAPI + StyleX + Biome + Ruff</p>
        </div>
        <HealthStatusContainer />
      </section>
    </main>
  );
}
