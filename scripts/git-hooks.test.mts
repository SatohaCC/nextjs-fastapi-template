import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { installGitHooks } from "./install-git-hooks.mts";

test("コミットを遮断し、正常なコミットと既存pushフックを維持する", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "git-hook-test-"));
  const sourceRoot = path.resolve(import.meta.dirname, "..");
  const git = (...args: string[]) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
  try {
    git("init", "--quiet");
    git("config", "--local", "core.hooksPath", ".git/hooks");
    mkdirSync(path.join(root, "scripts"));
    for (const name of ["run-git-hook.mts", "check-local-paths.mts"]) cpSync(path.join(sourceRoot, "scripts", name), path.join(root, "scripts", name));
    cpSync(path.join(sourceRoot, ".githooks"), path.join(root, ".githooks"), { recursive: true });
    const previousPush = path.join(root, ".git", "hooks", "pre-push");
    writeFileSync(previousPush, "#!/bin/sh\nexit 23\n");
    chmodSync(previousPush, 0o755);
    installGitHooks(root);
    installGitHooks(root);

    const privatePath = ["C:", "Users", "example", "project"].join("/");
    writeFileSync(path.join(root, "sample.txt"), privatePath);
    git("add", "sample.txt");
    // 作業ツリーが安全でも、ステージ済みの混入を検出する。
    writeFileSync(path.join(root, "sample.txt"), "safe\n");
    const commitArgs = ["-C", root, "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "test"];
    const blocked = spawnSync("git", commitArgs, { encoding: "utf8" });
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /コミットを中止/);
    assert.equal(blocked.stderr.includes(privatePath), false);
    git("add", "sample.txt");
    const allowed = spawnSync("git", commitArgs, { encoding: "utf8" });
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.equal(spawnSync("git", ["-C", root, "hook", "run", "pre-push"]).status, 23);
  } finally {
    assert.equal(path.dirname(root), os.tmpdir());
    rmSync(root, { recursive: true, force: true });
  }
});

test("preserves parent configuration and existing commit-msg hooks", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "git-hook-test-"));
  const git = (...args: string[]) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
  try {
    git("init", "--quiet");
    git("config", "--local", "core.hooksPath", ".git/hooks");
    const nested = path.join(root, "template");
    mkdirSync(nested);
    assert.equal(installGitHooks(nested), false);
    writeFileSync(path.join(root, ".git", "hooks", "commit-msg"), "#!/bin/sh\nexit 23\n");
    assert.equal(installGitHooks(root), false);
    assert.equal(git("config", "--local", "--get", "core.hooksPath"), ".git/hooks");
    git("config", "--local", "template.previousHooksPath", ".git/hooks");
    git("config", "--local", "core.hooksPath", ".githooks");
    assert.equal(installGitHooks(root), false);
    assert.equal(
      path.resolve(git("config", "--local", "--get", "core.hooksPath")),
      path.join(root, ".git", "hooks"),
    );
  } finally {
    assert.equal(path.dirname(root), os.tmpdir());
    rmSync(root, { recursive: true, force: true });
  }
});
