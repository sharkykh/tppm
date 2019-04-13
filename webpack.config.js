const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
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
            productionMode: mode === 'production'
          }
        },
      },
      {
        // This rule may get either actual `.css` files or the style blocks from `.vue` files.
        // Here we delegate each request to use the appropriate loaders.
        test: /\.css$/,
        exclude: /(node_modules)/,
        oneOf: [
          {
            // Handle style blocks in `.vue` files
            // Based on this query: https://github.com/vuejs/vue-loader/blob/v15.2.7/lib/codegen/styleInjection.js#L27
            resourceQuery: /^\?vue&type=style/,
            use: [
              'vue-style-loader',
              'css-loader'
            ]
          },
          {
            // Handle regular `.css` files
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: 'css-loader',
            }),
          }
       ]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new FileManagerPlugin({
      onEnd: {
        copy: [{
          source: 'src/index.html',
          destination: 'dist'
        }]
      }
    }),
    new VueLoaderPlugin(),
    new ExtractTextPlugin('main.css'),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    inline: true,
    watchOptions: {
      poll: true
    }
  },
});

/**
 * See: https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 *
 * @param {*} env - An environment. See the environment options CLI documentation for syntax examples.
 * @param {*} argv - An options map (argv). This describes the options passed to webpack, with keys such as output-filename and optimize-minimize.
 * @returns {Object} - Webpack configuration object.
 */
module.exports = (env = {}, argv = {}) => webpackConfig(env, argv.mode || process.env.NODE_ENV);