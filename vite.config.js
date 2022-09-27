import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import wasm from "vite-plugin-wasm"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      sys: 'util',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
      punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
      url: 'rollup-plugin-node-polyfills/polyfills/url',
      string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
      http: 'rollup-plugin-node-polyfills/polyfills/http',
      https: 'rollup-plugin-node-polyfills/polyfills/http',
      os: 'rollup-plugin-node-polyfills/polyfills/os',
      assert: 'rollup-plugin-node-polyfills/polyfills/assert',
      constants: 'rollup-plugin-node-polyfills/polyfills/constants',
      _stream_duplex:
        'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
      _stream_passthrough:
        'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
      _stream_readable:
        'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
      _stream_writable:
        'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
      _stream_transform:
        'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
      timers: 'rollup-plugin-node-polyfills/polyfills/timers',
      console: 'rollup-plugin-node-polyfills/polyfills/console',
      vm: 'rollup-plugin-node-polyfills/polyfills/vm',
      zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
      tty: 'rollup-plugin-node-polyfills/polyfills/tty',
      domain: 'rollup-plugin-node-polyfills/polyfills/domain'
    }
  },
  define: {
    BROWSER_RUNTIME: true,
    process: {
      env: {
        CTL_SERVER_PORT: `8082`,
        CTL_SERVER_HOST: `markets-testnet-api.liqwid.finance`,
        CTL_SERVER_SECURE: `true`,
        // CTL_SERVER_PATH: ``,
    
        OGMIOS_PORT: `1338`,
        OGMIOS_HOST: `markets-testnet-api.liqwid.finance`,
        OGMIOS_SECURE: `true`,
        // OGMIOS_PATH: ``,
    
        DATUM_CACHE_PORT: `9998`,
        DATUM_CACHE_HOST: `markets-testnet-api.liqwid.finance`,
        DATUM_CACHE_SECURE: `true`,
        // DATUM_CACHE_PATH: ``
      }
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/liqwid-offchain/, /node_modules/],
      transformMixedEsModules: true
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'libwallet',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['rollup-plugin-node-polyfills', 'util']
    }
  },
  optimizeDeps: {
    include: ['liqwid-offchain'],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
          define: {
            'process.env.CTL_SERVER_PORT': `"8082"`,
            'process.env.CTL_SERVER_HOST': `"markets-testnet-api.liqwid.finance"`,
            'process.env.CTL_SERVER_SECURE': `"true"`,
            'process.env.OGMIOS_PORT': `"1338"`,
            'process.env.OGMIOS_HOST': `"markets-testnet-api.liqwid.finance"`,
            'process.env.OGMIOS_SECURE': `"true"`,
            'process.env.DATUM_CACHE_PORT': `"9998"`,
            'process.env.DATUM_CACHE_HOST': `"markets-testnet-api.liqwid.finance"`,
            'process.env.DATUM_CACHE_SECURE': `"true"`,
          }
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  plugins: [
    wasm(),
    rollupNodePolyFill()
  ],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
})
