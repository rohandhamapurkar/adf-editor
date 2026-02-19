const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix broken @atlaskit/icon-file-type glyph imports that reference ../../src/internal/icon.tsx
      // Redirect to the actual dist/cjs/internal/icon.js
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        // Fix ESM strict resolution: process/browser -> process/browser.js
        "process/browser": require.resolve("process/browser.js"),
        [path.resolve(
          __dirname,
          "node_modules/@atlaskit/icon-file-type/src/internal/icon.tsx"
        )]: path.resolve(
          __dirname,
          "node_modules/@atlaskit/icon-file-type/dist/cjs/internal/icon.js"
        ),
      };

      // Resolve fallbacks for Node built-ins (not needed in browser)
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: false,
        stream: false,
        os: false,
        crypto: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        buffer: false,
        assert: false,
        util: false,
      };

      // Provide `process` global for Atlaskit packages that reference it directly
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        })
      );

      // Suppress source-map-loader warnings for Atlaskit packages
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            (warning.module.resource.includes("@atlaskit") ||
              warning.module.resource.includes("@atlassian"))
          );
        },
      ];

      return webpackConfig;
    },
  },
};
