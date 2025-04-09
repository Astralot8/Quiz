const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app.js",
  mode: 'development',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    clean: true,
  },
  devServer: {
    static: '.dist',
    compress: true,
    port: 9000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
        patterns: [
          { from: "templates", to: "templates" },
          { from: "styles", to: "styles" },
          { from: "assets/fonts", to: "fonts" },
          { from: "assets/images", to: "images" },
        ],
      }),
  ],
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: [
  //             ['@babel/preset-env', { targets: "defaults" }]
  //           ]
  //         }
  //       }
  //     }
  //   ]
  // },
};
