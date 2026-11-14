import path from "node:path";
import { transformAsync } from "@babel/core";

export function stylexVitePlugin({ rootDir, test = false }: { rootDir: string; test?: boolean }) {
  return {
    name: "stylex-transform",
    enforce: "pre" as const,
    async transform(code: string, id: string) {
      const filename = id.split("?")[0];
      if (
        !/\.[jt]sx?$/.test(filename) ||
        filename.includes("node_modules") ||
        !code.includes("@stylexjs/stylex")
      ) {
        return null;
      }

      const result = await transformAsync(code, {
        filename,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [
          [
            "@stylexjs/babel-plugin",
            {
              dev: false,
              test,
              runtimeInjection: true,
              aliases: { "@/*": [path.join(rootDir, "src", "*").replaceAll("\\", "/")] },
              unstable_moduleResolution: { type: "commonJS", rootDir },
            },
          ],
        ],
      });
      return result ? { code: result.code ?? code, map: null } : null;
    },
  };
}
