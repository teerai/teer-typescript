import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const isProd = process.env.NODE_ENV === 'production'
  const nodeEnv = process.env.NODE_ENV || 'development'

  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: !isProd,
    clean: true,
    target: ['es2020', 'chrome91', 'firefox90', 'safari14', 'edge91'],
    minify: isProd,
    treeshake: isProd,
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    },
    external: [],
    platform: 'neutral',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.js' : '.cjs',
      }
    },
  }
})
