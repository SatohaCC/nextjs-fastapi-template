import { spawnSync } from "node:child_process";
import path from "node:path";
import { checkLocalPaths } from "./check-local-paths.mts";

const root = path.resolve(import.meta.dirname, "..");
const [event, ...args] = process.argv.slice(2);
if (event !== "pre-commit" && event !== "pre-push") throw new Error("未対応のGitフックです。");

if (event === "pre-commit") {
  const problems = checkLocalPaths({ root, staged: true });
  for (const problem of problems) console.error(`${problem.file}:${problem.line}: ローカルの絶対パスを検出しました。`);
  if (problems.length) {
    console.error("コミットを中止しました。ステージ済みの内容を修正してください。");
    process.exit(1);
  }
}

const previous = spawnSync("git", ["-C", root, "config", "--local", "--get", "template.previousHooksPath"], { encoding: "utf8" });
if (previous.status !== 0 && previous.status !== 1) throw new Error("以前のGitフック設定を読み込めませんでした。");
const previousPath = previous.stdout.trim();
if (previousPath && path.resolve(root, previousPath) !== path.join(root, ".githooks")) {
  const result = spawnSync("git", ["-C", root, "-c", `core.hooksPath=${previousPath}`, "hook", "run", "--ignore-missing", event, "--", ...args], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
}
