const path = require('path')
const webpack = require('webpack')
var Precss = require('precss')
var AutoPrefixer = require('autoprefixer')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const pkg = require('./package.json')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const IS_ENV_PRO = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    RecordPlayerUI: ['./src/RecordPlayer/UserInterfaces.tsx'],
    webview: ['./src/webview/index.ts'],
    DrawPluginUI: ['./src/DrawPluginUI/toolbarUI.tsx'],
  },
  watchOptions: {
    // 不监听的 node_modules 目录下的文件
    ignored: /node_modules/,
  },
  output: {
    // path: path.resolve(__dirname, 'ppt', 'js'),
    path: path.resolve(__dirname, 'dist'),
    filename: IS_ENV_PRO ? `[name].${pkg.version}.js` : `[name].js`,
    library: '[name]',
    libraryTarget: 'umd',
  },

  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true
  },

  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    // new webpack.optimize.UglifyJsPlugin({
    //   mangle: true,
    //   compress: {
    //     warnings: false // Suppress uglification warnings
    //   }
    // }),
  },
  module: {
    noParse: [/pako|eventemitter3/],
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          'babel-loader',
          'ts-loader'
        ],
        exclude: /node_modules|sdk/
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules|sdk/
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader']
      },
      {
        test: /\.(css|less)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              context: path.resolve(__dirname, 'context'),
              camelCase: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                Precss(),
                AutoPrefixer()
              ]
            }
          }

        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css', '.less'],
    // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
    // mainFields: ['jsnext:main', 'browser', 'main'],
    alias: {
      react: 'preact',
      preact: path.resolve(__dirname, './node_modules/preact/dist/preact.min.js'),
      pako: path.resolve(__dirname, './node_modules/pako/dist/pako.min.js'),
      eventemitter3: path.resolve(__dirname, './node_modules/eventemitter3/umd/eventemitter3.min.js'),
      // 'eventemitter3': './emitter'
    }
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false,
      'process.env': {
        BABEL_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
  ],

  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-eval-source-map',

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: 9000,
    hot: true,
    bonjour: true,
    historyApiFallback: true,
    open: true,
    proxy: {
      // // OPTIONAL: proxy configuration:
      // '/optional-prefix/**': { // path pattern to rewrite
      //   target: 'http://target-host.com',
      //  pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
      // }
    }
  }
}
