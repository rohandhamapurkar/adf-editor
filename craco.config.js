const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
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
