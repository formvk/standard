import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/cli.ts',
  plugins: [
    typescript({
      compilerOptions: {
        declaration: false,
      },
    }),
    babel({
      babelrc: false,
      presets: [['@babel/preset-env', { modules: false, loose: true }]],
      exclude: 'node_modules/**',
    }),
    commonjs({
      extensions: ['.js'],
      ignore: [],
    }),
  ],
  output: {
    dir: './',
    entryFileNames: `bin/cli.js`,
    chunkFileNames: 'chunks/dep-[hash].js',
    format: 'esm',
    externalLiveBindings: false,
    freeze: false,
    sourcemap: true,
  },
})
