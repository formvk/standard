import { DEFAULT_EXTENSIONS } from '@babel/core'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { kebabCase, pascalCase } from 'change-case'
import path from 'node:path'
import type { OutputOptions, RollupOptions, WarningHandlerWithDefault } from 'rollup'
import { rollup } from 'rollup'
import dts from 'rollup-plugin-dts'
import externalGlobals from 'rollup-plugin-external-globals'
import ignoreImport from 'rollup-plugin-ignore-import'
import css from 'rollup-plugin-import-css'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import postcss from 'rollup-plugin-postcss'
import { getBuilderConfig, pkg } from '../shared'
import { cwd } from '../shared/utils'

const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

const parseName = () => {
  const name = String(pkg?.name || '')
  const scope = kebabCase(name.match(/@([^\/]+)\//)?.[1] as string)
  const moduleName = kebabCase(name.replace(/@[^\/]+\//, ''))
  const filename = scope ? `${scope}.${moduleName}` : moduleName
  const rootName = scope ? `${pascalCase(scope)}.${pascalCase(moduleName)}` : pascalCase(moduleName)
  return { name, filename, scope, moduleName, rootName }
}

const buildAll = async (inputs: RollupOptions[]) => {
  for (const input of inputs) {
    const { output, ...options } = input
    const bundle = await rollup(options)
    await bundle.write(output as OutputOptions)
  }
}

const getPresets = async () => {
  const builderConfigs = await getBuilderConfig()
  const externals = {
    vue: 'Vue',
    'ant-design-vue': 'antd',
    '@ant-design/icons': 'icons',
    '@formily/reactive-vue': 'Formily.ReactiveVue',
    '@formily/reactive': 'Formily.Reactive',
    '@formily/path': 'Formily.Path',
    '@formily/shared': 'Formily.Shared',
    '@formily/validator': 'Formily.Validator',
    '@formily/core': 'Formily.Core',
    '@formily/json-schema': 'Formily.JSONSchema',
    '@formily/vue': 'Formily.Vue',
    ...builderConfigs.externals,
  }
  return [
    typescript({
      tsconfig: './tsconfig.build.json',
      compilerOptions: {
        module: 'ESNext',
        declaration: false,
      },
    }),
    css(),
    resolve({
      browser: true,
      extensions,
    }),
    commonjs(),
    babel({
      // https://babeljs.io/docs/en/options#rootMode
      rootMode: 'upward', // 向上级查找 babel.config.js
      exclude: [/\/@babel\//, /\/core-js\//],
      babelHelpers: 'runtime',
      extensions,
    }),
    externalGlobals(externals),
  ]
}

const createEnvPlugin = (env = 'development') => {
  return injectProcessEnv(
    {
      NODE_ENV: env,
    },
    {
      exclude: '**/*.{css,less,sass,scss}',
      verbose: false,
    }
  )
}

export const buildUmd = async () => {
  const builderConfigs = await getBuilderConfig()
  const { name, filename, moduleName, rootName } = parseName()
  const onwarn: WarningHandlerWithDefault = (warning, warn) => {
    // ignore 'this' rewrite with 'undefined' warn
    if (warning.code === 'THIS_IS_UNDEFINED') return
    warn(warning) // this requires Rollup 0.46
  }

  const presets = await getPresets()
  const configs: RollupOptions[] = [
    {
      input: 'src/index.ts',
      output: {
        format: 'umd',
        file: path.resolve(cwd, `dist/${filename}.umd.development.js`),
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        ignoreImport({
          extensions: ['.scss', '.css', '.less'],
          body: 'export default undefined;',
        }),
        ...presets,
        createEnvPlugin(),
      ],
      onwarn,
    },
    {
      input: 'src/index.ts',
      output: {
        format: 'umd',
        file: path.resolve(cwd, `dist/${filename}.umd.production.js`),
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        postcss({
          extract: path.resolve(cwd, `dist/${moduleName}.css`),
          minimize: true,
          sourceMap: true,
          use: {
            less: {
              javascriptEnabled: true,
            },
            sass: {},
            stylus: {},
          },
        }),
        ...presets,
        terser(),
        createEnvPlugin('production'),
      ],
      onwarn,
    },
  ]
  if (builderConfigs.bundleDts) {
    configs.push(
      {
        input: 'esm/index.d.ts',
        output: {
          format: 'es',
          file: `dist/${filename}.d.ts`,
        },
        plugins: [dts()],
      },
      {
        input: 'esm/index.d.ts',
        output: {
          format: 'es',
          file: `dist/${filename}.all.d.ts`,
        },
        plugins: [
          dts({
            respectExternal: true,
          }),
        ],
      }
    )
  }
  await buildAll(configs)
}
