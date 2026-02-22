const webpack = require("webpack");
const path = require("path");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

// process.env.GENERATE_SOURCEMAP = "false";

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source maps in production to reduce bundle size
      if (webpackConfig.mode === "production") {
        webpackConfig.devtool = false;
      }

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
        (warning) => {
          return (
            warning.module &&
            warning.module.resource &&
            (warning.module.resource.includes("@atlaskit") ||
              warning.module.resource.includes("@atlassian"))
          );
        },
      ];

      // Configure splitChunks - ONLY in production to avoid dev server hangs
      if (webpackConfig.mode === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          runtimeChunk: 'single',
          splitChunks: {
            ...webpackConfig.optimization?.splitChunks,
            chunks: 'all',
            // Keep chunks reasonably sized and limit the total number to avoid thousands of tiny files
            minSize: 50 * 1024,
            maxInitialRequests: 30,
            maxAsyncRequests: 30,
            cacheGroups: {
              ...webpackConfig.optimization?.splitChunks?.cacheGroups,
              atlaskitVendor: {
                test: /[\\/]node_modules[\\/](@atlaskit|@atlassian)[\\/]/,
                name: 'vendor-atlaskit',
                priority: 20,
                chunks: 'all',
                enforce: true,
              },
              reactVendor: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react-vendor',
                priority: 15,
                chunks: 'all',
                enforce: true,
              },
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 5,
                chunks: 'all',
                enforce: true,
              },
            },
          },
        };
      }

      // Add BundleAnalyzerPlugin
      // webpackConfig.plugins.push(
      //   new BundleAnalyzerPlugin({
      //     analyzerMode: "static",
      //     reportFilename: "bundle-report.html",
      //     openAnalyzer: false,
      //   })
      // );

      return webpackConfig;
    },
  },
};
