const path = require("node:path");

module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev: process.env.NODE_ENV === "development",
        test: process.env.NODE_ENV === "test",
        runtimeInjection: false,
        treeshakeCompensation: true,
        aliases: {
          "@/*": [path.join(__dirname, "src", "*").replaceAll("\\", "/")],
        },
        unstable_moduleResolution: {
          type: "commonJS",
          rootDir: __dirname,
        },
      },
    ],
  ],
};
