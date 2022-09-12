import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack/lib/index.js'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  mode: 'development',
  entry: './src/test.ts',
  experiments: {
    asyncWebAssembly: false,
    layers: false,
    lazyCompilation: false,
    outputModule: true,
    syncWebAssembly: true,
    topLevelAwait: true,
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'test.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      buffer: resolve('buffer/'),
      http: false,
      url: false,
      stream: false,
      crypto: false,
      https: false,
      net: false,
      tls: false,
      zlib: false,
      os: false,
      path: false,
      fs: false,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      BROWSER_RUNTIME: true
    }),
    new NodePolyfillPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ContextReplacementPlugin(/cardano-serialization-lib-browser/),
    new webpack.ContextReplacementPlugin(/cardano-serialization-lib-nodejs/),
  ]
}
