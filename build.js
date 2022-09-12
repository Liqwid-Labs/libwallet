import path from 'path'

import esbuild from 'esbuild'
import alias from 'esbuild-plugin-alias'
import { wasmLoader } from 'esbuild-plugin-wasm'

const polyfills = alias({
  'zlib': path.resolve('./node_modules/browserify-zlib/lib/index.js'),
  'stream': path.resolve('./node_modules/stream-browserify/index.js'),
  'crypto': path.resolve('./node_modules/crypto-browserify/index.js'),
  'http': path.resolve('./node_modules/stream-http/index.js'),
  'https': path.resolve('./node_modules/stream-http/index.js'),
  'fs': path.resolve('./node_modules/browserify-fs/index.js'),
  'buffer': path.resolve('./node_modules/buffer/index.js'),
  'events': path.resolve('./node_modules/events/events.js'),
  'util': path.resolve('./node_modules/util/util.js'),
  'url': path.resolve('./node_modules/url/url.js'),
  'assert': path.resolve('./node_modules/assert/build/assert.js'),
  'path': path.resolve('./node_modules/path/path.js'),
  'os': path.resolve('./node_modules/os-browserify/main.js'),
  'tls': path.resolve('./node_modules/node-libs-browser/mock/tls.js'),
  'net': path.resolve('./node_modules/node-libs-browser/mock/net.js'),
})

// esbuild.build({
//   entryPoints: ['./src/index.ts'],
//   outfile: './build/index.js',
//   watch: process.argv.includes('-w') || process.argv.includes('--watch'),
//   format: 'esm',
//   bundle: true,
//   publicPath: '/',
//   sourcemap: true,
//   minify: process.argv.includes('-m') || process.argv.includes('--minify'),
//   external: ['./node_modules/*']
// })

esbuild.build({
  entryPoints: ['./src/test.ts'],
  outfile: './build/test.js',
  watch: process.argv.includes('-w') || process.argv.includes('--watch'),
  target: "esnext",
  format: 'esm',
  bundle: true,
  publicPath: '/',
  sourcemap: true,
  minify: process.argv.includes('-m') || process.argv.includes('--minify'),
  plugins: [polyfills, wasmLoader()],
  define: {
    'global': 'globalThis',
    'process.platform': '"web"',
    'process.env': '{}'
  }
})
