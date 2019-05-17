import path from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
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
    filename: `[name]${NOT_DEV_SERVER ? '.[contenthash]' : ''}.js`,
    path: path.resolve(__dirname, 'dist'),
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
    runtimeChunk: {
      name: 'main',
    },
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
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
              'css-loader',
            ],
          },
          {
            // Handle regular `.css` files
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  hmr: !NOT_DEV_SERVER,
                  reloadAll: true,
                },
              },
              'css-loader',
            ],
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: `images/[name]${NOT_DEV_SERVER ? '.[hash]' : ''}.[ext]`,
        },
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: `fonts/[name]${NOT_DEV_SERVER ? '.[hash]' : ''}.[ext]`,
          },
        },
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // eslint-disable-next-line captialized-comments
      // favicon: './src/favicon.ico',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: `[name]${NOT_DEV_SERVER ? '.[contenthash]' : ''}.css`,
    }),
    env.analyze ? new BundleAnalyzerPlugin() : new NullPlugin(),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    inline: true,
    overlay: true,
    watchOptions: {
      poll: true,
    },
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
