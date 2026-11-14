import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function installGitHooks(root: string): void {
  const git = (...args: string[]) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
  const current = spawnSync("git", ["-C", root, "config", "--path", "--get", "core.hooksPath"], { encoding: "utf8" });
  if (current.status !== 0 && current.status !== 1) throw new Error("Gitフック設定を読み込めませんでした。");
  const currentPath = current.stdout.trim();
  const hooksDir = path.resolve(root, ".githooks");

  // 以前の設定はローカルGit設定だけに保存し、リポジトリへ書き込まない。
  if (path.resolve(root, currentPath || ".git/hooks") !== hooksDir) {
    const previous = currentPath || git("rev-parse", "--git-path", "hooks");
    git("config", "--local", "template.previousHooksPath", path.resolve(root, previous));
  }
  for (const event of ["pre-commit", "pre-push"]) chmodSync(path.join(hooksDir, event), 0o755);
  git("config", "--local", "core.hooksPath", ".githooks");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, "..");
  if (!process.env.CI && spawnSync("git", ["-C", root, "rev-parse", "--git-dir"], { stdio: "ignore" }).status === 0) {
    installGitHooks(root);
    console.log("コミット前のローカルパス検査を設定しました。");
  }
}
