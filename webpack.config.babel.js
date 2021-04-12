import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { DefinePlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import NullPlugin from 'webpack-null-plugin';

import pkg from './package.json';

const NOT_DEV_SERVER = !process.argv[1].includes('webpack-dev-server');

/**
 * Generate the Webpack configuration object.
 *
 * @param {*} env - The environment data, as passed from the `--env` command line argument.
 * @param {*} mode - The mode, as passed from the `--mode` command line argument.
 * @returns {Object} Webpack configuration object.
 */
const webpackConfig = (env, mode) => ({
  entry: path.resolve(__dirname, 'src/main.js'),
  output: {
    filename: `[name]${NOT_DEV_SERVER ? '.[contenthash:8]' : ''}.js`,
    assetModuleFilename: `assets/[name]${NOT_DEV_SERVER ? '.[contenthash:8]' : ''}.[ext][query]`,
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
    },
  },
  stats: {
    children: false,
  },
  performance: {
    hints: false,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      name(module, chunks, cacheGroupKey) {
        return `${cacheGroupKey}`;
      },
      cacheGroups: {
        sui: {
          test: /[\\/]node_modules[\\/]semantic-ui-.*/,
          priority: 10,
        },
        vue: {
          test: /[\\/]node_modules[\\/]vue.*/,
          priority: 10,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 0,
        },
      },
    },
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            failOnError: mode === 'production',
            failOnWarning: mode === 'production',
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /(node_modules(?![\\/]ky))/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            // This is a workaround because vue-loader can't get the webpack mode
            productionMode: mode === 'production',
          },
        },
      },
      {
        // This rule may get either actual `.css` files or the style blocks from `.vue` files.
        // Here we delegate each request to use the appropriate loaders.
        test: /\.css$/,
        oneOf: [
          {
            // Handle style blocks in `.vue` files
            // Based on this query: https://github.com/vuejs/vue-loader/blob/v15.2.7/lib/codegen/styleInjection.js#L27
            resourceQuery: /^\?vue&type=style/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  esModule: false,
                },
              },
            ],
          },
          {
            // Handle regular `.css` files
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
            ],
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __LOCAL__: JSON.stringify(env.local),
      __VERSION__: JSON.stringify(pkg.version),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      favicon: path.resolve(__dirname, 'src/assets/favicon.ico'),
      minify: mode === 'production' && {
        // Defaults: https://git.io/fj8Qn
        // https://github.com/kangax/html-minifier#options-quick-reference
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
      },
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: `[name]${NOT_DEV_SERVER ? '.[contenthash:8]' : ''}.css`,
    }),
    // Use `yarn build --env analyze`
    env.analyze ? new BundleAnalyzerPlugin() : new NullPlugin(),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
  },
});

/**
 * See: https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 *
 * @param {*} env - An environment. See the environment options CLI documentation for syntax examples.
 * @param {*} argv - An options map (argv). This describes the options passed to webpack, with keys such as output-filename and optimize-minimize.
 * @returns {Object} - Webpack configuration object.
 */
export default (env = {}, argv = {}) => webpackConfig(env, argv.mode || process.env.NODE_ENV);
